import { Router } from "express";
import { z } from "zod";
import { db } from "../../config/database.js";
import { asyncHandler, AppError } from "../../middleware/errorHandler.js";
import { authenticate, optionalAuth, requireAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { sendSuccess, sendCreated } from "../../utils/response.js";

const router = Router();

const createCouponSchema = z.object({
  code: z.string().min(2).max(25).toUpperCase(),
  description: z.string().optional().nullable(),
  discountType: z.enum(["PERCENTAGE", "FLAT"]).default("PERCENTAGE").optional(),
  value: z.number().positive(),
  minOrderValue: z.number().positive().optional().nullable(),
  maxDiscount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  userLimit: z.number().int().positive().optional().nullable(),
  startsAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
});

const validateCouponSchema = z.object({
  code: z.string().min(1),
  orderTotal: z.number().positive(),
});

// POST /api/coupons/validate — check if a coupon is valid (public, for checkout UI)
router.post(
  "/validate",
  optionalAuth,
  validate(validateCouponSchema),
  asyncHandler(async (req, res) => {
    const { code, orderTotal } = req.body;

    const coupon = await db.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }],
        AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }],
      },
    });

    if (!coupon) throw new AppError("Invalid or expired coupon", 400);

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError("Coupon usage limit reached", 400);
    }

    if (req.user?.id && coupon.userLimit) {
      const userUsageCount = await db.order.count({
        where: {
          userId: req.user.id,
          couponId: coupon.id,
          status: { not: "CANCELLED" },
        },
      });
      if (userUsageCount >= coupon.userLimit) {
        throw new AppError("You have already used this coupon", 400);
      }
    }

    if (coupon.minOrderValue && orderTotal < Number(coupon.minOrderValue)) {
      throw new AppError(
        `Minimum order value ₹${coupon.minOrderValue} required`,
        400,
      );
    }

    const discount =
      coupon.discountType === "PERCENTAGE"
        ? Math.min(
            orderTotal * (Number(coupon.value) / 100),
            coupon.maxDiscount ? Number(coupon.maxDiscount) : Infinity,
          )
        : Math.min(Number(coupon.value), orderTotal);

    sendSuccess(
      res,
      {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        value: Number(coupon.value),
        discount: Math.round(discount * 100) / 100,
        description: coupon.description,
      },
      "Coupon applied",
    );
  }),
);

// Admin CRUD
router.use(authenticate, requireAdmin);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    sendSuccess(res, coupons);
  }),
);

router.post(
  "/",
  validate(createCouponSchema),
  asyncHandler(async (req, res) => {
    const existing = await db.coupon.findUnique({
      where: { code: req.body.code },
    });
    if (existing) throw new AppError("Coupon code already exists", 409);

    const coupon = await db.coupon.create({ data: req.body });
    sendCreated(res, coupon, "Coupon created");
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const coupon = await db.coupon.update({
      where: { id: req.params["id"] },
      data: req.body,
    });
    sendSuccess(res, coupon, "Coupon updated");
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await db.coupon.update({
      where: { id: req.params["id"] },
      data: { isActive: false },
    });
    sendSuccess(res, null, "Coupon deactivated");
  }),
);

export default router;
