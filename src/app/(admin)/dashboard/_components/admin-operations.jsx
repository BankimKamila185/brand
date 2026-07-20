"use client";

import { useEffect, useState } from "react";
import { Check, RefreshCw, ShieldCheck, Trash2, MapPin, Truck, ShoppingBag, Phone, ArrowLeft, Save, CreditCard, User, Mail, Calendar } from "lucide-react";
import { adminApi } from "@/lib/api";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

function parseTracking(trackingNumber) {
  if (!trackingNumber) return { courier: "Delhivery", number: "" };
  if (trackingNumber.includes(":")) {
    const parts = trackingNumber.split(":");
    return { courier: parts[0].trim(), number: parts.slice(1).join(":").trim() };
  }
  return { courier: "Delhivery", number: trackingNumber };
}

export function AdminOperations({ type }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
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

  if (selectedOrderId && type === "orders") {
    return (
      <OrderDetailView
        orderId={selectedOrderId}
        onBack={() => {
          setSelectedOrderId(null);
          void load();
        }}
      />
    );
  }

  const headers =
    type === "orders"
      ? ["Order ID", "Customer", "Date", "Total", "Status", "Tracking", "Action"]
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
                    const trInfo = parseTracking(item.trackingNumber);
                    return (
                      <tr key={item.id}>
                        <td className="admin-mono font-bold">#{item.id.slice(-8).toUpperCase()}</td>
                        <td>
                          <div className="text-sm font-bold text-neutral-800">
                            {item.user?.name || "Guest"}
                          </div>
                          <div className="text-xs text-neutral-400">
                            {item.user?.email || "No email"}
                          </div>
                        </td>
                        <td className="text-xs text-neutral-500">
                          {new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="admin-amount">{currency.format(Number(item.total))}</td>
                        <td>
                          <span className={`admin-status-badge status-${item.status.toLowerCase()}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="text-xs text-neutral-600">
                          {item.trackingNumber ? (
                            <div className="flex flex-col">
                              <span className="font-bold text-neutral-800">{trInfo.courier}</span>
                              <span className="font-mono text-neutral-500">{trInfo.number}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-400 italic">Not Shipped</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="bg-[#0E0D0B] hover:bg-neutral-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all"
                            onClick={() => setSelectedOrderId(item.id)}
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
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

// ─── OrderDetailView Sub-component ───────────────────────────────────────────

function OrderDetailView({ orderId, onBack }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Form states
  const [status, setStatus] = useState("PENDING");
  const [courier, setCourier] = useState("Delhivery");
  const [trackingId, setTrackingId] = useState("");

  const loadOrder = async () => {
    setLoading(true);
    try {
      const res = await adminApi.orders.get(orderId);
      if (res.success && res.data) {
        setOrder(res.data);
        setStatus(res.data.status);
        
        const tr = parseTracking(res.data.trackingNumber);
        setCourier(tr.courier);
        setTrackingId(tr.number);
      } else {
        throw new Error("Unable to fetch order detail.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrder();
  }, [orderId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    // Package the tracking field as Courier: TrackingID
    const trackingNumber = trackingId.trim() ? `${courier.trim()}: ${trackingId.trim()}` : "";

    try {
      await adminApi.orders.update(orderId, {
        status,
        trackingNumber,
      });
      setMessage("Order updated successfully!");
      // Reload order details
      void loadOrder();
    } catch (err) {
      setError(err.message || "Failed to update order.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-operations-page min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-neutral-400" size={32} />
          <p className="text-sm text-neutral-500 font-medium">Syncing order details…</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="admin-operations-page p-6 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl max-w-md mx-auto">
          <p className="font-bold">Error loading order</p>
          <p className="text-sm mt-1">{error}</p>
          <button className="admin-refresh-button mt-4 mx-auto" onClick={onBack}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="admin-operations-page min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-neutral-400" size={32} />
          <p className="text-sm text-neutral-500 font-medium">Loading order details…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-operations-page max-w-6xl mx-auto px-4 md:px-0">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black mb-2 transition-all">
            <ArrowLeft size={14} /> Back to orders queue
          </button>
          <h1 className="font-display text-2xl font-extrabold text-neutral-900 flex items-center gap-2">
            Order Detail <span className="font-mono text-neutral-400">#{order.id.slice(-8).toUpperCase()}</span>
          </h1>
        </div>
      </header>

      {message && <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">{message}</div>}
      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Items & Info) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Details Card */}
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2 mb-5">
              <ShoppingBag size={15} /> Order Items
            </h2>
            <div className="divide-y divide-neutral-100">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between first:pt-0 last:pb-0 gap-4">
                  <div className="flex items-center gap-4">
                    {item.imageSnapshot ? (
                      <img
                        src={item.imageSnapshot}
                        alt={item.titleSnapshot}
                        className="w-14 h-14 object-cover rounded-xl border border-neutral-100"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-neutral-50 border border-neutral-100 rounded-xl flex items-center justify-center text-neutral-400">
                        <ShoppingBag size={20} />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-neutral-900">{item.titleSnapshot}</p>
                      {item.variantSnapshot && (
                        <p className="text-xs text-neutral-400 mt-0.5">Size: <strong className="text-neutral-600 font-bold">{item.variantSnapshot}</strong></p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-neutral-900 font-bold">
                      {item.quantity} × {currency.format(Number(item.priceSnapshot))}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Subtotal: {currency.format(Number(item.priceSnapshot) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="mt-6 pt-6 border-t border-dashed border-neutral-100 space-y-2.5 max-w-xs ml-auto">
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Subtotal</span>
                <span>{currency.format(Number(order.subtotal))}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Discount</span>
                  <span>–{currency.format(Number(order.discount))}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Shipping</span>
                <span>{Number(order.shippingCharge) === 0 ? "Free" : currency.format(Number(order.shippingCharge))}</span>
              </div>
              <div className="flex justify-between text-base text-neutral-900 font-extrabold pt-2.5 border-t border-neutral-100">
                <span>Total Amount</span>
                <span>{currency.format(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* Payment & General Details Card */}
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 mb-3">
                <CreditCard size={14} /> Payment Information
              </h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between border-b border-neutral-50 pb-1.5">
                  <span className="text-neutral-500">Gateway:</span>
                  <span className="font-bold text-neutral-800">Razorpay</span>
                </div>
                <div className="flex justify-between border-b border-neutral-50 pb-1.5">
                  <span className="text-neutral-500">Payment Status:</span>
                  <span className={`font-bold text-xs uppercase px-2 py-0.5 rounded-full ${
                    order.payment?.status === "PAID" 
                      ? "bg-green-50 text-green-700" 
                      : "bg-orange-50 text-orange-700"
                  }`}>
                    {order.payment?.status || "PENDING"}
                  </span>
                </div>
                {order.payment?.razorpayPaymentId && (
                  <div className="flex justify-between border-b border-neutral-50 pb-1.5">
                    <span className="text-neutral-500">Razorpay Payment ID:</span>
                    <span className="font-mono text-xs font-bold text-neutral-800">{order.payment.razorpayPaymentId}</span>
                  </div>
                )}
                {order.payment?.razorpayOrderId && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Razorpay Order ID:</span>
                    <span className="font-mono text-xs text-neutral-500">{order.payment.razorpayOrderId}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 mb-3">
                <Calendar size={14} /> Timestamps
              </h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between border-b border-neutral-50 pb-1.5">
                  <span className="text-neutral-500">Placed At:</span>
                  <span className="font-bold text-neutral-800">{new Date(order.createdAt).toLocaleString("en-IN")}</span>
                </div>
                {order.shippedAt && (
                  <div className="flex justify-between border-b border-neutral-50 pb-1.5">
                    <span className="text-neutral-500">Dispatched At:</span>
                    <span className="font-bold text-neutral-800">{new Date(order.shippedAt).toLocaleString("en-IN")}</span>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Delivered At:</span>
                    <span className="font-bold text-neutral-800">{new Date(order.deliveredAt).toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Fulfillment Controls & Addresses) */}
        <div className="space-y-6">
          
          {/* Fulfillment Form Card */}
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2 mb-5">
              <Truck size={15} /> Shipment Fulfillment
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Order Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:border-black outline-none"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Shipping Partner</label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:border-black outline-none"
                >
                  <option value="Delhivery">Delhivery</option>
                  <option value="BlueDart">BlueDart</option>
                  <option value="FedEx">FedEx</option>
                  <option value="DHL">DHL</option>
                  <option value="DTDC">DTDC</option>
                  <option value="Ecom Express">Ecom Express</option>
                  <option value="Other">Other / Hand Delivered</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Tracking ID</label>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. 128919018012"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:border-black outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#0E0D0B] hover:bg-neutral-800 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Save size={16} /> {saving ? "Saving Changes…" : "Update Fulfillment"}
              </button>
            </form>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2 mb-5">
              <MapPin size={15} /> Delivery Destination
            </h2>
            {order.address ? (
              <div className="text-sm text-neutral-800 space-y-1.5">
                <p className="font-extrabold text-neutral-900 text-base">{order.address.name}</p>
                <p className="text-neutral-600">{order.address.line1}</p>
                {order.address.line2 && <p className="text-neutral-600">{order.address.line2}</p>}
                <p className="text-neutral-600">
                  {order.address.city}, {order.address.state} — <strong className="text-neutral-900 font-bold">{order.address.pincode}</strong>
                </p>
                <p className="text-neutral-500 font-bold flex items-center gap-1.5 pt-3 border-t border-neutral-50">
                  <Phone size={13} className="text-neutral-400" /> {order.address.phone}
                </p>
              </div>
            ) : (
              <p className="text-sm text-neutral-400 italic">No delivery address saved</p>
            )}
          </div>

          {/* Customer Details Card */}
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2 mb-5">
              <User size={15} /> Buyer Profile
            </h2>
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <User size={14} className="text-neutral-400" />
                <span className="font-bold text-neutral-800">{order.user?.name || "Guest Account"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-neutral-400" />
                <span className="text-neutral-500 font-medium">{order.user?.email || "No email info"}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
