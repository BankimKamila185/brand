import { Router } from "express";
import { db } from "../../config/database";
import { asyncHandler } from "../../middleware/errorHandler";
import { sendSuccess, sendNotFound } from "../../utils/response";

const router = Router();

// GET /api/collections — list all active
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const collections = await db.collection.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        handle: true,
        description: true,
        imageUrl: true,
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: "asc" },
    });
    sendSuccess(res, collections);
  }),
);

// GET /api/collections/:handle — single collection with paginated products
router.get(
  "/:handle",
  asyncHandler(async (req, res) => {
    const { handle } = req.params;
    const page = parseInt(req.query["page"]) || 1;
    const limit = Math.min(100, parseInt(req.query["limit"]) || 24);
    const skip = (page - 1) * limit;

    const collection = await db.collection.findUnique({
      where: { handle: handle },
      select: {
        id: true,
        name: true,
        handle: true,
        description: true,
        imageUrl: true,
      },
    });
    if (!collection) {
      sendNotFound(res, "Collection not found");
      return;
    }

    const [total, products] = await Promise.all([
      db.product.count({
        where: {
          isActive: true,
          collections: { some: { collectionId: collection.id } },
        },
      }),
      db.product.findMany({
        where: {
          isActive: true,
          collections: { some: { collectionId: collection.id } },
        },
        select: {
          id: true,
          title: true,
          handle: true,
          productType: true,
          tags: true,
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              title: true,
              option1: true,
              price: true,
              comparePrice: true,
              inventory: { select: { quantity: true } },
            },
            orderBy: { position: "asc" },
            take: 10,
          },
          images: {
            select: { src: true, altText: true },
            orderBy: { position: "asc" },
            take: 2,
          },
        },
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
      }),
    ]);

    sendSuccess(res, { collection, products }, "Collection fetched", 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    });
  }),
);

export default router;
