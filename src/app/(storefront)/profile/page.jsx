"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ordersApi, usersApi, api } from "@/lib/api";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import {
  User,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  LogOut,
  Edit3,
  Plus,
  Trash2,
  ChevronRight,
  Package,
  Check,
  X,
  Star,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  Home,
  Briefcase,
  Save,
  Eye,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview", icon: User },
  { id: "orders", label: "My Orders", icon: ShoppingBag },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "settings", label: "Account Details", icon: Edit3 },
];

const EMPTY_ADDRESS = {
  label: "Home",
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  isDefault: false,
};

const ORDER_STATUS_CONFIG = {
  pending:    { label: "Pending",     color: "#bd7410", bg: "#fff4d8", icon: Clock },
  confirmed:  { label: "Confirmed",   color: "#16a34a", bg: "#dcfce7", icon: CheckCircle2 },
  processing: { label: "Processing",  color: "#2563eb", bg: "#eff6ff", icon: Package },
  shipped:    { label: "Shipped",     color: "#7c3aed", bg: "#f5f3ff", icon: Truck },
  delivered:  { label: "Delivered",   color: "#1a9e5d", bg: "#e8f3ed", icon: CheckCircle2 },
  cancelled:  { label: "Cancelled",   color: "#d94f3b", bg: "#fef2f2", icon: X },
  refunded:   { label: "Refunded",    color: "#6b7280", bg: "#f3f4f6", icon: X },
};

const ADDRESS_LABELS = ["Home", "Work", "Other"];
const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir",
  "Ladakh","Chandigarh","Puducherry",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

function getInitials(name, email) {
  if (name) {
    const parts = name.trim().split(" ");
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }
  return email?.[0]?.toUpperCase() || "?";
}

function getTrackingSteps(status) {
  const normalized = String(status).toLowerCase();
  
  const steps = [
    { label: "Confirmed", desc: "Order received", active: false, complete: false },
    { label: "Processing", desc: "Packing items", active: false, complete: false },
    { label: "Shipped", desc: "In transit", active: false, complete: false },
    { label: "Delivered", desc: "Arrived", active: false, complete: false },
  ];

  if (normalized === "cancelled") {
    return [
      { label: "Cancelled", desc: "Order cancelled", active: true, complete: false, isCancelled: true }
    ];
  }

  if (normalized === "pending" || normalized === "confirmed") {
    steps[0].active = true;
  } else if (normalized === "processing") {
    steps[0].complete = true;
    steps[1].active = true;
  } else if (normalized === "shipped") {
    steps[0].complete = true;
    steps[1].complete = true;
    steps[2].active = true;
  } else if (normalized === "delivered") {
    steps[0].complete = true;
    steps[1].complete = true;
    steps[2].complete = true;
    steps[3].complete = true;
    steps[3].active = true;
  }

  return steps;
}

function parseTracking(trackingNumber) {
  if (!trackingNumber) return { courier: "", number: "", url: "" };
  if (trackingNumber.includes(":")) {
    const parts = trackingNumber.split(":");
    const courier = parts[0].trim();
    const number = parts.slice(1).join(":").trim();
    
    let url = "";
    const lowerCourier = courier.toLowerCase();
    if (lowerCourier.includes("delhivery")) {
      url = `https://www.delhivery.com/track/package/${number}`;
    } else if (lowerCourier.includes("fedex")) {
      url = `https://www.fedex.com/apps/fedextrack/?tracknumbers=${number}`;
    } else if (lowerCourier.includes("dhl")) {
      url = `https://www.dhl.com/in-en/home/tracking/tracking-express.html?submit=1&tracking-id=${number}`;
    } else if (lowerCourier.includes("bluedart")) {
      url = `https://www.bluedart.com/`;
    } else if (lowerCourier.includes("dtdc")) {
      url = `https://www.dtdc.in/`;
    }
    
    return { courier, number, url };
  }
  return { courier: "", number: trackingNumber, url: "" };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg =
    ORDER_STATUS_CONFIG[String(status).toLowerCase()] ||
    ORDER_STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className="profile-order-status"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}

