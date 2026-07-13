import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../config/database';
import { asyncHandler, AppError } from '../../middleware/errorHandler';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { sendSuccess, sendCreated, buildPaginationMeta } from '../../utils/response';
import { sendOrderConfirmationEmail } from '../../utils/email';
import { logger } from '../../utils/logger';

const router = Router();
router.use(authenticate);

const createOrderSchema = z.object({
  addressId: z.string().min(1),
  couponCode: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// POST /api/orders — create from cart
router.post('/', validate(createOrderSchema), asyncHandler(async (req, res) => {
  const { addressId, couponCode, notes } = req.body as {
    addressId: string; couponCode?: string; notes?: string;
  };
  const userId = req.user!.sub;

  const order = await db.$transaction(async (tx) => {
    // Fetch cart with items
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { select: { title: true, handle: true, images: { take: 1, orderBy: { position: 'asc' } } } },
                inventory: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Your cart is empty', 400);
    }

    // Validate address belongs to user
    const address = await tx.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new AppError('Address not found', 404);

    // Stock check and reserve
    for (const item of cart.items) {
      const avail = (item.variant.inventory?.quantity ?? 0) - (item.variant.inventory?.reserved ?? 0);
      if (avail < item.quantity) {
        throw new AppError(`Insufficient stock for ${item.variant.product.title} (${item.variant.title})`, 400);
      }
      await tx.inventory.update({
        where: { variantId: item.variantId },
        data: { reserved: { increment: item.quantity } },
      });
    }

    // Compute totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.variant.price) * item.quantity, 0,
    );

    let discount = 0;
    let couponId: string | undefined;

    if (couponCode) {
      const coupon = await tx.coupon.findFirst({
        where: {
          code: couponCode.toUpperCase(),
          isActive: true,
          AND: [
            { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
            { OR: [{ usageLimit: null }, { usageLimit: null }] }, // checked in-app below
          ],
        },
      });

      if (!coupon) throw new AppError('Invalid or expired coupon code', 400);
      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        throw new AppError('Coupon usage limit reached', 400);
      }
      if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
        throw new AppError(`Minimum order value ₹${coupon.minOrderValue} required`, 400);
      }

      discount = coupon.discountType === 'PERCENTAGE'
        ? Math.min(subtotal * Number(coupon.value) / 100, coupon.maxDiscount ? Number(coupon.maxDiscount) : Infinity)
        : Number(coupon.value);

      couponId = coupon.id;
      await tx.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
    }

    const shippingCharge = subtotal >= 999 ? 0 : 99; // Free shipping above ₹999
    const total = subtotal - discount + shippingCharge;

    // Create order
    const newOrder = await tx.order.create({
      data: {
        userId,
        addressId,
        couponId,
        subtotal,
        discount,
        shippingCharge,
        total,
        notes,
        items: {
          create: cart.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            priceSnapshot: item.variant.price,
            titleSnapshot: item.variant.product.title,
            variantSnapshot: item.variant.title,
            imageSnapshot: item.variant.product.images[0]?.src,
          })),
        },
        payment: {
          create: { amount: total, status: 'PENDING' },
        },
      },
      select: {
        id: true, status: true, subtotal: true, discount: true,
        shippingCharge: true, total: true, createdAt: true,
        payment: { select: { id: true, status: true } },
      },
    });

    // Clear cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  // Send confirmation email (non-blocking)
  const user = await db.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
  if (user) {
    sendOrderConfirmationEmail(user.email, user.name, order.id, Number(order.total)).catch((e) =>
      logger.error('Order confirmation email failed:', e),
    );
  }

  sendCreated(res, order, 'Order placed successfully');
}));

// GET /api/orders — user's order history
router.get('/', asyncHandler(async (req, res) => {
  const page = parseInt(req.query['page'] as string) || 1;
  const limit = Math.min(50, parseInt(req.query['limit'] as string) || 10);
  const skip = (page - 1) * limit;
  const userId = req.user!.sub;

  const [total, orders] = await Promise.all([
    db.order.count({ where: { userId } }),
    db.order.findMany({
      where: { userId },
      select: {
        id: true, status: true, total: true, createdAt: true, trackingNumber: true,
        items: {
          select: { quantity: true, titleSnapshot: true, imageSnapshot: true, priceSnapshot: true },
        },
        payment: { select: { status: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
    }),
  ]);

  sendSuccess(res, orders, 'Orders fetched', 200, buildPaginationMeta(total, page, limit));
}));

// GET /api/orders/:id — order detail
router.get('/:id', asyncHandler(async (req, res) => {
  const order = await db.order.findFirst({
    where: { id: req.params['id'], userId: req.user!.sub },
    select: {
      id: true, status: true, subtotal: true, discount: true,
      shippingCharge: true, tax: true, total: true, notes: true,
      trackingNumber: true, createdAt: true, shippedAt: true, deliveredAt: true,
      address: true,
      coupon: { select: { code: true, discountType: true, value: true } },
      items: {
        select: {
          id: true, quantity: true, priceSnapshot: true,
          titleSnapshot: true, variantSnapshot: true, imageSnapshot: true,
          variant: { select: { id: true, title: true } },
        },
      },
      payment: true,
    },
  });

  if (!order) throw new AppError('Order not found', 404);
  sendSuccess(res, order);
}));



export default router;
