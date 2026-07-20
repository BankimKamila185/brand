"use client";

import { useEffect, useState } from "react";
import { Check, RefreshCw, ShieldCheck, Trash2, MapPin, Truck, ShoppingBag, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { adminApi } from "@/lib/api";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

export function AdminOperations({ type }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const api = adminApi[type];
  const title = type[0].toUpperCase() + type.slice(1);

  const load = async () => {
    setLoading(true);
    try {
      const result = await api.list();
      setItems(result.data || []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [type]);

  const headers =
    type === "orders"
      ? ["Order ID", "Customer", "Total", "Status", "Tracking", "Details"]
      : type === "users"
      ? ["Member", "Email address", "Role", "Joined"]
      : ["Product", "Review", "Rating", "State", "Moderate"];

  return (
    <div className="admin-operations-page">
      <header className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">Operations desk</p>
          <h1>{title}</h1>
          <p>Manage and review live {title.toLowerCase()} for The Outliers Studio.</p>
        </div>
        <button className="admin-refresh-button" onClick={() => void load()}>
          <RefreshCw className="size-4" /> Refresh
        </button>
      </header>

      <section className="admin-operations-card">
        <header>
          <div>
            <p className="admin-eyebrow">Live queue</p>
            <h2>{title} queue</h2>
          </div>
          <span>
            <ShieldCheck /> {loading ? "Syncing" : `${items.length} records`}
          </span>
        </header>

        {error && <div className="admin-error-message">{error}</div>}

        <div className="admin-table-scroll">
          <table className="admin-resource-table admin-operations-table">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={headers.length} className="admin-table-empty">
                    Loading {title.toLowerCase()}…
                  </td>
                </tr>
              ) : items.length ? (
                items.map((item) => {
                  if (type === "orders") {
                    const isExpanded = expandedOrderId === item.id;
                    return (
                      <>
                        <tr
                          key={item.id}
                          className="hover:bg-neutral-50 cursor-pointer"
                          onClick={() => setExpandedOrderId(isExpanded ? null : item.id)}
                        >
                          <td className="admin-mono font-bold">#{item.id.slice(-8).toUpperCase()}</td>
                          <td>
                            <div className="text-sm font-bold text-neutral-800">
                              {item.user?.name || "Guest"}
                            </div>
                            <div className="text-xs text-neutral-400">
                              {item.user?.email || "No email"}
                            </div>
                          </td>
                          <td className="admin-amount">{currency.format(Number(item.total))}</td>
                          <td>
                            <button
                              className="admin-status-button"
                              onClick={async (event) => {
                                event.stopPropagation();
                                const status = window.prompt("Order status", item.status);
                                if (status) {
                                  await api.update(item.id, { status });
                                  void load();
                                }
                              }}
                            >
                              {item.status}
                            </button>
                          </td>
                          <td>
                            <button
                              className="admin-text-button"
                              onClick={async (event) => {
                                event.stopPropagation();
                                const trackingNumber = window.prompt(
                                  "Tracking number",
                                  item.trackingNumber || ""
                                );
                                if (trackingNumber !== null) {
                                  await api.update(item.id, { trackingNumber });
                                  void load();
                                }
                              }}
                            >
                              {item.trackingNumber || "Add tracking"}
                            </button>
                          </td>
                          <td>
                            <span className="text-neutral-400 hover:text-black">
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${item.id}-details`} className="bg-neutral-50/50 border-b border-neutral-100">
                            <td colSpan={headers.length} className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                {/* Delivery details */}
                                <div className="space-y-3 bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 mb-2">
                                    <MapPin size={14} /> Shipping Destination
                                  </h4>
                                  {item.address ? (
                                    <div className="text-sm text-neutral-800 space-y-1">
                                      <p className="font-extrabold text-neutral-900">{item.address.name}</p>
                                      <p className="text-neutral-600">{item.address.line1}</p>
                                      {item.address.line2 && <p className="text-neutral-600">{item.address.line2}</p>}
                                      <p className="text-neutral-600">
                                        {item.address.city}, {item.address.state} — {item.address.pincode}
                                      </p>
                                      <p className="text-neutral-500 font-bold flex items-center gap-1 mt-3">
                                        <Phone size={13} /> {item.address.phone}
                                      </p>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-neutral-400 italic">No delivery address saved</p>
                                  )}
                                </div>

                                {/* Order items */}
                                <div className="space-y-3 bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 mb-2">
                                    <ShoppingBag size={14} /> Items list
                                  </h4>
                                  <div className="space-y-3">
                                    {(item.items || []).map((prod, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between text-sm border-b border-neutral-100 pb-3 last:border-0 last:pb-0"
                                      >
                                        <div className="flex items-center gap-3">
                                          {prod.imageSnapshot && (
                                            <img
                                              src={prod.imageSnapshot}
                                              alt={prod.titleSnapshot}
                                              className="w-10 h-10 object-cover rounded-lg border border-neutral-100"
                                            />
                                          )}
                                          <div>
                                            <p className="font-bold text-neutral-800">
                                              {prod.titleSnapshot}
                                            </p>
                                            {prod.variantSnapshot && (
                                              <p className="text-xs text-neutral-400">
                                                Size: {prod.variantSnapshot}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-mono text-neutral-800">
                                            {prod.quantity} × {currency.format(Number(prod.priceSnapshot || 0))}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  }

                  if (type === "users") {
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="admin-member">
                            <i>{item.name?.slice(0, 1) || "U"}</i>
                            {item.name}
                          </div>
                        </td>
                        <td>{item.email}</td>
                        <td>
                          <select
                            value={item.role}
                            onChange={async (event) => {
                              await api.updateRole(item.id, event.target.value);
                              void load();
                            }}
                          >
                            <option>USER</option>
                            <option>ADMIN</option>
                            <option>SUPER_ADMIN</option>
                          </select>
                        </td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={item.id}>
                      <td>{item.product?.title || "Product unavailable"}</td>
                      <td className="admin-review-copy">
                        {item.title || item.body || "Untitled review"}
                      </td>
                      <td>
                        <span className="admin-rating">★ {item.rating}/5</span>
                      </td>
                      <td>
                        <span className={`admin-state ${item.approved ? "approved" : "pending"}`}>
                          {item.approved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-operation-actions">
                          <button
                            className="admin-table-action"
                            onClick={async () => {
                              await api.moderate(item.id, !item.approved);
                              void load();
                            }}
                            aria-label="Moderate review"
                          >
                            <Check className="size-4" />
                          </button>
                          <button
                            className="admin-table-action delete"
                            onClick={async () => {
                              if (window.confirm("Delete review?")) {
                                await api.remove(item.id);
                                void load();
                              }
                            }}
                            aria-label="Delete review"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={headers.length} className="admin-table-empty">
                    No {title.toLowerCase()} found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
