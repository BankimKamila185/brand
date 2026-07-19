"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Bar, BarChart, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  AlertTriangle, ArrowUpRight, Boxes, ImageOff, IndianRupee,
  PackageCheck, ReceiptText, Sparkles, TrendingUp, Users,
} from "lucide-react";
import { adminApi } from "@/lib/api";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0,
});

const STATUS_COLORS = {
  PENDING: "#fbbf24",
  CONFIRMED: "#60a5fa",
  PROCESSING: "#a78bfa",
  SHIPPED: "#34d399",
  DELIVERED: "#10b981",
  CANCELLED: "#f87171",
  REFUNDED: "#94a3b8",
};

const CAT_PALETTE = [
  "#e65f36", "#f59e0b", "#6159cf", "#21835a",
  "#3b82f6", "#ec4899", "#14b8a6", "#8b5cf6",
];

// ── Skeleton helpers ──────────────────────────────────────────────────────────
const Sk = ({ w = "100%", h = 18, r = 6 }) => (
  <div
    className="sk-box"
    style={{ width: w, height: h, borderRadius: r, display: "inline-block" }}
  />
);

// ── Product image with fallback ───────────────────────────────────────────────
function ProductThumb({ src, title, size = 44 }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div
        style={{
          width: size, height: size, borderRadius: 10, background: "#f4f4f5",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <ImageOff size={16} color="#a1a1aa" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={title}
      onError={() => setErr(true)}
      style={{
        width: size, height: size, borderRadius: 10, objectFit: "cover",
        flexShrink: 0, background: "#f4f4f5",
      }}
    />
  );
}

// ── Custom Recharts Tooltip ───────────────────────────────────────────────────
function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #f0d8cc", borderRadius: 14,
      padding: "10px 14px", boxShadow: "0 12px 30px rgba(18,18,18,.12)",
    }}>
      <p style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 700, color: "#e65f36" }}>
        {currency.format(payload[0].value)}
      </p>
      {payload[1] && (
        <p style={{ fontSize: 12, color: "#71717a" }}>{payload[1].value} orders</p>
      )}
    </div>
  );
}