function AddressCard({ address, onEdit, onDelete, onSetDefault }) {
  const LabelIcon = address.label === "Work" ? Briefcase : Home;
  return (
    <div className={`profile-address-card${address.isDefault ? " is-default" : ""}`}>
      {address.isDefault && (
        <span className="profile-address-default-badge">
          <Check size={10} /> Default
        </span>
      )}
      <div className="profile-address-label-row">
        <LabelIcon size={14} />
        <strong>{address.label || "Home"}</strong>
      </div>
      <p className="profile-address-name">{address.name}</p>
      <p className="profile-address-text">
        {address.line1}
        {address.line2 ? `, ${address.line2}` : ""}
      </p>
      <p className="profile-address-text">
        {address.city}, {address.state} – {address.pincode}
      </p>
      <p className="profile-address-text">{address.country}</p>
      {address.phone && (
        <p className="profile-address-phone">
          <Phone size={12} /> {address.phone}
        </p>
      )}
      <div className="profile-address-actions">
        {!address.isDefault && (
          <button
            className="profile-addr-btn profile-addr-btn--ghost"
            onClick={() => onSetDefault(address.id)}
          >
            Set Default
          </button>
        )}
        <button
          className="profile-addr-btn profile-addr-btn--ghost"
          onClick={() => onEdit(address)}
        >
          <Edit3 size={13} /> Edit
        </button>
        <button
          className="profile-addr-btn profile-addr-btn--danger"
          onClick={() => onDelete(address.id)}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

async function getCurrentLocationAddress(onSuccess, onError) {
  if (!navigator.geolocation) {
    onError("Geolocation is not supported by your browser");
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();
        if (data.address) {
          const address = {
            line1: data.address.road ? `${data.address.house_number || ""} ${data.address.road}`.trim() : "",
            line2: data.address.suburb || data.address.neighbourhood || "",
            city: data.address.city || data.address.town || data.address.village || "",
            state: data.address.state || "",
            pincode: data.address.postcode || "",
            country: data.address.country || "India"
          };
          onSuccess(address);
        } else {
          onError("Could not retrieve address from location");
        }
      } catch {
        onError("Failed to fetch address from location");
      }
    },
    (geoError) => {
      onError(geoError.message || "Failed to get current location");
    }
  );
}

function AddressForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial || EMPTY_ADDRESS);
  const [errors, setErrors] = useState({});
  const [locating, setLocating] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter valid 10-digit number";
    if (!form.line1.trim()) e.line1 = "Address line 1 is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!form.pincode.trim()) e.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter valid 6-digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSave(form);
  };

  return (
    <form className="profile-addr-form" onSubmit={handleSubmit} noValidate>
      {/* Label selector */}
      <div className="profile-addr-form-field">
        <label className="profile-addr-form-label">Address Type</label>
        <div className="profile-addr-label-pills">
          {ADDRESS_LABELS.map((l) => (
            <button
              key={l}
              type="button"
              className={`profile-addr-label-pill${form.label === l ? " active" : ""}`}
              onClick={() => set("label", l)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <button
          type="button"
          onClick={() => {
            setLocating(true);
            setErrors({});
            getCurrentLocationAddress(
              (addr) => {
                setForm((prev) => ({ ...prev, ...addr }));
                setLocating(false);
              },
              (err) => {
                setErrors({ general: err });
                setLocating(false);
              }
            );
          }}
          className="w-full flex items-center justify-center gap-2 bg-[#0E0D0B] hover:bg-[#1C1B18] px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all duration-200 rounded-lg disabled:opacity-50"
          disabled={locating}
        >
          <MapPin size={14} /> {locating ? "Getting location..." : "Use Current Location"}
        </button>
        {errors.general && <p className="mt-2 text-xs text-red-600">{errors.general}</p>}
      </div>
      <div className="profile-addr-form-grid">
        <div className="profile-addr-form-field">
          <label className="profile-addr-form-label">Full Name *</label>
          <input
            className={`profile-addr-input${errors.name ? " error" : ""}`}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Your full name"
          />
          {errors.name && <span className="profile-addr-error">{errors.name}</span>}
        </div>
        <div className="profile-addr-form-field">
          <label className="profile-addr-form-label">Phone Number *</label>
          <input
            className={`profile-addr-input${errors.phone ? " error" : ""}`}
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="10-digit mobile number"
            maxLength={10}
          />
          {errors.phone && <span className="profile-addr-error">{errors.phone}</span>}
        </div>
      </div>

      <div className="profile-addr-form-field">
        <label className="profile-addr-form-label">Address Line 1 *</label>
        <input
          className={`profile-addr-input${errors.line1 ? " error" : ""}`}
          value={form.line1}
          onChange={(e) => set("line1", e.target.value)}
          placeholder="Flat, House No., Building, Street"
        />
        {errors.line1 && <span className="profile-addr-error">{errors.line1}</span>}
      </div>

      <div className="profile-addr-form-field">
        <label className="profile-addr-form-label">Address Line 2</label>
        <input
          className="profile-addr-input"
          value={form.line2}
          onChange={(e) => set("line2", e.target.value)}
          placeholder="Area, Colony, Locality (optional)"
        />
      </div>

      <div className="profile-addr-form-grid profile-addr-form-grid--3">
        <div className="profile-addr-form-field">
          <label className="profile-addr-form-label">City *</label>
          <input
            className={`profile-addr-input${errors.city ? " error" : ""}`}
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="City"
          />
          {errors.city && <span className="profile-addr-error">{errors.city}</span>}
        </div>
        <div className="profile-addr-form-field">
          <label className="profile-addr-form-label">State *</label>
          <select
            className={`profile-addr-input profile-addr-select${errors.state ? " error" : ""}`}
            value={form.state}
            onChange={(e) => set("state", e.target.value)}
          >
            <option value="">Select state</option>
            {INDIA_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.state && <span className="profile-addr-error">{errors.state}</span>}
        </div>
        <div className="profile-addr-form-field">
          <label className="profile-addr-form-label">Pincode *</label>
          <input
            className={`profile-addr-input${errors.pincode ? " error" : ""}`}
            value={form.pincode}
            onChange={(e) => set("pincode", e.target.value)}
            placeholder="6-digit pincode"
            maxLength={6}
          />
          {errors.pincode && <span className="profile-addr-error">{errors.pincode}</span>}
        </div>
      </div>

      <div className="profile-addr-form-field profile-addr-form-field--checkbox">
        <label className="profile-addr-checkbox-label">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => set("isDefault", e.target.checked)}
          />
          <span>Set as default address</span>
        </label>
      </div>

      <div className="profile-addr-form-actions">
        <button type="button" className="profile-addr-btn profile-addr-btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="profile-addr-btn profile-addr-btn--primary" disabled={loading}>
          {loading ? (
            <span className="profile-spinner" />
          ) : (
            <><Save size={14} /> Save Address</>
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [hasMoreOrders, setHasMoreOrders] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrForm, setAddrForm] = useState(null); // null = hidden, obj = editing
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrError, setAddrError] = useState("");
  const [addrSuccess, setAddrSuccess] = useState("");

  // Settings
  const [settingsForm, setSettingsForm] = useState({ name: "", phone: "" });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");

  // ── Redirect if not authenticated ─────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  // ── Read active tab and order ID from URL on mount ────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && TABS.some((t) => t.id === tab)) {
        setActiveTab(tab);
      }
      const orderId = params.get("orderId");
      if (orderId) {
        setExpandedOrder(orderId);
      }
    }
  }, []);

  // ── Sync settings form from user ──────────────────────────────────────────
  useEffect(() => {
    if (user) {
      setSettingsForm({ name: user.name || "", phone: user.phone || "" });
    }
  }, [user]);

  // ── Fetch orders ──────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (page = 1) => {
    setOrdersLoading(true);
    try {
      const res = await ordersApi.list(page);
      const items = res.data?.orders || res.data || [];
      if (page === 1) {
        setOrders(items);
      } else {
        setOrders((prev) => [...prev, ...items]);
      }
      setHasMoreOrders(items.length >= 10);
    } catch {
      // silently fail
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "orders" && orders.length === 0) {
      fetchOrders(1);
    }
  }, [activeTab, fetchOrders, orders.length]);

  // ── Fetch addresses ───────────────────────────────────────────────────────
  const fetchAddresses = useCallback(async () => {
    setAddrLoading(true);
    try {
      const res = await usersApi.getAddresses();
      setAddresses(res.data || []);
    } catch {
      // silently fail
    } finally {
      setAddrLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "addresses") {
      fetchAddresses();
    }
  }, [activeTab, fetchAddresses]);

  // ── Address handlers ──────────────────────────────────────────────────────
  const handleSaveAddress = async (formData) => {
    setAddrSaving(true);
    setAddrError("");
    try {
      if (formData.id) {
        await usersApi.updateAddress(formData.id, formData);
      } else {
        await usersApi.addAddress(formData);
      }
      await fetchAddresses();
      setAddrForm(null);
      setAddrSuccess("Address saved successfully!");
      setTimeout(() => setAddrSuccess(""), 3000);
    } catch (err) {
      setAddrError(err.message || "Failed to save address");
    } finally {
      setAddrSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm("Delete this address?")) return;
    try {
      await usersApi.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Failed to delete address");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await usersApi.updateAddress(id, { isDefault: true });
      await fetchAddresses();
    } catch {
      alert("Failed to update default address");
    }
  };

  // ── Settings handler ──────────────────────────────────────────────────────
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsError("");
    setSettingsSuccess("");
    try {
      await api.patch("/api/users/me", settingsForm);
      await refreshUser();
      setSettingsSuccess("Profile updated successfully!");
      setTimeout(() => setSettingsSuccess(""), 3000);
    } catch (err) {
      setSettingsError(err.message || "Failed to update profile");
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="profile-page-loading">
        <span className="profile-spinner profile-spinner--lg" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const initials = getInitials(user?.name, user?.email);
  const totalSpend = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="profile-page">
        <div className="profile-container">

          {/* ── Sidebar ── */}
          <aside className="profile-sidebar">
            {/* Avatar */}
            <div className="profile-avatar-card">
              <div className="profile-avatar">
                <span>{initials}</span>
              </div>
              <div className="profile-avatar-info">
                <strong>{user?.name || "Hey there!"}</strong>
                <span>{user?.email}</span>
                {user?.phone && (
                  <span className="profile-avatar-phone">
                    <Phone size={11} /> {user.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Nav */}
            <nav className="profile-nav">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  className={`profile-nav-item${activeTab === id ? " active" : ""}`}
                  onClick={() => setActiveTab(id)}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                  <ChevronRight size={14} className="profile-nav-arrow" />
                </button>
              ))}
              <hr className="profile-nav-divider" />
              <button className="profile-nav-item profile-nav-item--danger" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* ── Main Content ── */}
          <section className="profile-content">

            {/* ────────── OVERVIEW ────────── */}
            {activeTab === "overview" && (
              <div className="profile-section">
                <div className="profile-section-header">
                  <h1 className="profile-section-title">
                    Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
                  </h1>
                  <p className="profile-section-subtitle">Here's a quick look at your account</p>
                </div>

                {/* Stats */}
                <div className="profile-stats-grid">
                  <div className="profile-stat-card">
                    <div className="profile-stat-icon profile-stat-icon--amber">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <span className="profile-stat-label">Total Orders</span>
                      <strong className="profile-stat-value">{orders.length}</strong>
                    </div>
                  </div>
                  <div className="profile-stat-card">
                    <div className="profile-stat-icon profile-stat-icon--green">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <span className="profile-stat-label">Delivered</span>
                      <strong className="profile-stat-value">{deliveredCount}</strong>
                    </div>
                  </div>
                  <div className="profile-stat-card">
                    <div className="profile-stat-icon profile-stat-icon--violet">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <span className="profile-stat-label">Saved Addresses</span>
                      <strong className="profile-stat-value">{addresses.length}</strong>
                    </div>
                  </div>
                  <div className="profile-stat-card">
                    <div className="profile-stat-icon profile-stat-icon--blue">
                      <Star size={20} />
                    </div>
                    <div>
                      <span className="profile-stat-label">Total Spent</span>
                      <strong className="profile-stat-value">{formatCurrency(totalSpend)}</strong>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="profile-quick-actions">
                  <button className="profile-quick-action" onClick={() => setActiveTab("orders")}>
                    <ShoppingBag size={18} />
                    <span>View Orders</span>
                    <ChevronRight size={14} />
                  </button>
                  <button className="profile-quick-action" onClick={() => setActiveTab("addresses")}>
                    <MapPin size={18} />
                    <span>Manage Addresses</span>
                    <ChevronRight size={14} />
                  </button>
                  <button className="profile-quick-action" onClick={() => setActiveTab("settings")}>
                    <Edit3 size={18} />
                    <span>Edit Profile</span>
                    <ChevronRight size={14} />
                  </button>
                  <Link href="/" className="profile-quick-action">
                    <Package size={18} />
                    <span>Continue Shopping</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                {/* Recent orders preview */}
                {orders.length > 0 && (
                  <div className="profile-recent-orders">
                    <div className="profile-recent-orders-header">
                      <h2>Recent Orders</h2>
                      <button onClick={() => setActiveTab("orders")} className="profile-view-all">
                        View all <ChevronRight size={13} />
                      </button>
                    </div>
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="profile-recent-order-row">
                        <div className="profile-recent-order-id">
                          <Package size={14} />
                          <span>#{order.orderNumber || order.id?.slice(-8)?.toUpperCase()}</span>
                        </div>
                        <span className="profile-recent-order-date">{formatDate(order.createdAt)}</span>
                        <StatusBadge status={order.status} />
                        <strong className="profile-recent-order-total">{formatCurrency(order.total)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ────────── ORDERS ────────── */}
            {activeTab === "orders" && (
              <div className="profile-section">
                <div className="profile-section-header">
                  <h1 className="profile-section-title">My Orders</h1>
                  <p className="profile-section-subtitle">Track and manage all your purchases</p>
                </div>

                {ordersLoading && orders.length === 0 ? (
                  <div className="profile-loading-state">
                    <span className="profile-spinner" />
                    <span>Loading orders…</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="profile-empty-state">
                    <ShoppingBag size={48} />
                    <h3>No orders yet</h3>
                    <p>You haven't placed any orders. Start shopping!</p>
                    <Link href="/" className="profile-cta-btn">
                      Shop Now
                    </Link>
                  </div>
                ) : (
                  <div className="profile-orders-list">
                    {orders.map((order) => (
                      <div key={order.id} className="profile-order-card">
                        {/* Order header */}
                        <div
                          className="profile-order-header"
                          onClick={() =>
                            setExpandedOrder(expandedOrder === order.id ? null : order.id)
                          }
                        >
                          <div className="profile-order-meta">
                            <div className="profile-order-id-row">
                              <Package size={15} />
                              <strong>
                                Order #{order.orderNumber || order.id?.slice(-8)?.toUpperCase()}
                              </strong>
                            </div>
                            <span className="profile-order-date">{formatDate(order.createdAt)}</span>
                          </div>
                          <div className="profile-order-right">
                            <StatusBadge status={order.status} />
                            <strong className="profile-order-total">
                              {formatCurrency(order.total)}
                            </strong>
                            <ChevronRight
                              size={16}
                              className={`profile-order-chevron${expandedOrder === order.id ? " open" : ""}`}
                            />
                          </div>
                        </div>

                        {/* Expanded order details */}
                        {expandedOrder === order.id && (
                          <div className="profile-order-body">
                            {/* Items */}
                            <div className="profile-order-items">
                              {(order.items || order.orderItems || []).map((item, i) => (
                                <div key={i} className="profile-order-item">
                                  <div className="profile-order-item-img">
                                    {item.imageSnapshot || item.image || item.product?.images?.[0]?.src ? (
                                      <img
                                        src={item.imageSnapshot || item.image || item.product?.images?.[0]?.src}
                                        alt={item.titleSnapshot || item.title || item.product?.title}
                                        onError={(e) => { e.target.style.display = "none"; }}
                                      />
                                    ) : (
                                      <Package size={20} />
                                    )}
                                  </div>
                                  <div className="profile-order-item-info">
                                    <strong>{item.titleSnapshot || item.title || item.product?.title || "Product"}</strong>
                                    {(item.variantSnapshot || item.variantTitle || item.size) && (
                                      <span>Size: {item.variantSnapshot || item.variantTitle || item.size}</span>
                                    )}
                                    <span>Qty: {item.quantity}</span>
                                  </div>
                                  <strong className="profile-order-item-price">
                                    {formatCurrency(Number(item.priceSnapshot || item.price || 0) * item.quantity)}
                                  </strong>
                                </div>
                              ))}
                            </div>

                            {/* Order summary */}
                            <div className="profile-order-summary">
                              <div className="profile-order-summary-row">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.subtotal || order.total)}</span>
                              </div>
                              {order.discount > 0 && (
                                <div className="profile-order-summary-row profile-order-summary-row--discount">
                                  <span>Discount</span>
                                  <span>–{formatCurrency(order.discount)}</span>
                                </div>
                              )}
                              {order.shippingCost > 0 && (
                                <div className="profile-order-summary-row">
                                  <span>Shipping</span>
                                  <span>{formatCurrency(order.shippingCost)}</span>
                                </div>
                              )}
                              <div className="profile-order-summary-row profile-order-summary-row--total">
                                <span>Total</span>
                                <strong>{formatCurrency(order.total)}</strong>
                              </div>
                            </div>

                            {/* Shipping address */}
                            {order.shippingAddress && (
                              <div className="profile-order-shipping">
                                <p className="profile-order-shipping-label">
                                  <MapPin size={13} /> Shipping Address
                                </p>
                                <p>
                                  {order.shippingAddress.name}<br />
                                  {order.shippingAddress.line1}
                                  {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}<br />
                                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                                  – {order.shippingAddress.pincode}
                                </p>
                              </div>
                            )}

                            {/* Payment info */}
                            {order.paymentMethod && (
                              <div className="profile-order-payment">
                                <span className="profile-order-payment-badge">
                                  {order.paymentMethod === "razorpay" ? "Paid via Razorpay" : order.paymentMethod}
                                </span>
                                {order.paymentId && (
                                  <span className="profile-order-payment-id">
                                    ID: {order.paymentId}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Shipment Tracker Timeline */}
                            <div className="profile-order-tracking mt-6 pt-6 border-t border-neutral-100">
                              <p className="profile-order-shipping-label flex items-center gap-1.5 text-xs font-bold text-neutral-800 uppercase tracking-wider mb-4">
                                <Truck size={14} /> Shipment Tracker
                              </p>
                              
                              {order.trackingNumber && (() => {
                                const tr = parseTracking(order.trackingNumber);
                                return (
                                  <div className="mb-5 flex flex-wrap items-center gap-3">
                                    <div className="text-sm bg-neutral-50 px-4 py-3 rounded-xl border border-neutral-200 flex flex-wrap items-center gap-x-4 gap-y-2">
                                      {tr.courier && (
                                        <span className="flex items-center gap-1.5 text-neutral-600 font-medium">
                                          <Truck size={14} className="text-neutral-400" />
                                          Courier: <strong className="text-neutral-800">{tr.courier}</strong>
                                        </span>
                                      )}
                                      <span className="flex items-center gap-1.5 text-neutral-600 font-medium border-l border-neutral-200 pl-0 md:pl-4">
                                        Tracking ID: <strong className="font-mono text-neutral-900">{tr.number}</strong>
                                      </span>
                                    </div>
                                    {tr.url && (
                                      <a
                                        href={tr.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs bg-[#0E0D0B] text-white hover:bg-neutral-800 font-bold px-4 py-3.5 rounded-xl transition-all duration-200"
                                      >
                                        Track shipment ↗
                                      </a>
                                    )}
                                  </div>
                                );
                              })()}

                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 mt-2">
                                {getTrackingSteps(order.status).map((step, idx, arr) => (
                                  <div key={step.label} className="flex-1 w-full relative">
                                    <div className="flex md:flex-col items-center gap-3 md:gap-2 text-left md:text-center">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                        step.isCancelled 
                                          ? "bg-red-500 text-white"
                                          : step.complete
                                            ? "bg-[#1a9e5d] text-white"
                                            : step.active
                                              ? "bg-[#0E0D0B] text-white ring-4 ring-neutral-100"
                                              : "bg-neutral-100 text-neutral-400"
                                      }`}>
                                        {step.isCancelled ? "✕" : step.complete ? "✓" : idx + 1}
                                      </div>
                                      <div>
                                        <p className={`text-sm font-bold ${step.active ? "text-neutral-900" : "text-neutral-500"}`}>{step.label}</p>
                                        <p className="text-xs text-neutral-400">{step.desc}</p>
                                      </div>
                                    </div>
                                    {/* Line connector between steps */}
                                    {idx < arr.length - 1 && !step.isCancelled && (
                                      <div className={`hidden md:block absolute top-4 left-[calc(50%+16px)] right-[calc(-50%+16px)] h-0.5 transition-all duration-300 ${
                                        step.complete ? "bg-[#1a9e5d]" : "bg-neutral-200"
                                      }`} style={{ top: '16px' }} />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Load more */}
                    {hasMoreOrders && (
                      <button
                        className="profile-load-more"
                        onClick={() => {
                          const next = ordersPage + 1;
                          setOrdersPage(next);
                          fetchOrders(next);
                        }}
                        disabled={ordersLoading}
                      >
                        {ordersLoading ? <span className="profile-spinner" /> : "Load More Orders"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ────────── ADDRESSES ────────── */}
            {activeTab === "addresses" && (
              <div className="profile-section">
                <div className="profile-section-header">
                  <div>
                    <h1 className="profile-section-title">Saved Addresses</h1>
                    <p className="profile-section-subtitle">Manage your delivery addresses</p>
                  </div>
                  {!addrForm && (
                    <button
                      className="profile-add-btn"
                      onClick={() => setAddrForm(EMPTY_ADDRESS)}
                    >
                      <Plus size={15} /> Add New
                    </button>
                  )}
                </div>

                {/* Alerts */}
                {addrSuccess && (
                  <div className="profile-alert profile-alert--success">
                    <CheckCircle2 size={15} /> {addrSuccess}
                  </div>
                )}
                {addrError && (
                  <div className="profile-alert profile-alert--error">
                    <AlertCircle size={15} /> {addrError}
                  </div>
                )}

                {/* Inline address form */}
                {addrForm && (
                  <div className="profile-addr-form-card">
                    <h3>{addrForm.id ? "Edit Address" : "Add New Address"}</h3>
                    <AddressForm
                      initial={addrForm}
                      onSave={handleSaveAddress}
                      onCancel={() => { setAddrForm(null); setAddrError(""); }}
                      loading={addrSaving}
                    />
                  </div>
                )}

                {addrLoading ? (
                  <div className="profile-loading-state">
                    <span className="profile-spinner" />
                    <span>Loading addresses…</span>
                  </div>
                ) : addresses.length === 0 && !addrForm ? (
                  <div className="profile-empty-state">
                    <MapPin size={48} />
                    <h3>No saved addresses</h3>
                    <p>Add an address to speed up your checkout</p>
                    <button className="profile-cta-btn" onClick={() => setAddrForm(EMPTY_ADDRESS)}>
                      Add Address
                    </button>
                  </div>
                ) : (
                  <div className="profile-addresses-grid">
                    {addresses.map((addr) => (
                      <AddressCard
                        key={addr.id}
                        address={addr}
                        onEdit={(a) => setAddrForm({ ...a })}
                        onDelete={handleDeleteAddress}
                        onSetDefault={handleSetDefault}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ────────── SETTINGS ────────── */}
            {activeTab === "settings" && (
              <div className="profile-section">
                <div className="profile-section-header">
                  <h1 className="profile-section-title">Account Details</h1>
                  <p className="profile-section-subtitle">Update your personal information</p>
                </div>

                {settingsSuccess && (
                  <div className="profile-alert profile-alert--success">
                    <CheckCircle2 size={15} /> {settingsSuccess}
                  </div>
                )}
                {settingsError && (
                  <div className="profile-alert profile-alert--error">
                    <AlertCircle size={15} /> {settingsError}
                  </div>
                )}

                <form className="profile-settings-form" onSubmit={handleSaveSettings}>
                  {/* Avatar */}
                  <div className="profile-settings-avatar-row">
                    <div className="profile-settings-avatar">
                      <span>{initials}</span>
                    </div>
                    <div>
                      <p className="profile-settings-avatar-name">{user?.name || user?.email}</p>
                      <p className="profile-settings-avatar-role">
                        {user?.role === "ADMIN" ? "Administrator" : "Member"}
                      </p>
                    </div>
                  </div>

                  <div className="profile-settings-grid">
                    <div className="profile-settings-field">
                      <label className="profile-settings-label">
                        <User size={14} /> Full Name
                      </label>
                      <input
                        className="profile-settings-input"
                        value={settingsForm.name}
                        onChange={(e) =>
                          setSettingsForm((f) => ({ ...f, name: e.target.value }))
                        }
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="profile-settings-field">
                      <label className="profile-settings-label">
                        <Mail size={14} /> Email Address
                      </label>
                      <input
                        className="profile-settings-input profile-settings-input--readonly"
                        value={user?.email || ""}
                        readOnly
                        title="Email cannot be changed"
                      />
                      <span className="profile-settings-hint">Email cannot be changed</span>
                    </div>

                    <div className="profile-settings-field">
                      <label className="profile-settings-label">
                        <Phone size={14} /> Phone Number
                      </label>
                      <input
                        className="profile-settings-input"
                        value={settingsForm.phone}
                        onChange={(e) =>
                          setSettingsForm((f) => ({ ...f, phone: e.target.value }))
                        }
                        placeholder="10-digit mobile number"
                        maxLength={10}
                      />
                    </div>

                    <div className="profile-settings-field">
                      <label className="profile-settings-label">
                        <Eye size={14} /> Account Role
                      </label>
                      <input
                        className="profile-settings-input profile-settings-input--readonly"
                        value={user?.role === "ADMIN" ? "Administrator" : "Customer"}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="profile-settings-actions">
                    <button
                      type="submit"
                      className="profile-settings-save-btn"
                      disabled={settingsSaving}
                    >
                      {settingsSaving ? (
                        <span className="profile-spinner" />
                      ) : (
                        <><Save size={15} /> Save Changes</>
                      )}
                    </button>
                  </div>
                </form>

                {/* Danger zone */}
                <div className="profile-danger-zone">
                  <h3>Session</h3>
                  <p>Sign out from your account on this device.</p>
                  <button className="profile-danger-btn" onClick={handleLogout}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            )}

          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
