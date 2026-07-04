import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../config/database';
import { asyncHandler, AppError } from '../../middleware/errorHandler';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { sendSuccess, sendCreated } from '../../utils/response';

const router = Router();

const createCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FLAT']),
  value: z.number().positive(),
  minOrderValue: z.number().positive().optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

const validateCouponSchema = z.object({
  code: z.string().min(1),
  orderTotal: z.number().positive(),
});

// POST /api/coupons/validate — check if a coupon is valid (public, for checkout UI)
router.post('/validate', authenticate, validate(validateCouponSchema), asyncHandler(async (req, res) => {
  const { code, orderTotal } = req.body as { code: string; orderTotal: number };

  const coupon = await db.coupon.findFirst({
    where: {
      code: code.toUpperCase(),
      isActive: true,
      OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }],
      AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }],
    },
  });

  if (!coupon) throw new AppError('Invalid or expired coupon', 400);

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError('Coupon usage limit reached', 400);
  }

  if (coupon.minOrderValue && orderTotal < Number(coupon.minOrderValue)) {
    throw new AppError(`Minimum order value ₹${coupon.minOrderValue} required`, 400);
  }

  const discount =
    coupon.discountType === 'PERCENTAGE'
      ? Math.min(
          orderTotal * (Number(coupon.value) / 100),
          coupon.maxDiscount ? Number(coupon.maxDiscount) : Infinity,
        )
      : Math.min(Number(coupon.value), orderTotal);

  sendSuccess(res, {
    id: coupon.id,
    code: coupon.code,
    discountType: coupon.discountType,
    value: Number(coupon.value),
    discount: Math.round(discount * 100) / 100,
    description: coupon.description,
  }, 'Coupon applied');
}));

// Admin CRUD
router.use(requireAdmin);

router.get('/', authenticate, asyncHandler(async (_req, res) => {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, coupons);
}));

router.post('/', authenticate, validate(createCouponSchema), asyncHandler(async (req, res) => {
  const existing = await db.coupon.findUnique({ where: { code: req.body.code } });
  if (existing) throw new AppError('Coupon code already exists', 409);

  const coupon = await db.coupon.create({ data: req.body });
  sendCreated(res, coupon, 'Coupon created');
}));

router.patch('/:id', authenticate, asyncHandler(async (req, res) => {
  const coupon = await db.coupon.update({
    where: { id: req.params['id'] as string },
    data: req.body,
  });
  sendSuccess(res, coupon, 'Coupon updated');
}));

router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  await db.coupon.update({
    where: { id: req.params['id'] as string },
    data: { isActive: false },
  });
  sendSuccess(res, null, 'Coupon deactivated');
}));

export default router;
