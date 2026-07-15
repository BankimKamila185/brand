"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { couponsApi, ordersApi, paymentsApi, usersApi } from "@/lib/api";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronRight,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  PackageCheck,
  Plus,
  ShieldCheck,
  Tag,
  Trash2,
} from "lucide-react";

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

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState("shipping");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState(EMPTY_ADDRESS);
  const [addressError, setAddressError] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const getAddresses = async () => {
      setIsAddressLoading(true);
      try {
        const response = await usersApi.getAddresses();
        const items = response.data || [];
        setAddresses(items);
        const preferred = items.find((address) => address.isDefault) || items[0];
        if (preferred) setSelectedAddressId(preferred.id);
      } catch (error) {
        setCheckoutError(error?.message || "We could not load your saved addresses.");
      } finally {
        setIsAddressLoading(false);
      }
    };
    getAddresses();
  }, [isAuthenticated]);

  const subtotal = cartTotal;
  const discountAmount = appliedCoupon ? Number(appliedCoupon.discount) : 0;
  const shippingCharge = subtotal >= 999 ? 0 : 99;
  const total = Math.max(0, subtotal - discountAmount + shippingCharge);
  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId),
    [addresses, selectedAddressId],
  );

  const saveAddress = async (event) => {
    event.preventDefault();
    setAddressError("");
    const required = ["name", "phone", "line1", "city", "state", "pincode"];
    if (required.some((field) => !String(newAddress[field]).trim())) {
      setAddressError("Please complete all required shipping details.");
      return;
    }
    if (!/^\d{10,15}$/.test(newAddress.phone) || !/^\d{6}$/.test(newAddress.pincode)) {
      setAddressError("Enter a valid phone number and 6-digit PIN code.");
      return;
    }
    try {
      const response = await usersApi.addAddress(newAddress);
      if (!response.success || !response.data) throw new Error("Unable to save address.");
      setAddresses((items) => [...items, response.data]);
      setSelectedAddressId(response.data.id);
      setNewAddress(EMPTY_ADDRESS);
      setShowAddressForm(false);
    } catch (error) {
      setAddressError(error?.message || "Unable to save the address. Please try again.");
    }
  };

  const deleteAddress = async (id, event) => {
    event.stopPropagation();
    try {
      await usersApi.deleteAddress(id);
      setAddresses((items) => items.filter((address) => address.id !== id));
      if (selectedAddressId === id) setSelectedAddressId("");
    } catch (error) {
      setCheckoutError(error?.message || "Unable to remove the address.");
    }
  };

  const continueToPayment = () => {
    if (!selectedAddressId) {
      setCheckoutError("Select or add a shipping address to continue.");
      return;
    }
    setCheckoutError("");
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const applyCoupon = async (event) => {
    event.preventDefault();
    const code = couponInput.trim();
    if (!code) return;
    setCouponError("");
    setCouponLoading(true);
    try {
      const response = await couponsApi.validate(code, subtotal);
      if (!response.success || !response.data) throw new Error("This coupon is not valid.");
      setAppliedCoupon(response.data);
    } catch (error) {
      setCouponError(error?.message || "This coupon is not valid.");
    } finally {
      setCouponLoading(false);
    }
  };

  const beginPayment = async () => {
    if (!selectedAddressId) return setStep("shipping");
    setCheckoutError("");
    setIsProcessing(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Razorpay could not load. Please check your connection.");

      const orderResponse = await ordersApi.create({
        addressId: selectedAddressId,
        couponCode: appliedCoupon?.code,
      });
      if (!orderResponse.success || !orderResponse.data) throw new Error("Could not create your order.");

      const order = orderResponse.data;
      const paymentResponse = await paymentsApi.createOrder(order.id);
      if (!paymentResponse.success || !paymentResponse.data) {
        throw new Error("Could not start the Razorpay payment.");
      }

      const { razorpayOrderId, amount, currency, keyId } = paymentResponse.data;
      const razorpay = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: "TEVAR STREETWEAR",
        description: `Order #${order.id.slice(-8).toUpperCase()}`,
        order_id: razorpayOrderId,
        prefill: { name: user?.name || "", email: user?.email || "", contact: user?.phone || "" },
        theme: { color: "#0E0D0B" },
        modal: { ondismiss: () => setIsProcessing(false) },
        handler: async (response) => {
          try {
            const verification = await paymentsApi.verify({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (!verification.success) throw new Error("Payment verification failed.");
            await clearCart();
            setCompletedOrder({ id: order.id, total, address: selectedAddress });
          } catch (error) {
            setCheckoutError(error?.message || "We could not verify your payment.");
          } finally {
            setIsProcessing(false);
          }
        },
      });
      razorpay.open();
    } catch (error) {
      setCheckoutError(error?.message || "We could not start your payment.");
      setIsProcessing(false);
    }
  };

  if (authLoading) return <CheckoutFrame><div className="flex flex-1 items-center justify-center py-32"><Loader2 className="animate-spin" /></div></CheckoutFrame>;

  if (completedOrder) {
    return <CheckoutFrame><main className="checkout-v3-main flex-1"><section className="checkout-v3-shell mx-auto max-w-xl px-4 text-center"><div className="checkout-v3-panel checkout-v3-success"><PackageCheck className="mx-auto mb-5 h-14 w-14 text-[#b9ff57]" /><p className="checkout-v3-eyebrow">Payment verified</p><h1>Order placed</h1><p className="checkout-v3-copy">Your order #{completedOrder.id.slice(-8).toUpperCase()} has been confirmed.</p><div className="checkout-v3-receipt"><p><strong>Delivering to</strong> {completedOrder.address?.name}</p><p>{completedOrder.address?.line1}, {completedOrder.address?.city}</p><p><strong>₹{completedOrder.total.toFixed(2)}</strong> paid with Razorpay</p></div><Link href="/" className="checkout-v3-action">Continue shopping <ChevronRight size={15} /></Link></div></section></main></CheckoutFrame>;
  }

  if (!cart.length) {
    return <CheckoutFrame><main className="checkout-v3-main flex flex-1 items-center justify-center px-4 py-28 text-center"><div className="checkout-v3-empty"><PackageCheck className="mx-auto mb-5" size={40} /><p className="checkout-v3-eyebrow">Nothing to check out</p><h1>Your cart is empty</h1><Link href="/" className="checkout-v3-action mt-7">Shop now <ChevronRight size={15} /></Link></div></main></CheckoutFrame>;
  }

  if (!isAuthenticated) {
    return <CheckoutFrame><main className="checkout-v3-main flex-1"><section className="checkout-v3-shell mx-auto max-w-xl px-4"><Link href="/" className="checkout-v3-back"><ArrowLeft size={15} /> Back to cart</Link><div className="checkout-v3-panel checkout-v3-gate text-center"><Lock className="mx-auto mb-5 h-9 w-9" /><p className="checkout-v3-eyebrow">One quick step first</p><h1>Where should we deliver?</h1><p className="checkout-v3-copy">Sign in to choose or save an address before moving to payment.</p><Link href="/pages/login" className="checkout-v3-action mt-7">Sign in to continue <ChevronRight size={15} /></Link></div></section></main></CheckoutFrame>;
  }

  return (
    <CheckoutFrame>
      <main className="checkout-v3-main flex-1">
        <div className="checkout-v3-shell mx-auto max-w-[1240px] px-4 md:px-6">
          <button onClick={() => step === "payment" ? setStep("shipping") : router.back()} className="checkout-v3-back"><ArrowLeft size={15} /> {step === "payment" ? "Edit shipping" : "Back to cart"}</button>
          <header className="checkout-v3-hero"><div><p className="checkout-v3-eyebrow">Tevar / secure checkout</p><h1>{step === "shipping" ? "Set your delivery point." : "Ready when you are."}</h1></div><p className="checkout-v3-security"><ShieldCheck size={16} /> Encrypted and protected</p></header>
          <ol className="checkout-v3-progress"><li className={step === "shipping" ? "is-active" : "is-complete"}><span>{step === "shipping" ? "01" : <Check size={14} />}</span> Delivery</li><li className={step === "payment" ? "is-active" : ""}><span>02</span> Payment</li></ol>
          {checkoutError && <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={17} />{checkoutError}</div>}

          {step === "shipping" ? (
            <div className="checkout-v3-stage"><section className="checkout-v3-panel">
              <div className="checkout-v3-section-head"><div><p className="checkout-v3-eyebrow">Step 01</p><h2>Delivery address</h2><p>Select a saved location or create a new one.</p></div><button onClick={() => setShowAddressForm((visible) => !visible)} className="checkout-v3-secondary"><Plus size={14} /> New address</button></div>
              {showAddressForm && <form onSubmit={saveAddress} className="mb-7 grid grid-cols-1 gap-4 rounded-xl bg-neutral-50 p-5 md:grid-cols-2"><h3 className="col-span-full font-display text-sm font-bold uppercase">New shipping address</h3>{addressError && <p className="col-span-full text-sm text-red-600">{addressError}</p>}<Input label="Full name" name="name" value={newAddress.name} onChange={setNewAddress} /><Input label="Phone number" name="phone" value={newAddress.phone} onChange={setNewAddress} /><Input label="Address line 1" name="line1" value={newAddress.line1} onChange={setNewAddress} full /><Input label="Address line 2 (optional)" name="line2" value={newAddress.line2} onChange={setNewAddress} full /><Input label="City" name="city" value={newAddress.city} onChange={setNewAddress} /><Input label="State" name="state" value={newAddress.state} onChange={setNewAddress} /><Input label="PIN code" name="pincode" value={newAddress.pincode} onChange={setNewAddress} /><button className="bg-[#0E0D0B] px-4 py-3 text-xs font-bold uppercase tracking-widest text-white">Save address</button></form>}
              {isAddressLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div> : <div className="grid gap-3 md:grid-cols-2">{addresses.map((address) => <button key={address.id} onClick={() => setSelectedAddressId(address.id)} className={`checkout-address text-left ${selectedAddressId === address.id ? "is-selected" : ""}`}><div className="mb-4 flex justify-between"><span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{address.label}</span>{selectedAddressId === address.id && <Check size={17} />}</div><p className="font-bold">{address.name}</p><p className="mt-1 text-sm leading-relaxed text-neutral-500">{address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />{address.city}, {address.state} — {address.pincode}<br />{address.phone}</p><span onClick={(event) => deleteAddress(address.id, event)} className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-red-600"><Trash2 size={13} /> Remove</span></button>)}</div>}
              {!isAddressLoading && !addresses.length && !showAddressForm && <div className="rounded-xl border border-dashed border-neutral-300 py-10 text-center text-sm text-neutral-500"><MapPin className="mx-auto mb-2 text-neutral-300" />Add your delivery address to continue.</div>}
              <button onClick={continueToPayment} className="checkout-v3-action checkout-v3-full"><span>Continue to payment</span><ChevronRight size={17} /></button>
            </section><aside className="checkout-v3-aside"><OrderSummary cart={cart} subtotal={subtotal} shippingCharge={shippingCharge} total={total} couponInput={couponInput} setCouponInput={setCouponInput} applyCoupon={applyCoupon} appliedCoupon={appliedCoupon} removeCoupon={() => { setAppliedCoupon(null); setCouponInput(""); }} couponError={couponError} couponLoading={couponLoading} /><p className="checkout-v3-aside-note"><ShieldCheck size={15} /> Orders are secured with Razorpay.</p></aside></div>
          ) : (
            <div className="checkout-v3-stage">
              <section className="checkout-v3-panel checkout-v3-payment"><div className="checkout-v3-delivery"><div><p className="checkout-v3-eyebrow">Delivering to</p><p className="font-bold">{selectedAddress?.name}</p><p>{selectedAddress?.line1}, {selectedAddress?.city}, {selectedAddress?.state} {selectedAddress?.pincode}</p></div><button onClick={() => setStep("shipping")} className="checkout-v3-text-button">Change</button></div><div className="checkout-v3-payment-box"><div className="checkout-v3-icon"><CreditCard size={20} /></div><p className="checkout-v3-eyebrow">Step 02</p><h2>Pay using Razorpay</h2><p>Choose UPI, card, net banking, or a wallet in the secure Razorpay payment window.</p><button disabled={isProcessing} onClick={beginPayment} className="checkout-v3-action checkout-v3-full disabled:opacity-50">{isProcessing ? <Loader2 className="animate-spin" size={17} /> : <Lock size={16} />} {isProcessing ? "Opening Razorpay…" : `Pay ₹${total.toFixed(2)} securely`}</button><div className="checkout-v3-powered"><ShieldCheck size={15} /> Safe payment by Razorpay</div></div></section>
              <aside className="checkout-v3-aside"><OrderSummary cart={cart} subtotal={subtotal} shippingCharge={shippingCharge} total={total} couponInput={couponInput} setCouponInput={setCouponInput} applyCoupon={applyCoupon} appliedCoupon={appliedCoupon} removeCoupon={() => { setAppliedCoupon(null); setCouponInput(""); }} couponError={couponError} couponLoading={couponLoading} /></aside>
            </div>
          )}
        </div>
      </main>
    </CheckoutFrame>
  );
}

function Input({ label, name, value, onChange, full = false }) {
  return <label className={full ? "md:col-span-2" : ""}><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-500">{label}</span><input required={!name.includes("line2")} value={value} onChange={(event) => onChange((address) => ({ ...address, [name]: event.target.value }))} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-3 text-sm outline-none focus:border-black" /></label>;
}

function OrderSummary({ cart, subtotal, shippingCharge, total, couponInput, setCouponInput, applyCoupon, appliedCoupon, removeCoupon, couponError, couponLoading }) {
  return <section className="checkout-v3-order"><div className="checkout-v3-order-top"><p className="checkout-v3-eyebrow">Your bag</p><h2>Order total</h2></div><div className="checkout-items">{cart.map((item) => { const variant = item.product.variants.find((entry) => entry.id === item.variantId) || item.product.variants[0]; const price = Number(variant.price); return <div key={item.variantId} className="checkout-v3-product"><img src={item.product.images[0]?.src || ""} alt="" /><div><p>{item.product.title}</p><span>Size {item.selectedSize} · Qty {item.quantity}</span></div><strong>₹{(price * item.quantity).toFixed(2)}</strong></div>; })}</div><form onSubmit={applyCoupon} className="checkout-v3-coupon"><input value={couponInput} onChange={(event) => setCouponInput(event.target.value)} placeholder="Coupon code" /><button disabled={couponLoading}>{couponLoading ? "…" : "Apply"}</button></form>{couponError && <p className="mt-2 text-xs text-red-600">{couponError}</p>}{appliedCoupon && <p className="mt-2 flex items-center justify-between text-xs font-bold text-[#b9ff57]"><span><Tag className="mr-1 inline" size={13} />{appliedCoupon.code} applied</span><button type="button" onClick={removeCoupon}>Remove</button></p>}<div className="checkout-v3-totals"><Row label="Subtotal" value={`₹${subtotal.toFixed(2)}`} /><Row label="Shipping" value={shippingCharge ? `₹${shippingCharge.toFixed(2)}` : "Free"} /><div><span>Total</span><strong>₹{total.toFixed(2)}</strong></div></div></section>;
}

function Row({ label, value }) { return <div><span>{label}</span><span>{value}</span></div>; }

function CheckoutFrame({ children }) { return <div className="checkout-v3 flex min-h-screen flex-col"><AnnouncementBar /><Header />{children}<Footer /><CartDrawer /></div>; }
