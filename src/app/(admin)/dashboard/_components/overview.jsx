"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, ArrowUpRight, Boxes, IndianRupee, PackageCheck, ReceiptText, Sparkles, TrendingUp } from "lucide-react";
import { adminApi } from "@/lib/api";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const getOrderName = (order) => order.customer?.name || order.user?.name || order.customerName || "Guest customer";

export function Overview() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState("");

  const loadData = () => {
    Promise.all([adminApi.orders.list(), adminApi.products.list()])
      .then(([orderResult, productResult]) => { 
        setOrders(orderResult.data || []); 
        setProducts(productResult.data || []); 
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadData();
    // Real-time polling: refresh dashboard data every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateCheckout = async () => {
    setSimulating(true);
    setSimMessage("");
    try {
      const res = await adminApi.orders.simulate();
      if (res.success) {
        setSimMessage("Simulated order created successfully! Syncing stats...");
        loadData();
        setTimeout(() => setSimMessage(""), 5000);
      }
    } catch (err) {
      setSimMessage(`Simulation failed: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const revenue = orders.reduce((total, order) => total + Number(order.total || 0), 0);
  const lowStock = products.filter((product) => product.variants?.some((variant) => Number(variant.inventory?.quantity || 0) < 5)).length;
  const chartData = useMemo(() => Object.entries(orders.reduce((days, order) => {
    const day = new Date(order.createdAt).toLocaleDateString("en-IN", { weekday: "short" });
    days[day] = (days[day] || 0) + Number(order.total || 0);
    return days;
  }, {})).map(([day, value]) => ({ day, value })), [orders]);
  const stats = [
    { label: "Orders in", value: orders.length, note: "Live order feed (10s sync)", icon: ReceiptText, accent: "coral" },
    { label: "Gross revenue", value: currency.format(revenue), note: "Across all orders", icon: IndianRupee, accent: "green" },
    { label: "Products live", value: products.length, note: "Available to sell", icon: PackageCheck, accent: "violet" },
    { label: "Stock watch", value: lowStock, note: lowStock ? "Needs attention" : "Everything healthy", icon: AlertTriangle, accent: "yellow" },
  ];

  return <div className="admin-overview">
    <section className="admin-overview-hero"><div className="admin-overview-hero-copy"><p><Sparkles /> The Outliers Studio</p><h1>Make today&apos;s drop impossible to miss.</h1><span>Your store is live. Track the pace, handle the details, and keep the next standout piece moving.</span><div className="admin-hero-pills"><b>Today&apos;s pulse <strong>{orders.length} orders</strong></b><b>Revenue <strong>{currency.format(revenue)}</strong></b></div></div><div className="admin-hero-orbit" /></section>
    
    {/* Live Checkout Simulator Control Panel */}
    <div style={{
      background: "#fcf8f6",
      border: "1px solid #f5e6e0",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "24px",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "16px"
    }}>
      <div>
        <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#1c1917" }}>Live Checkout Simulator</h3>
        <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#78716c" }}>Mock a customer purchase of a random inventory item to test the real-time data sync pipeline.</p>
        {simMessage && <p style={{ margin: "8px 0 0 0", fontSize: "12px", fontWeight: "bold", color: simMessage.includes("failed") ? "#ef4444" : "#10b981" }}>{simMessage}</p>}
      </div>
      <button 
        onClick={handleSimulateCheckout}
        disabled={simulating}
        style={{
          background: "#000000",
          color: "#ffffff",
          fontSize: "12px",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "1px",
          padding: "12px 24px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          opacity: simulating ? 0.5 : 1,
          transition: "opacity 0.2s"
        }}
      >
        {simulating ? "Simulating..." : "Simulate Random Checkout"}
      </button>
    </div>

    {error && <div className="admin-error-message">{error}</div>}
    <section className="admin-stats-grid">{stats.map((stat) => { const Icon = stat.icon; return <article className="admin-stat-card" key={stat.label}><div className={`admin-stat-icon ${stat.accent}`}><Icon /></div><ArrowUpRight className="admin-stat-arrow" /><p>{stat.label}</p><h2>{stat.value}</h2><span>{stat.note}</span></article>; })}</section>
    <section className="admin-insights-grid"><article className="admin-chart-card"><header><div><p>Performance</p><h2>Revenue rhythm</h2><span>Recent order value by day.</span></div><b><TrendingUp /> Live sales</b></header><div className="admin-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 12, right: 2, left: -18, bottom: 0 }}><XAxis dataKey="day" stroke="#a1a1aa" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} /><YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} /><Tooltip cursor={{ fill: "#fff4ee" }} contentStyle={{ borderRadius: 16, border: "1px solid #f0d8cc", boxShadow: "0 12px 30px rgba(18,18,18,.12)" }} formatter={(value) => currency.format(value)} /><Bar dataKey="value" fill="#e65f36" radius={[9, 9, 3, 3]} maxBarSize={46} /></BarChart></ResponsiveContainer></div></article><article className="admin-stock-card"><header><div><p>Inventory</p><h2>Keep it moving</h2></div><i><Boxes /></i></header><div className="admin-stock-number"><strong>{lowStock}</strong><span>products need a stock check</span><div><b style={{ width: `${Math.min(100, Math.max(8, products.length ? (lowStock / products.length) * 100 : 8))}%` }} /></div></div><p>{lowStock ? "Restock soon to keep your best pieces available." : "Your current catalog has no low-stock alerts."}</p></article></section>
    <section className="admin-activity-card"><header><div><p>Order feed</p><h2>Latest activity</h2></div><b>{orders.length} total</b></header><div className="admin-activity-list">{orders.slice(0, 5).map((order, index) => <article key={order.id || index}><i>{getOrderName(order).slice(0, 1)}</i><div><strong>{getOrderName(order)}</strong><span>Order #{order.orderNumber || order.id || "—"}</span></div><div><strong>{currency.format(Number(order.total || 0))}</strong><span>{order.status || "New"}</span></div></article>)}{!orders.length && <p className="admin-activity-empty">New orders will appear here as soon as they come in.</p>}</div></section>
  </div>;
}
