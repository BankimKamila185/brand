import { Router } from "express";
import { db } from "../../config/database";
import { asyncHandler } from "../../middleware/errorHandler";
import { sendSuccess, sendNotFound } from "../../utils/response";

const router = Router();

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
