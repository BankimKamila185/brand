"use client";

import { useEffect, useState } from "react";
import { Check, RefreshCw, ShieldCheck, Trash2, MapPin, Truck, ShoppingBag, Phone, ArrowLeft, Save, CreditCard, User, Mail, Calendar, X, Edit } from "lucide-react";
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

  // Add Admin Modal State
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminRole, setAdminRole] = useState("ADMIN");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminMsg, setAdminMsg] = useState("");

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("USER");
  const [savingUser, setSavingUser] = useState(false);
  const [editUserMsg, setEditUserMsg] = useState("");
  
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

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAddingAdmin(true);
    setAdminMsg("");
    try {
      await adminApi.users.createAdmin({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        phone: adminPhone || undefined,
        role: adminRole,
      });
      setShowAddAdminModal(false);
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("");
      setAdminPhone("");
      setAdminRole("ADMIN");
      void load();
    } catch (err) {
      setAdminMsg(err.message || "Failed to create admin user.");
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingUser(true);
    setEditUserMsg("");
    try {
      await adminApi.users.update(editingUser.id, {
        name: editName,
        email: editEmail,
        phone: editPhone || undefined,
        role: editRole,
      });
      setEditingUser(null);
      void load();
    } catch (err) {
      setEditUserMsg(err.message || "Failed to update user details.");
    } finally {
      setSavingUser(false);
    }
  };

  const headers =
    type === "orders"
      ? ["Order ID", "Customer", "Date", "Total", "Status", "Tracking"]
      : type === "users"
      ? ["Member", "Email address", "Phone Number", "Role", "Joined", "Actions"]
      : ["Product", "Review", "Rating", "State", "Moderate"];

  return (
    <div className="admin-operations-page">
      <header className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">Operations desk</p>
          <h1>{title}</h1>
          <p>Manage and review live {title.toLowerCase()} for The Outliers Studio.</p>
        </div>
        <div className="flex items-center gap-2">
          {type === "users" && (
            <button
              type="button"
              className="admin-primary-button text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer"
              onClick={() => setShowAddAdminModal(true)}
            >
              <User className="size-3.5" /> + Add Admin
            </button>
          )}
          <button className="admin-refresh-button" onClick={() => void load()}>
            <RefreshCw className="size-4" /> Refresh
          </button>
        </div>
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

        {type === "orders" && (
          <div className="bg-[#fff4d8] border border-[#bd7410]/20 text-[#bd7410] text-xs font-semibold px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
            <span>💡</span>
            <span>Tip: Click anywhere on an order's row to open details, change status, and add tracking codes.</span>
          </div>
        )}

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
                      <tr
                        key={item.id}
                        className="hover:bg-neutral-50 cursor-pointer transition-all duration-200"
                        onClick={() => setSelectedOrderId(item.id)}
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
                        <td className="text-xs text-neutral-500">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }) : "—"}
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
                      </tr>
                    );
                  }

                  if (type === "users") {
                    const phoneNum = item.phone || item.addresses?.[0]?.phone || "—";
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="admin-member font-bold text-neutral-900">
                            <i>{item.name?.slice(0, 1) || "U"}</i>
                            {item.name || "User"}
                          </div>
                        </td>
                        <td className="text-neutral-600 font-medium">{item.email}</td>
                        <td className="admin-mono text-xs font-semibold text-neutral-700">{phoneNum}</td>
                        <td>
                          <select
                            value={item.role}
                            onChange={async (e) => {
                              const newRole = e.target.value;
                              try {
                                await adminApi.users.updateRole(item.id, newRole);
                                void load();
                              } catch (err) {
                                alert(err.message || "Failed to update role");
                              }
                            }}
                            className={`admin-status-badge status-${item.role.toLowerCase()} cursor-pointer outline-none border-0 font-bold`}
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                          </select>
                        </td>
                        <td className="text-xs text-neutral-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}</td>
                        <td>
                          <div className="admin-operation-actions">
                            <button
                              className="admin-table-action"
                              onClick={() => {
                                setEditingUser(item);
                                setEditName(item.name || "");
                                setEditEmail(item.email || "");
                                setEditPhone(item.phone || "");
                                setEditRole(item.role || "USER");
                                setEditUserMsg("");
                              }}
                              title="Edit User Access & Info"
                            >
                              <Edit className="size-4" />
                            </button>
                            <button
                              className="admin-table-action delete"
                              onClick={async () => {
                                if (window.confirm(`Delete user account "${item.email}"?`)) {
                                  try {
                                    await adminApi.users.remove(item.id);
                                    void load();
                                  } catch (err) {
                                    alert(err.message || "Failed to delete user");
                                  }
                                }
                              }}
                              title="Delete User"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={item.id}>
                      <td>{item.product?.title || "Product unavailable"}</td>
                      <td className="admin-review-copy">
                        <div>{item.title || item.body || "Untitled review"}</div>
                        {item.images && item.images.length > 0 && (
                          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                            {item.images.map((imgSrc, imgIdx) => (
                              <img
                                key={imgIdx}
                                src={imgSrc}
                                alt="Review attachment"
                                style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4, border: "1px solid #e2e8f0" }}
                              />
                            ))}
                          </div>
                        )}
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

      {/* Add Admin User Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-neutral-100 flex flex-col gap-5 relative">
            <button
              type="button"
              onClick={() => {
                setShowAddAdminModal(false);
                setAdminMsg("");
              }}
              className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-md">
                <User className="size-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-neutral-900">
                  Add Admin Account
                </h3>
                <p className="text-xs text-neutral-500 font-medium">
                  Manually create an administrative user account.
                </p>
              </div>
            </div>

            {adminMsg && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {adminMsg}
              </p>
            )}

            <form onSubmit={handleCreateAdmin} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-xs font-bold text-neutral-700">
                Full Name
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  className="p-3 rounded-xl border border-neutral-300 text-sm outline-none focus:border-neutral-900 transition-colors"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold text-neutral-700">
                Email Address
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@tevar.in"
                  required
                  className="p-3 rounded-xl border border-neutral-300 text-sm outline-none focus:border-neutral-900 transition-colors"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold text-neutral-700">
                Password
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="p-3 rounded-xl border border-neutral-300 text-sm outline-none focus:border-neutral-900 transition-colors"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold text-neutral-700">
                Phone Number (Optional)
                <input
                  type="tel"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="p-3 rounded-xl border border-neutral-300 text-sm outline-none focus:border-neutral-900 transition-colors"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold text-neutral-700">
                Role
                <select
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value)}
                  className="p-3 rounded-xl border border-neutral-300 text-sm outline-none focus:border-neutral-900 transition-colors cursor-pointer"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="USER">USER</option>
                </select>
              </label>

              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddAdminModal(false);
                    setAdminMsg("");
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingAdmin}
                  className="flex-1 py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer disabled:opacity-50"
                >
                  {addingAdmin ? "Creating…" : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Details & Access Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-neutral-100 flex flex-col gap-5 relative">
            <button
              type="button"
              onClick={() => {
                setEditingUser(null);
                setEditUserMsg("");
              }}
              className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-md">
                <Edit className="size-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-neutral-900">
                  Edit User Access
                </h3>
                <p className="text-xs text-neutral-500 font-medium">
                  Update account info, email, phone & role level.
                </p>
              </div>
            </div>

            {editUserMsg && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {editUserMsg}
              </p>
            )}

            <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-xs font-bold text-neutral-700">
                Full Name
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Full Name"
                  required
                  className="p-3 rounded-xl border border-neutral-300 text-sm outline-none focus:border-neutral-900 transition-colors"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold text-neutral-700">
                Email Address
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="p-3 rounded-xl border border-neutral-300 text-sm outline-none focus:border-neutral-900 transition-colors"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold text-neutral-700">
                Phone Number
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="p-3 rounded-xl border border-neutral-300 text-sm outline-none focus:border-neutral-900 transition-colors"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold text-neutral-700">
                Role Access Level
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="p-3 rounded-xl border border-neutral-300 text-sm outline-none focus:border-neutral-900 transition-colors cursor-pointer"
                >
                  <option value="USER">USER (Customer)</option>
                  <option value="ADMIN">ADMIN (Operations & Dashboard)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full Privileges)</option>
                </select>
              </label>

              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setEditUserMsg("");
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="flex-1 py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer disabled:opacity-50"
                >
                  {savingUser ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
    <div className="admin-order-detail">
      <header className="admin-order-detail-header">
        <button onClick={onBack} className="admin-back-btn">
          <ArrowLeft size={12} /> Back to orders queue
        </button>
        <h1>
          Order Detail <span className="admin-mono">#{order.id.slice(-8).toUpperCase()}</span>
        </h1>
      </header>

      {message && <div className="product-builder-message">{message}</div>}
      {error && <div className="admin-error-message">{error}</div>}

      <div className="admin-order-detail-grid">
        
        {/* Left Column (Items & Info) */}
        <div className="admin-order-detail-left" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Order Details Card */}
          <div className="admin-detail-card">
            <h2>
              <ShoppingBag size={14} /> Order Items
            </h2>
            <div className="admin-order-items-list">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="admin-order-item-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {item.imageSnapshot ? (
                      <img
                        src={item.imageSnapshot}
                        alt={item.titleSnapshot}
                        className="admin-order-item-thumb"
                      />
                    ) : (
                      <div className="admin-order-item-thumb" style={{ display: 'flex', alignItems: 'center', justifyCenter: 'center', background: '#fafafa' }}>
                        <ShoppingBag size={18} style={{ color: '#a1a1aa' }} />
                      </div>
                    )}
                    <div className="admin-order-item-meta">
                      <strong>{item.titleSnapshot}</strong>
                      {item.variantSnapshot && (
                        <span>Size: {item.variantSnapshot}</span>
                      )}
                    </div>
                  </div>
                  <div className="admin-order-item-pricing">
                    <p>
                      {item.quantity} × {currency.format(Number(item.priceSnapshot))}
                    </p>
                    <span>
                      Subtotal: {currency.format(Number(item.priceSnapshot) * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="admin-order-breakdown">
              <div className="admin-breakdown-row">
                <span>Subtotal</span>
                <strong>{currency.format(Number(order.subtotal))}</strong>
              </div>
              {Number(order.discount) > 0 && (
                <div className="admin-breakdown-row discount">
                  <span>Discount</span>
                  <strong>–{currency.format(Number(order.discount))}</strong>
                </div>
              )}
              <div className="admin-breakdown-row">
                <span>Shipping</span>
                <strong>{Number(order.shippingCharge) === 0 ? "Free" : currency.format(Number(order.shippingCharge))}</strong>
              </div>
              <div className="admin-breakdown-row total">
                <span>Total Amount</span>
                <strong>{currency.format(Number(order.total))}</strong>
              </div>
            </div>
          </div>

          {/* Payment & General Details Card */}
          <div className="admin-detail-card">
            <div className="admin-info-subgrid">
              
              <div className="admin-info-item">
                <h3>
                  <CreditCard size={13} /> Payment Information
                </h3>
                <div className="admin-info-rows">
                  <div className="admin-info-row">
                    <span>Gateway:</span>
                    <strong>Razorpay</strong>
                  </div>
                  <div className="admin-info-row">
                    <span>Payment Status:</span>
                    <strong className={`admin-status-badge status-${(order.payment?.status || "PENDING").toLowerCase()}`}>
                      {order.payment?.status || "PENDING"}
                    </strong>
                  </div>
                  {order.payment?.razorpayPaymentId && (
                    <div className="admin-info-row">
                      <span>Payment ID:</span>
                      <strong className="admin-mono">{order.payment.razorpayPaymentId}</strong>
                    </div>
                  )}
                  {order.payment?.razorpayOrderId && (
                    <div className="admin-info-row">
                      <span>Order ID:</span>
                      <strong className="admin-mono">{order.payment.razorpayOrderId}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-info-item">
                <h3>
                  <Calendar size={13} /> Timestamps
                </h3>
                <div className="admin-info-rows">
                  <div className="admin-info-row">
                    <span>Placed At:</span>
                    <strong>{order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "—"}</strong>
                  </div>
                  {order.shippedAt && (
                    <div className="admin-info-row">
                      <span>Dispatched At:</span>
                      <strong>{order.shippedAt ? new Date(order.shippedAt).toLocaleString("en-IN") : "—"}</strong>
                    </div>
                  )}
                  {order.deliveredAt && (
                    <div className="admin-info-row">
                      <span>Delivered At:</span>
                      <strong>{order.deliveredAt ? new Date(order.deliveredAt).toLocaleString("en-IN") : "—"}</strong>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column (Fulfillment Controls & Addresses) */}
        <div className="admin-order-detail-right" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Fulfillment Form Card */}
          <div className="admin-detail-card">
            <h2>
              <Truck size={14} /> Shipment Fulfillment
            </h2>
            <form onSubmit={handleSave} className="admin-fulfillment-form">
              <div className="admin-form-group">
                <label>Order Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Shipping Partner</label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
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

              <div className="admin-form-group">
                <label>Tracking ID</label>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. 128919018012"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="admin-save-btn"
              >
                <Save size={14} /> {saving ? "Saving Changes…" : "Update Fulfillment"}
              </button>
            </form>
          </div>

          {/* Delivery Address Card */}
          <div className="admin-detail-card">
            <h2>
              <MapPin size={14} /> Delivery Destination
            </h2>
            {order.address ? (
              <div className="admin-address-block">
                <strong>{order.address.name}</strong>
                <p>{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>
                  {order.address.city}, {order.address.state} — <strong>{order.address.pincode}</strong>
                </p>
                <div className="admin-phone-row">
                  <Phone size={12} /> {order.address.phone}
                </div>
              </div>
            ) : (
              <p className="admin-mono" style={{ color: '#a1a1aa', fontStyle: 'italic' }}>No address saved</p>
            )}
          </div>

          {/* Customer Details Card */}
          <div className="admin-detail-card">
            <h2>
              <User size={14} /> Buyer Profile
            </h2>
            <div className="admin-customer-profile">
              <div className="admin-customer-row">
                <User size={12} style={{ color: '#a1a1aa' }} />
                <span>{order.user?.name || "Guest Account"}</span>
              </div>
              <div className="admin-customer-row email">
                <Mail size={12} style={{ color: '#a1a1aa' }} />
                <span>{order.user?.email || "No email info"}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