// ── Main Overview Component ───────────────────────────────────────────────────
export function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState("");

  const loadAnalytics = useCallback(async () => {
    try {
      const res = await adminApi.analytics();
      if (res.success && res.data) setData(res.data);
    } catch (err) {
      // fallback: try legacy orders + products if analytics not yet deployed
      try {
        const [orderResult, productResult] = await Promise.all([
          adminApi.orders.list(),
          adminApi.products.list(),
        ]);
        const orders = orderResult.data || [];
        const products = productResult.data || [];
        const revenue = orders.reduce((t, o) => t + Number(o.total || 0), 0);
        const lowStock = products.filter((p) =>
          p.variants?.some((v) => Number(v.inventory?.quantity || 0) < 5)
        ).length;
        const dayMap = {};
        for (const o of orders) {
          const d = new Date(o.createdAt);
          const key = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
          dayMap[key] = (dayMap[key] || 0) + Number(o.total || 0);
        }
        setData({
          orders: { total: orders.length, today: 0, statuses: {} },
          revenue: { total: revenue, today: 0 },
          users: { total: 0 },
          products: { total: products.length, lowStock, outOfStock: 0 },
          revenueByDay: Object.entries(dayMap).map(([label, revenue]) => ({ label, revenue, orders: 0 })),
          topProducts: [],
          categoryRevenue: [],
          recentOrders: orders.slice(0, 10),
          lowStockItems: [],
        });
      } catch (fallbackErr) {
        setError(fallbackErr.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [loadAnalytics]);

  const handleSimulateCheckout = async () => {
    setSimulating(true);
    setSimMessage("");
    try {
      const res = await adminApi.orders.simulate();
      if (res.success) {
        setSimMessage("Simulated order created! Refreshing stats…");
        await loadAnalytics();
        setTimeout(() => setSimMessage(""), 5000);
      }
    } catch (err) {
      setSimMessage(`Simulation failed: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  // ── Derived values ──────────────────────────────────────────────────────────
  const stats = data
    ? [
        {
          label: "Total Orders", value: data.orders.total,
          note: `${data.orders.today} today`, icon: ReceiptText, accent: "coral",
        },
        {
          label: "Gross Revenue", value: currency.format(data.revenue.total),
          note: `${currency.format(data.revenue.today)} today`, icon: IndianRupee, accent: "green",
        },
        {
          label: "Products Live", value: data.products.total,
          note: "Available to sell", icon: PackageCheck, accent: "violet",
        },
        {
          label: "Registered Users", value: data.users.total,
          note: "All time", icon: Users, accent: "yellow",
        },
      ]
    : [];

  const chartData = data?.revenueByDay?.slice(-14) || []; // show last 14 days

  return (
    <div className="admin-overview">
      {/* ── Hero ── */}
      <section className="admin-overview-hero">
        <div className="admin-overview-hero-copy">
          <p><Sparkles /> The Outliers Studio</p>
          <h1>Make today&apos;s drop impossible to miss.</h1>
          <span>Your store is live. Track the pace, handle the details, and keep the next standout piece moving.</span>
          <div className="admin-hero-pills">
            <b>Today&apos;s pulse <strong>{data ? data.orders.today : "—"} orders</strong></b>
            <b>Revenue <strong>{data ? currency.format(data.revenue.today) : "—"}</strong></b>
            {data?.products.lowStock > 0 && (
              <b style={{ background: "rgba(239,68,68,.18)", borderColor: "rgba(239,68,68,.25)" }}>
                ⚠ <strong style={{ color: "#fca5a5" }}>{data.products.lowStock} low stock</strong>
              </b>
            )}
          </div>
        </div>
        <div className="admin-hero-orbit" />
      </section>

      {/* ── Live Checkout Simulator ── */}
      <div className="admin-simulator-bar">
        <div>
          <h3>Live Checkout Simulator</h3>
          <p>Mock a customer purchase of a random inventory item to test the real-time data sync pipeline.</p>
          {simMessage && (
            <p className={simMessage.includes("failed") ? "sim-error" : "sim-success"}>
              {simMessage}
            </p>
          )}
        </div>
        <button onClick={handleSimulateCheckout} disabled={simulating} className="admin-sim-btn">
          {simulating ? "Simulating…" : "Simulate Random Checkout"}
        </button>
      </div>

      {error && <div className="admin-error-message">{error}</div>}

      {/* ── 4 Stat Cards ── */}
      <section className="admin-stats-grid">
        {loading
          ? [0, 1, 2, 3].map((i) => (
              <article key={i} className="admin-stat-card">
                <Sk w={42} h={42} r={14} />
                <Sk w="60%" h={13} />
                <Sk w="80%" h={28} />
                <Sk w="50%" h={12} />
              </article>
            ))
          : stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <article className="admin-stat-card" key={stat.label}>
                  <div className={`admin-stat-icon ${stat.accent}`}><Icon /></div>
                  <ArrowUpRight className="admin-stat-arrow" />
                  <p>{stat.label}</p>
                  <h2>{stat.value}</h2>
                  <span>{stat.note}</span>
                </article>
              );
            })}
      </section>

      {/* ── Revenue Chart + Low Stock ── */}
      <section className="admin-insights-grid">
        {/* Revenue by Day */}
        <article className="admin-chart-card">
          <header>
            <div>
              <p>Performance</p>
              <h2>Revenue rhythm</h2>
              <span>Last 14 days — order value by day.</span>
            </div>
            <b><TrendingUp /> Live sales</b>
          </header>
          <div className="admin-chart">
            {loading ? (
              <Sk w="100%" h="100%" r={0} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 12, right: 2, left: -18, bottom: 0 }}>
                  <XAxis dataKey="label" stroke="#a1a1aa" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip content={<RevenueTooltip />} cursor={{ fill: "#fff4ee" }} />
                  <Bar dataKey="revenue" fill="#e65f36" radius={[9, 9, 3, 3]} maxBarSize={46} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        {/* Inventory Watch */}
        <article className="admin-stock-card">
          <header>
            <div>
              <p>Inventory</p>
              <h2>Keep it moving</h2>
            </div>
            <i><Boxes /></i>
          </header>
          <div className="admin-stock-number">
            {loading ? <Sk w={80} h={40} /> : (
              <>
                <strong>{data?.products.lowStock || 0}</strong>
                <span>products need a stock check</span>
                <div>
                  <b style={{
                    width: `${Math.min(100, Math.max(8, data && data.products.total
                      ? (data.products.lowStock / data.products.total) * 100 : 8))}%`
                  }} />
                </div>
              </>
            )}
          </div>
          {/* Low stock items with images */}
          {!loading && data?.lowStockItems?.length > 0 && (
            <div className="admin-low-stock-list">
              {data.lowStockItems.slice(0, 5).map((item) => (
                <div key={item.id} className="admin-low-stock-row">
                  <ProductThumb src={item.image} title={item.title} size={36} />
                  <span className="admin-low-stock-name">{item.title}</span>
                  <span className={`admin-low-stock-qty ${item.qty <= 0 ? "out" : "low"}`}>
                    {item.qty <= 0 ? "Out of stock" : `${item.qty} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
          <p style={{ color: "#5f5f66", fontSize: 13, lineHeight: 1.5, marginTop: 17 }}>
            {data?.products.lowStock
              ? "Restock soon to keep your best pieces available."
              : "Your current catalog has no low-stock alerts."}
          </p>
        </article>
      </section>

      {/* ── Top Products + Category Revenue ── */}
      <section className="admin-insights-grid">
        {/* Top 5 Products by Revenue */}
        <article className="admin-chart-card">
          <header>
            <div>
              <p>Best Sellers</p>
              <h2>Top products by revenue</h2>
              <span>Last 30 days — real sales data.</span>
            </div>
          </header>
          <div className="admin-top-products-list">
            {loading
              ? [0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="admin-top-product-row" style={{ gap: 12 }}>
                    <Sk w={44} h={44} r={10} />
                    <div style={{ flex: 1 }}><Sk w="70%" h={14} /><Sk w="40%" h={11} /></div>
                    <Sk w={80} h={18} />
                  </div>
                ))
              : data?.topProducts?.length
                ? data.topProducts.map((p, idx) => (
                    <div key={p.id} className="admin-top-product-row">
                      <span className="admin-top-rank">#{idx + 1}</span>
                      <ProductThumb src={p.image} title={p.title} size={44} />
                      <div className="admin-top-product-meta">
                        <strong>{p.title}</strong>
                        <span>{p.units} units sold</span>
                      </div>
                      <span className="admin-top-product-revenue">
                        {currency.format(p.revenue)}
                      </span>
                    </div>
                  ))
                : (
                  <p style={{ color: "#a1a1aa", textAlign: "center", padding: "32px 0" }}>
                    No sales data yet. Simulate a checkout to get started.
                  </p>
                )}
          </div>
        </article>

        {/* Revenue by Category */}
        <article className="admin-stock-card" style={{ background: "#fff", border: "1px solid #e7e7e8" }}>
          <header>
            <div>
              <p>Categories</p>
              <h2>Revenue breakdown</h2>
            </div>
          </header>
          {loading ? (
            <div style={{ marginTop: 20 }}><Sk w="100%" h={160} r={12} /></div>
          ) : data?.categoryRevenue?.length ? (
            <>
              <div style={{ height: 180, marginTop: 20 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categoryRevenue}
                      dataKey="revenue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={78}
                      paddingAngle={3}
                    >
                      {data.categoryRevenue.map((_, i) => (
                        <Cell key={i} fill={CAT_PALETTE[i % CAT_PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => currency.format(v)}
                      contentStyle={{ borderRadius: 12, border: "1px solid #f0d8cc" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="admin-cat-legend">
                {data.categoryRevenue.map((c, i) => (
                  <div key={c.name} className="admin-cat-legend-row">
                    <span style={{ background: CAT_PALETTE[i % CAT_PALETTE.length] }} className="admin-cat-dot" />
                    <span className="admin-cat-name">{c.name}</span>
                    <span className="admin-cat-val">{currency.format(c.revenue)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: "#a1a1aa", textAlign: "center", padding: "32px 0", fontSize: 13 }}>
              No category revenue data yet.
            </p>
          )}
        </article>
      </section>

      {/* ── Recent Orders Feed ── */}
      <section className="admin-activity-card">
        <header>
          <div>
            <p>Order feed</p>
            <h2>Latest activity</h2>
          </div>
          <b>{data ? data.orders.total : "—"} total</b>
        </header>
        <div className="admin-activity-list">
          {loading
            ? [0, 1, 2, 3, 4].map((i) => (
                <article key={i}>
                  <Sk w={38} h={38} r={12} />
                  <div style={{ flex: 1 }}><Sk w="55%" h={13} /><Sk w="35%" h={11} /></div>
                  <div><Sk w={70} h={14} /><Sk w={50} h={11} /></div>
                </article>
              ))
            : (data?.recentOrders || []).slice(0, 10).map((order, i) => {
                const name = order.user?.name || "Guest";
                const statusColor = STATUS_COLORS[order.status] || "#a1a1aa";
                return (
                  <article key={order.id || i}>
                    <i>{name.slice(0, 1).toUpperCase()}</i>
                    <div>
                      <strong>{name}</strong>
                      <span>Order #{order.id?.slice(-8) || "—"}</span>
                    </div>
                    <div>
                      <strong>{currency.format(Number(order.total || 0))}</strong>
                      <span style={{ color: statusColor, fontWeight: 700 }}>{order.status || "New"}</span>
                    </div>
                  </article>
                );
              })}
          {!loading && !data?.recentOrders?.length && (
            <p className="admin-activity-empty">
              New orders will appear here as soon as they come in.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
