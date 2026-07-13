import { Router } from "express";
import { db } from "../../config/database";
import { asyncHandler, AppError } from "../../middleware/errorHandler";
import { authenticate } from "../../middleware/auth";
import { sendSuccess } from "../../utils/response";

const router = Router();
router.use(authenticate);

// GET /api/wishlist
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await db.wishlistItem.findMany({
      where: { userId: req.user.sub },
      select: {
        id: true,
        product: {
          select: {
            id: true,
            title: true,
            handle: true,
            productType: true,
            variants: {
              where: { isActive: true },
              select: {
                id: true,
                title: true,
                price: true,
                comparePrice: true,
                option1: true,
              },
              orderBy: { position: "asc" },
              take: 5,
            },
            images: {
              select: { src: true, altText: true },
              take: 2,
              orderBy: { position: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    sendSuccess(res, items);
  }),
);

// POST /api/wishlist/:productId — toggle (add if not present, remove if present)
router.post(
  "/:productId",
  asyncHandler(async (req, res) => {
    const productId = req.params["productId"];
    const userId = req.user.sub;

    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) throw new AppError("Product not found", 404);

    const existing = await db.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await db.wishlistItem.delete({ where: { id: existing.id } });
      sendSuccess(res, { wishlisted: false }, "Removed from wishlist");
    } else {
      await db.wishlistItem.create({ data: { userId, productId } });
      sendSuccess(res, { wishlisted: true }, "Added to wishlist");
    }
  }),
);

// DELETE /api/wishlist/:productId
router.delete(
  "/:productId",
  asyncHandler(async (req, res) => {
    await db.wishlistItem.deleteMany({
      where: { userId: req.user.sub, productId: req.params["productId"] },
    });
    sendSuccess(res, null, "Removed from wishlist");
  }),
);

export default router;
