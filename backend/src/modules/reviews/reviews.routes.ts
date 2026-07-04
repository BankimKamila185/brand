import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../config/database';
import { asyncHandler, AppError } from '../../middleware/errorHandler';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { sendSuccess, sendCreated, buildPaginationMeta } from '../../utils/response';

const router = Router();

const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(150).optional(),
  body: z.string().max(2000).optional(),
});

// GET /api/reviews?productId=xxx
router.get('/', asyncHandler(async (req, res) => {
  const productId = req.query['productId'] as string;
  const page = parseInt(req.query['page'] as string) || 1;
  const limit = Math.min(50, parseInt(req.query['limit'] as string) || 10);
  const skip = (page - 1) * limit;

  if (!productId) throw new AppError('productId query param required', 400);

  const [total, reviews] = await Promise.all([
    db.review.count({ where: { productId, approved: true } }),
    db.review.findMany({
      where: { productId, approved: true },
      select: {
        id: true, rating: true, title: true, body: true, createdAt: true,
        user: { select: { name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
    }),
  ]);

  // Compute aggregate rating
  const agg = await db.review.aggregate({
    where: { productId, approved: true },
    _avg: { rating: true },
    _count: { rating: true },
  });

  sendSuccess(res, { reviews, avgRating: agg._avg.rating, totalReviews: agg._count.rating },
    'Reviews fetched', 200, buildPaginationMeta(total, page, limit));
}));

// POST /api/reviews — create (one per product per user)
router.post('/', authenticate, validate(createReviewSchema), asyncHandler(async (req, res) => {
  const { productId, rating, title, body } = req.body as {
    productId: string; rating: number; title?: string; body?: string;
  };
  const userId = req.user!.sub;

  const product = await db.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) throw new AppError('Product not found', 404);

  // Check user purchased this product
  const hasPurchased = await db.orderItem.findFirst({
    where: {
      variantId: { in: await db.productVariant.findMany({ where: { productId }, select: { id: true } }).then(v => v.map(x => x.id)) },
      order: { userId, status: { in: ['DELIVERED', 'CONFIRMED'] } },
    },
  });
  // Allow review even without purchase but flag it (optional enforcement)

  const review = await db.review.create({
    data: {
      productId, userId, rating,
      title: title || null,
      body: body || null,
      approved: !hasPurchased ? false : true, // Auto-approve verified buyers
    },
    select: { id: true, rating: true, title: true, body: true, createdAt: true, approved: true },
  });

  sendCreated(res, review, review.approved
    ? 'Review submitted successfully'
    : 'Review submitted and pending approval');
}));

// Admin: list unapproved
router.get('/admin/pending', authenticate, requireAdmin, asyncHandler(async (_req, res) => {
  const reviews = await db.review.findMany({
    where: { approved: false },
    select: {
      id: true, rating: true, title: true, body: true, createdAt: true,
      user: { select: { name: true, email: true } },
      product: { select: { title: true, handle: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
  sendSuccess(res, reviews);
}));

// Admin: approve/reject
router.patch('/:id/approve', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const review = await db.review.update({
    where: { id: req.params['id'] as string },
    data: { approved: true },
    select: { id: true, approved: true },
  });
  sendSuccess(res, review, 'Review approved');
}));

router.delete('/:id', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  await db.review.delete({ where: { id: req.params['id'] as string } });
  sendSuccess(res, null, 'Review deleted');
}));

export default router;
