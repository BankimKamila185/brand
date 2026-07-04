import { Router } from 'express';
import { db } from '../../config/database';
import { asyncHandler } from '../../middleware/errorHandler';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { sendSuccess, buildPaginationMeta } from '../../utils/response';

const router = Router();
router.use(authenticate, requireAdmin);

// GET /api/admin/dashboard — key metrics
router.get('/dashboard', asyncHandler(async (_req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    monthRevenue,
    lastMonthRevenue,
    pendingOrders,
    recentOrders,
    lowStockVariants,
  ] = await Promise.all([
    db.user.count({ where: { isActive: true } }),
    db.product.count({ where: { isActive: true } }),
    db.order.count(),
    db.payment.aggregate({
      where: { status: 'PAID', createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    db.payment.aggregate({
      where: { status: 'PAID', createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum: { amount: true },
    }),
    db.order.count({ where: { status: 'PENDING' } }),
    db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, status: true, total: true, createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    db.inventory.findMany({
      where: { quantity: { lte: 5 } },
      select: {
        quantity: true,
        variant: { select: { title: true, sku: true, product: { select: { title: true, handle: true } } } },
      },
      orderBy: { quantity: 'asc' },
      take: 10,
    }),
  ]);

  const currentRevenue = Number(monthRevenue._sum.amount ?? 0);
  const prevRevenue = Number(lastMonthRevenue._sum.amount ?? 0);
  const revenueGrowth = prevRevenue > 0
    ? ((currentRevenue - prevRevenue) / prevRevenue) * 100
    : 100;

  sendSuccess(res, {
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      monthRevenue: currentRevenue,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      pendingOrders,
    },
    recentOrders,
    lowStockVariants,
  });
}));

// GET /api/admin/users — paginated user list
router.get('/users', asyncHandler(async (req, res) => {
  const page = parseInt(req.query['page'] as string) || 1;
  const limit = Math.min(100, parseInt(req.query['limit'] as string) || 20);
  const skip = (page - 1) * limit;
  const search = req.query['search'] as string | undefined;

  const where = search
    ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } }] }
    : {};

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        emailVerified: true, isActive: true, createdAt: true, lastLoginAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
    }),
  ]);

  sendSuccess(res, users, 'Users fetched', 200, buildPaginationMeta(total, page, limit));
}));

// PATCH /api/admin/users/:id/status — activate/deactivate
router.patch('/users/:id/status', asyncHandler(async (req, res) => {
  const { isActive } = req.body as { isActive: boolean };
  const user = await db.user.update({
    where: { id: req.params['id'] as string },
    data: { isActive },
    select: { id: true, isActive: true, name: true },
  });
  sendSuccess(res, user, `User ${isActive ? 'activated' : 'deactivated'}`);
}));

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', asyncHandler(async (req, res) => {
  const { role } = req.body as { role: string };
  if (!['USER', 'ADMIN'].includes(role)) {
    res.status(400).json({ success: false, message: 'Invalid role' });
    return;
  }
  const user = await db.user.update({
    where: { id: req.params['id'] as string },
    data: { role: role as never },
    select: { id: true, role: true, name: true },
  });
  sendSuccess(res, user, 'Role updated');
}));

// GET /api/admin/analytics/revenue — revenue chart data (last 12 months)
router.get('/analytics/revenue', asyncHandler(async (_req, res) => {
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const revenueData = await Promise.all(
    months.map(async (start) => {
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);
      const agg = await db.payment.aggregate({
        where: { status: 'PAID', createdAt: { gte: start, lte: end } },
        _sum: { amount: true },
        _count: { id: true },
      });
      return {
        month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue: Number(agg._sum.amount ?? 0),
        orders: agg._count.id,
      };
    }),
  );

  sendSuccess(res, revenueData);
}));

export default router;
