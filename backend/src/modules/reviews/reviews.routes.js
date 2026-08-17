import { Router } from "express";
import { z } from "zod";
import { db } from "../../config/database";
import { asyncHandler, AppError } from "../../middleware/errorHandler";
import { authenticate, requireAdmin } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  sendSuccess,
  sendCreated,
  buildPaginationMeta,
} from "../../utils/response";

const router = Router();

const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(150).optional(),
  body: z.string().max(2000).optional(),
  images: z.array(z.string()).max(5).optional(),
});

const moderateReviewSchema = z.object({ approved: z.boolean() });

// GET /api/reviews?productId=xxx
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const productId = req.query["productId"];
    const page = parseInt(req.query["page"]) || 1;
    const limit = Math.min(50, parseInt(req.query["limit"]) || 10);
    const skip = (page - 1) * limit;

    if (!productId) throw new AppError("productId query param required", 400);

    // Support looking up by either ID or handle
    let targetProductId = productId;
    const foundProd = await db.product.findFirst({
      where: { OR: [{ id: productId }, { handle: productId }] },
      select: { id: true },
    });
    if (foundProd) targetProductId = foundProd.id;

    const [total, reviews] = await Promise.all([
      db.review.count({ where: { productId: targetProductId, approved: true } }),
      db.review.findMany({
        where: { productId: targetProductId, approved: true },
        select: {
          id: true,
          rating: true,
          title: true,
          body: true,
          images: true,
          createdAt: true,
          user: { select: { name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    // Compute aggregate rating
    const agg = await db.review.aggregate({
      where: { productId: targetProductId, approved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    sendSuccess(
      res,
      {
        reviews,
        avgRating: agg._avg.rating || 0,
        totalReviews: agg._count.rating || 0,
      },
      "Reviews fetched",
      200,
      buildPaginationMeta(total, page, limit),
    );
  }),
);

// POST /api/reviews — create real-time live review
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { productId, rating, title, body, images, authorName } = req.body;
    if (!productId) throw new AppError("Product ID is required", 400);

    // Resolve product by ID or handle
    const product = await db.product.findFirst({
      where: { OR: [{ id: productId }, { handle: productId }] },
      select: { id: true },
    });
    if (!product) throw new AppError("Product not found", 404);

    // Try finding user if authenticated
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const jwt = (await import("jsonwebtoken")).default;
        const { env } = await import("../../config/env");
        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
        userId = payload.sub;
      } catch (e) {}
    }

    if (!userId) {
      const defaultUser = await db.user.findFirst({ select: { id: true } });
      userId = defaultUser?.id;
    }

    if (!userId) {
      // Create guest user record
      const guest = await db.user.create({
        data: {
          name: authorName || "Verified Buyer",
          email: `buyer_${Date.now()}@theoutliersstudio.com`,
          passwordHash: "N/A",
          role: "USER",
        },
      });
      userId = guest.id;
    }

    const review = await db.review.create({
      data: {
        productId: product.id,
        userId,
        rating: Number(rating) || 5,
        title: title || null,
        body: body || null,
        images: Array.isArray(images) ? images : [],
        approved: true, // Live immediately in real time!
      },
      select: {
        id: true,
        rating: true,
        title: true,
        body: true,
        images: true,
        createdAt: true,
        approved: true,
        user: { select: { name: true, avatar: true } },
      },
    });

    sendCreated(res, review, "Review submitted and published live!");
  }),
);

router.use("/admin", authenticate, requireAdmin);

router.get(
  "/admin",
  asyncHandler(async (_req, res) => {
    const reviews = await db.review.findMany({
      select: {
        id: true,
        rating: true,
        title: true,
        body: true,
        images: true,
        approved: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        product: { select: { id: true, title: true, handle: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    sendSuccess(res, reviews, "Admin reviews fetched");
  }),
);

router.patch(
  "/admin/:id",
  validate(moderateReviewSchema),
  asyncHandler(async (req, res) => {
    const review = await db.review.update({ where: { id: req.params["id"] }, data: req.body });
    sendSuccess(res, review, req.body.approved ? "Review approved" : "Review rejected");
  }),
);

router.delete(
  "/admin/:id",
  asyncHandler(async (req, res) => {
    await db.review.delete({ where: { id: req.params["id"] } });
    sendSuccess(res, null, "Review deleted");
  }),
);

export default router;
