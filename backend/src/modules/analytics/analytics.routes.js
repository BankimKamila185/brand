import { Router } from "express";
import { db } from "../../config/database";
import { asyncHandler } from "../../middleware/errorHandler";
import { authenticate, requireAdmin } from "../../middleware/auth";
import { sendSuccess } from "../../utils/response";

const router = Router();
router.use(authenticate, requireAdmin);

/**
 * GET /api/analytics/dashboard
 * Returns aggregated admin dashboard stats in a single round-trip.
 *
 * Shape:
 * {
 *   orders:        { total, today, statuses: { PENDING, CONFIRMED, ... } },
 *   revenue:       { total, today },
 *   users:         { total },
 *   products:      { total, lowStock, outOfStock },
 *   revenueByDay:  [ { date, revenue, orders } ]   // last 30 days
 *   topProducts:   [ { id, title, handle, image, revenue, units } ] // top 5
 *   categoryRevenue: [ { name, revenue } ]          // revenue by category
 *   recentOrders:  [ { id, orderNumber, status, total, createdAt, user } ] // last 10
 *   lowStockItems: [ { id, title, image, qty } ]   // up to 10
 * }
 */
router.get(
  "/dashboard",
  asyncHandler(async (_req, res) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // ── Parallel queries ──────────────────────────────────────────────────────
    const [
      totalOrders,
      todayOrders,
      allOrders,
      totalUsers,
      totalProducts,
      allProducts,
      recentOrders,
    ] = await Promise.all([
      // total order count
      db.order.count(),
      // today's order count
      db.order.count({ where: { createdAt: { gte: todayStart } } }),
      // all orders (last 30 days) for revenue/chart
      db.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          items: {
            select: {
              variantId: true,
              quantity: true,
              priceSnapshot: true,
              titleSnapshot: true,
              variant: {
                select: {
                  product: {
                    select: {
                      id: true,
                      title: true,
                      handle: true,
                      images: { select: { src: true }, orderBy: { position: "asc" }, take: 1 },
                      category: { select: { name: true } },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      // user count
      db.user.count(),
      // product count
      db.product.count({ where: { isActive: true } }),
      // all products with inventory (for stock watch)
      db.product.findMany({
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          handle: true,
          images: { select: { src: true }, orderBy: { position: "asc" }, take: 1 },
          variants: {
            where: { isActive: true },
            select: { inventory: { select: { quantity: true, reserved: true } } },
          },
        },
        orderBy: { publishedAt: "desc" },
        take: 200,
      }),
      // recent orders feed
      db.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          total: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
          payment: { select: { status: true } },
        },
      }),
    ]);

    // ── Revenue calculations ──────────────────────────────────────────────────
    const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const todayRevenue = allOrders
      .filter((o) => new Date(o.createdAt) >= todayStart)
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    // ── Order status breakdown ────────────────────────────────────────────────
    const statusMap = {};
    for (const o of allOrders) {
      statusMap[o.status] = (statusMap[o.status] || 0) + 1;
    }

    // ── Revenue by day (last 30 days) ─────────────────────────────────────────
    const dayMap = {};
    for (const o of allOrders) {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!dayMap[key]) dayMap[key] = { date: key, revenue: 0, orders: 0 };
      dayMap[key].revenue += Number(o.total || 0);
      dayMap[key].orders += 1;
    }
    // Fill in all 30 days (so chart is gapless)
    const revenueByDay = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      revenueByDay.push({
        date: key,
        label,
        revenue: dayMap[key]?.revenue || 0,
        orders: dayMap[key]?.orders || 0,
      });
    }

    // ── Top 5 products by revenue ─────────────────────────────────────────────
    const productRevenueMap = {};
    for (const order of allOrders) {
      for (const item of order.items) {
        const p = item.variant?.product;
        if (!p) continue;
        const id = p.id;
        if (!productRevenueMap[id]) {
          productRevenueMap[id] = {
            id,
            title: p.title,
            handle: p.handle,
            image: p.images[0]?.src || null,
            revenue: 0,
            units: 0,
          };
        }
        productRevenueMap[id].revenue += Number(item.priceSnapshot || 0) * item.quantity;
        productRevenueMap[id].units += item.quantity;
      }
    }
    const topProducts = Object.values(productRevenueMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // ── Revenue by category ───────────────────────────────────────────────────
    const catRevenueMap = {};
    for (const order of allOrders) {
      for (const item of order.items) {
        const cat = item.variant?.product?.category?.name || "Uncategorised";
        catRevenueMap[cat] = (catRevenueMap[cat] || 0) + Number(item.priceSnapshot || 0) * item.quantity;
      }
    }
    const categoryRevenue = Object.entries(catRevenueMap)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    // ── Low stock items ───────────────────────────────────────────────────────
    const lowStockItems = [];
    let lowStockCount = 0;
    let outOfStockCount = 0;
    for (const p of allProducts) {
      const minQty = Math.min(
        ...p.variants.map((v) => {
          const qty = v.inventory?.quantity ?? 0;
          const reserved = v.inventory?.reserved ?? 0;
          return qty - reserved;
        })
      );
      if (minQty <= 0) outOfStockCount++;
      if (minQty < 5) {
        lowStockCount++;
        if (lowStockItems.length < 10) {
          lowStockItems.push({
            id: p.id,
            title: p.title,
            handle: p.handle,
            image: p.images[0]?.src || null,
            qty: minQty,
          });
        }
      }
    }

    sendSuccess(res, {
      orders: {
        total: totalOrders,
        today: todayOrders,
        statuses: statusMap,
      },
      revenue: {
        total: totalRevenue,
        today: todayRevenue,
      },
      users: { total: totalUsers },
      products: {
        total: totalProducts,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
      },
      revenueByDay,
      topProducts,
      categoryRevenue,
      recentOrders,
      lowStockItems,
    }, "Analytics dashboard fetched");
  })
);

export default router;
