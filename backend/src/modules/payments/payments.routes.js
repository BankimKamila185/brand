import { Router } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { db } from "../../config/database";
import { asyncHandler, AppError } from "../../middleware/errorHandler";
import { optionalAuth } from "../../middleware/auth";
import { paymentLimiter } from "../../middleware/rateLimit";
import { sendSuccess } from "../../utils/response";
import { env } from "../../config/env";
import { logger } from "../../utils/logger";
import { sendOrderConfirmationEmail } from "../../utils/email";

const router = Router();

const getRazorpay = () =>
  new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });

/**
 * Controller to handle order creation for Razorpay.
 * Supports both standalone { amount, currency, receipt } payload (paise, min 100)
 * and Tevar application { orderId } payload.
 */
export const createOrderHandler = asyncHandler(async (req, res) => {
  const { amount, currency = "INR", receipt, orderId } = req.body;

  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new AppError("Payment gateway credentials not configured", 500);
  }

  let finalAmountInPaise;
  let receiptId = receipt || `receipt_${Date.now()}`;
  let dbOrder = null;

  if (orderId) {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    dbOrder = await db.order.findFirst({
      where: { id: orderId, userId: req.user.sub },
      select: {
        id: true,
        total: true,
        payment: { select: { id: true, status: true } },
      },
    });

    if (!dbOrder) throw new AppError("Order not found", 404);
    if (dbOrder.payment?.status === "PAID") {
      throw new AppError("Order already paid", 400);
    }

    finalAmountInPaise = Math.round(Number(dbOrder.total) * 100);
    receiptId = dbOrder.id.slice(-16);
  } else {
    if (amount === undefined || amount === null) {
      throw new AppError("amount or orderId is required", 400);
    }
    finalAmountInPaise = Number(amount);
  }

  // Validate amount >= 100 paise
  if (isNaN(finalAmountInPaise) || finalAmountInPaise < 100) {
    throw new AppError("Amount must be at least 100 paise", 400);
  }

  try {
    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: finalAmountInPaise,
      currency: currency || "INR",
      receipt: receiptId,
      notes: dbOrder ? { orderId: dbOrder.id } : {},
    });

    if (dbOrder && dbOrder.payment) {
      await db.payment.update({
        where: { orderId: dbOrder.id },
        data: { razorpayOrderId: razorpayOrder.id },
      });
    }

    return res.status(200).json({
      success: true,
      order_id: razorpayOrder.id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    logger.error("Razorpay API order creation failed:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      error.message || "Failed to create Razorpay order",
      error.statusCode || 500,
    );
  }
});

/**
 * Controller to handle payment signature verification.
 * HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 */
export const verifyPaymentHandler = asyncHandler(async (req, res) => {
  const razorpayOrderId =
    req.body.order_id || req.body.razorpay_order_id || req.body.razorpayOrderId;
  const razorpayPaymentId =
    req.body.payment_id || req.body.razorpay_payment_id || req.body.razorpayPaymentId;
  const razorpaySignature =
    req.body.razorpay_signature || req.body.razorpaySignature;
  const { orderId } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new AppError("Missing payment verification fields", 400);
  }

  if (!env.RAZORPAY_KEY_SECRET) {
    throw new AppError("Payment gateway secret not configured", 500);
  }

  // 1. Verify Razorpay signature
  const expectedSig = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSig !== razorpaySignature) {
    logger.warn("Payment signature verification failed", {
      razorpayOrderId,
      razorpayPaymentId,
    });
    throw new AppError("Signature mismatch", 400);
  }

  // 2. If tied to a application order in DB, update status
  if (orderId && req.user) {
    const order = await db.order.findFirst({
      where: { id: orderId, userId: req.user.sub },
      include: { payment: true },
    });

    if (order && order.payment && order.payment.status !== "PAID") {
      await db.$transaction([
        db.payment.update({
          where: { orderId: order.id },
          data: {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            status: "PAID",
          },
        }),
        db.order.update({
          where: { id: order.id },
          data: { status: "CONFIRMED" },
        }),
        db.cartItem.deleteMany({
          where: {
            cart: {
              userId: req.user.sub,
            },
          },
        }),
      ]);

      // Release inventory reservations and deduct stock
      const orderItems = await db.orderItem.findMany({
        where: { orderId: order.id },
      });
      await Promise.all(
        orderItems.map((item) =>
          db.inventory
            .update({
              where: { variantId: item.variantId },
              data: {
                quantity: { decrement: item.quantity },
                reserved: { decrement: item.quantity },
              },
            })
            .catch(() => {}),
        ),
      );

      // Send confirmation email
      const orderDetails = await db.order.findUnique({
        where: { id: order.id },
        select: {
          total: true,
          user: { select: { name: true, email: true } },
        },
      });
      if (orderDetails?.user) {
        const customerName =
          orderDetails.user.name ||
          orderDetails.user.email?.split("@")[0] ||
          "Customer";
        sendOrderConfirmationEmail(
          orderDetails.user.email,
          customerName,
          order.id,
          Number(orderDetails.total),
        ).catch((e) =>
          logger.error("Order payment confirmation email failed:", e),
        );
      }
    }
  }

  return sendSuccess(
    res,
    { verified: true, status: "success" },
    "Payment verified successfully",
  );
});

// POST /api/payments/create-order
router.post("/create-order", paymentLimiter, optionalAuth, createOrderHandler);

// POST /api/payments/verify
router.post("/verify", optionalAuth, verifyPaymentHandler);

// POST /api/payments/webhook — Razorpay webhook (no auth, verify signature)
router.post(
  "/webhook",
  asyncHandler(async (req, res) => {
    const webhookSignature = req.headers["x-razorpay-signature"];
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body
      : typeof req.body === "string"
      ? req.body
      : JSON.stringify(req.body);

    const expectedSig = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expectedSig !== webhookSignature) {
      logger.warn("Invalid Razorpay webhook signature");
      res.status(400).json({ success: false, message: "Invalid signature" });
      return;
    }

    const event = Buffer.isBuffer(req.body)
      ? JSON.parse(req.body.toString("utf-8"))
      : typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;
    logger.info("Razorpay webhook received:", event.event);

    if (event.event === "payment.failed") {
      const razorpayOrderId = event.payload?.payment?.entity?.order_id;
      if (razorpayOrderId) {
        const payment = await db.payment.findFirst({
          where: { razorpayOrderId },
        });
        if (payment) {
          await db.payment.update({
            where: { id: payment.id },
            data: { status: "FAILED" },
          });
        }
      }
    }

    res.json({ success: true });
  }),
);

export default router;
