import { Router } from "express";
import { z } from "zod";
import { db } from "../../config/database";
import { asyncHandler, AppError } from "../../middleware/errorHandler";
import { authenticate, requireAdmin } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { sendCreated, sendSuccess, sendNotFound } from "../../utils/response";

const router = Router();

const categorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(1000).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const categories = await db.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: "asc" },
    });
    sendSuccess(res, categories);
  }),
);

router.use("/admin", authenticate, requireAdmin);

router.post(
  "/admin",
  validate(categorySchema),
  asyncHandler(async (req, res) => {
    const category = await db.category.create({ data: req.body });
    sendCreated(res, category, "Category created");
  }),
);

router.patch(
  "/admin/:id",
  validate(categorySchema.partial()),
  asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new AppError("At least one update is required", 400);
    const category = await db.category.update({ where: { id: req.params["id"] }, data: req.body });
    sendSuccess(res, category, "Category updated");
  }),
);

router.delete(
  "/admin/:id",
  asyncHandler(async (req, res) => {
    await db.category.delete({ where: { id: req.params["id"] } });
    sendSuccess(res, null, "Category deleted");
  }),
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const category = await db.category.findUnique({
      where: { slug: req.params["slug"] },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        products: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            handle: true,
            productType: true,
            variants: {
              select: { price: true, comparePrice: true },
              take: 1,
              orderBy: { position: "asc" },
            },
            images: {
              select: { src: true },
              take: 1,
              orderBy: { position: "asc" },
            },
          },
          take: 20,
        },
      },
    });
    if (!category) {
      sendNotFound(res, "Category not found");
      return;
    }
    sendSuccess(res, category);
  }),
);

export default router;
