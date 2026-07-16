"use client";

import { useEffect, useState } from "react";
import { Check, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { adminApi } from "@/lib/api";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

export function AdminOperations({ type }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const api = adminApi[type];
  const title = type[0].toUpperCase() + type.slice(1);

  const load = async () => { setLoading(true); try { const result = await api.list(); setItems(result.data || []); setError(""); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [type]);

  const headers = type === "orders" ? ["Order", "Customer", "Total", "Status", "Tracking"] : type === "users" ? ["Member", "Email address", "Role", "Joined"] : ["Product", "Review", "Rating", "State", "Moderate"];

  return <div className="admin-operations-page"><header className="admin-page-heading"><div><p className="admin-eyebrow">Operations desk</p><h1>{title}</h1><p>Manage and review live {title.toLowerCase()} for The Outliers Studio.</p></div><button className="admin-refresh-button" onClick={() => void load()}><RefreshCw className="size-4" /> Refresh</button></header><section className="admin-operations-card"><header><div><p className="admin-eyebrow">Live queue</p><h2>{title} queue</h2></div><span><ShieldCheck /> {loading ? "Syncing" : `${items.length} records`}</span></header>{error && <div className="admin-error-message">{error}</div>}<div className="admin-table-scroll"><table className="admin-resource-table admin-operations-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={headers.length} className="admin-table-empty">Loading {title.toLowerCase()}…</td></tr> : items.length ? items.map((item) => type === "orders" ? <tr key={item.id}><td className="admin-mono">#{item.id.slice(-8)}</td><td>{item.user?.name || item.user?.email || "Guest"}</td><td className="admin-amount">{currency.format(Number(item.total))}</td><td><button className="admin-status-button" onClick={async () => { const status = window.prompt("Order status", item.status); if (status) { await api.update(item.id, { status }); void load(); } }}>{item.status}</button></td><td><button className="admin-text-button" onClick={async () => { const trackingNumber = window.prompt("Tracking number", item.trackingNumber || ""); if (trackingNumber !== null) { await api.update(item.id, { trackingNumber }); void load(); } }}>{item.trackingNumber || "Add tracking"}</button></td></tr> : type === "users" ? <tr key={item.id}><td><div className="admin-member"><i>{item.name?.slice(0, 1) || "U"}</i>{item.name}</div></td><td>{item.email}</td><td><select value={item.role} onChange={async (event) => { await api.updateRole(item.id, event.target.value); void load(); }}><option>USER</option><option>ADMIN</option><option>SUPER_ADMIN</option></select></td><td>{new Date(item.createdAt).toLocaleDateString()}</td></tr> : <tr key={item.id}><td>{item.product?.title || "Product unavailable"}</td><td className="admin-review-copy">{item.title || item.body || "Untitled review"}</td><td><span className="admin-rating">★ {item.rating}/5</span></td><td><span className={`admin-state ${item.approved ? "approved" : "pending"}`}>{item.approved ? "Approved" : "Pending"}</span></td><td><div className="admin-operation-actions"><button className="admin-table-action" onClick={async () => { await api.moderate(item.id, !item.approved); void load(); }} aria-label="Moderate review"><Check className="size-4" /></button><button className="admin-table-action delete" onClick={async () => { if (window.confirm("Delete review?")) { await api.remove(item.id); void load(); } }} aria-label="Delete review"><Trash2 className="size-4" /></button></div></td></tr>) : <tr><td colSpan={headers.length} className="admin-table-empty">No {title.toLowerCase()} found.</td></tr>}</tbody></table></div></section></div>;
}
