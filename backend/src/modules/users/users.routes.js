import { Router } from "express";
import { z } from "zod";
import { db } from "../../config/database";
import { asyncHandler, AppError } from "../../middleware/errorHandler";
import { authenticate, requireAdmin } from "../../middleware/auth";
import { validate, validateQuery } from "../../middleware/validate";
import { sendSuccess, sendCreated, buildPaginationMeta } from "../../utils/response";

const router = Router();
router.use(authenticate);

const addressSchema = z.object({
  label: z.string().default("Home"),
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(15),
  line1: z.string().min(5).max(255),
  line2: z.string().optional(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().regex(/^\d{6}$/, "Invalid PIN code"),
  country: z.string().default("India"),
  isDefault: z.boolean().default(false),
});

const adminUsersQuerySchema = z.object({
  page: z.string().optional().transform((value) => Math.max(1, Number.parseInt(value || "1", 10) || 1)),
  limit: z.string().optional().transform((value) => Math.min(100, Math.max(1, Number.parseInt(value || "20", 10) || 20))),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
});

const updateRoleSchema = z.object({ role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]) });

// GET /api/users/me — own profile
router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const user = await db.user.findUnique({
      where: { id: req.user.sub },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        avatar: true,
        createdAt: true,
      },
    });
    if (!user) throw new AppError("User not found", 404);
    sendSuccess(res, user);
  }),
);

// PATCH /api/users/me — update profile
router.patch(
  "/me",
  asyncHandler(async (req, res) => {
    const { name, phone, avatar } = req.body;
    const user = await db.user.update({
      where: { id: req.user.sub },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
      },
      select: { id: true, name: true, email: true, phone: true, avatar: true },
    });
    sendSuccess(res, user, "Profile updated");
  }),
);

// GET /api/users/me/addresses
router.get(
  "/me/addresses",
  asyncHandler(async (req, res) => {
    const addresses = await db.address.findMany({
      where: { userId: req.user.sub },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    sendSuccess(res, addresses);
  }),
);

// POST /api/users/me/addresses
router.post(
  "/me/addresses",
  validate(addressSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const data = req.body;

    if (data.isDefault) {
      // Unset other defaults
      await db.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await db.address.create({ data: { ...data, userId } });
    sendCreated(res, address, "Address added");
  }),
);

// PATCH /api/users/me/addresses/:id
router.patch(
  "/me/addresses/:id",
  validate(addressSchema.partial()),
  asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const id = req.params["id"];

    const existing = await db.address.findFirst({ where: { id, userId } });
    if (!existing) throw new AppError("Address not found", 404);

    if (req.body.isDefault) {
      await db.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await db.address.update({ where: { id }, data: req.body });
    sendSuccess(res, address, "Address updated");
  }),
);

// DELETE /api/users/me/addresses/:id
router.delete(
  "/me/addresses/:id",
  asyncHandler(async (req, res) => {
    const id = req.params["id"];
    const existing = await db.address.findFirst({
      where: { id, userId: req.user.sub },
    });
    if (!existing) throw new AppError("Address not found", 404);
    await db.address.delete({ where: { id } });
    sendSuccess(res, null, "Address deleted");
  }),
);

router.use("/admin", requireAdmin);

router.get(
  "/admin",
  validateQuery(adminUsersQuerySchema),
  asyncHandler(async (req, res) => {
    const { page, limit, role } = req.query;
    const where = role ? { role } : {};
    const [total, users] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, lastLoginAt: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    sendSuccess(res, users, "Admin users fetched", 200, buildPaginationMeta(total, page, limit));
  }),
);

router.patch(
  "/admin/:id/role",
  validate(updateRoleSchema),
  asyncHandler(async (req, res) => {
    const user = await db.user.update({
      where: { id: req.params["id"] },
      data: { role: req.body.role },
      select: { id: true, name: true, email: true, role: true },
    });
    sendSuccess(res, user, "User role updated");
  }),
);

export default router;
