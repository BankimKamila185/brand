import { Router } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { db } from "../../config/database";
import { asyncHandler, AppError } from "../../middleware/errorHandler";
import { authenticate } from "../../middleware/auth";
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

// POST /api/payments/create-order — create Razorpay order for a given order
router.post(
  "/create-order",
  paymentLimiter,
  authenticate,
  asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    if (!orderId) throw new AppError("orderId is required", 400);

    const order = await db.order.findFirst({
      where: { id: orderId, userId: req.user.sub },
      select: {
        id: true,
        total: true,
        payment: { select: { id: true, status: true } },
      },
    });

    if (!order) throw new AppError("Order not found", 404);
    if (order.payment?.status === "PAID")
      throw new AppError("Order already paid", 400);

    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new AppError("Payment gateway not configured", 503);
    }

    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(order.total) * 100), // paise
      currency: "INR",
      receipt: order.id.slice(-16),
      notes: { orderId: order.id },
    });

    // Save razorpay order id
    await db.payment.update({
      where: { orderId: order.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    sendSuccess(res, {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: env.RAZORPAY_KEY_ID,
    });
  }),
);

// POST /api/payments/verify — verify payment signature after frontend callback
router.post(
  "/verify",
  authenticate,
  asyncHandler(async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } =
      req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new AppError("Missing payment verification fields", 400);
    }

    // 1. Verify order exists and belongs to the authenticated user
    const order = await db.order.findFirst({
      where: { id: orderId, userId: req.user.sub },
      include: { payment: true },
    });

    if (!order) throw new AppError("Order not found", 404);
    if (!order.payment) {
      throw new AppError("Payment record not found for this order", 400);
    }
    if (order.payment.status === "PAID") {
      throw new AppError("Order already paid", 400);
    }

    // 2. Verify Razorpay order ID matches stored payment record
    if (order.payment.razorpayOrderId !== razorpayOrderId) {
      throw new AppError("Payment does not match this order", 400);
    }

    // 3. Verify Razorpay signature
    const expectedSig = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSig !== razorpaySignature) {
      logger.warn("Payment signature verification failed", {
        orderId: order.id,
        razorpayOrderId,
      });
      throw new AppError("Payment verification failed", 400);
    }

    // Update payment and order status, and clear user's cart
    await db.$transaction([
      db.payment.update({
        where: { orderId: order.id },
        data: {
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

    // Release inventory reservations and deduct actual stock
    const orderItems = await db.orderItem.findMany({
      where: { orderId: order.id },
    });
    await Promise.all(
      orderItems.map((item) =>
        db.inventory.update({
          where: { variantId: item.variantId },
          data: {
            quantity: { decrement: item.quantity },
            reserved: { decrement: item.quantity },
          },
        }),
      ),
    );

    // Send order confirmation email to Customer & Admin
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

    sendSuccess(res, { verified: true }, "Payment verified successfully");
  }),
);

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
