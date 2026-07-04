import { Router } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { db } from '../../config/database';
import { asyncHandler, AppError } from '../../middleware/errorHandler';
import { authenticate } from '../../middleware/auth';
import { paymentLimiter } from '../../middleware/rateLimit';
import { sendSuccess } from '../../utils/response';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

const router = Router();

const getRazorpay = () =>
  new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });

// POST /api/payments/create-order — create Razorpay order for a given order
router.post('/create-order', paymentLimiter, authenticate, asyncHandler(async (req, res) => {
  const { orderId } = req.body as { orderId: string };
  if (!orderId) throw new AppError('orderId is required', 400);

  const order = await db.order.findFirst({
    where: { id: orderId, userId: req.user!.sub },
    select: { id: true, total: true, payment: { select: { id: true, status: true } } },
  });

  if (!order) throw new AppError('Order not found', 404);
  if (order.payment?.status === 'PAID') throw new AppError('Order already paid', 400);

  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new AppError('Payment gateway not configured', 503);
  }

  const razorpay = getRazorpay();
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(Number(order.total) * 100), // paise
    currency: 'INR',
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
}));

// POST /api/payments/verify — verify payment signature after frontend callback
router.post('/verify', authenticate, asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body as {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    orderId: string;
  };

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new AppError('Missing payment verification fields', 400);
  }

  // Verify signature
  const expectedSig = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSig !== razorpaySignature) {
    logger.warn('Payment signature verification failed', { orderId, razorpayOrderId });
    throw new AppError('Payment verification failed', 400);
  }

  // Update payment and order status
  await db.$transaction([
    db.payment.update({
      where: { orderId },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        status: 'PAID',
      },
    }),
    db.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
    }),
  ]);

  // Release inventory reservations and deduct actual stock
  const orderItems = await db.orderItem.findMany({ where: { orderId } });
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

  sendSuccess(res, { verified: true }, 'Payment verified successfully');
}));

// POST /api/payments/webhook — Razorpay webhook (no auth, verify signature)
router.post('/webhook', asyncHandler(async (req, res) => {
  const webhookSignature = req.headers['x-razorpay-signature'] as string;
  const body = JSON.stringify(req.body);

  const expectedSig = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSig !== webhookSignature) {
    logger.warn('Invalid Razorpay webhook signature');
    res.status(400).json({ success: false, message: 'Invalid signature' });
    return;
  }

  const event = req.body as { event: string; payload: { payment: { entity: { order_id: string; id: string } } } };
  logger.info('Razorpay webhook received:', event.event);

  if (event.event === 'payment.failed') {
    const orderId = event.payload.payment.entity.order_id;
    const payment = await db.payment.findFirst({ where: { razorpayOrderId: orderId } });
    if (payment) {
      await db.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
    }
  }

  res.json({ success: true });
}));

export default router;
