"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useCart, MAX_QTY_PER_ITEM } from "@/context/CartContext";
import { couponsApi } from "@/lib/api";
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Truck, RefreshCw, Tag, ChevronDown, Pencil, Check } from "lucide-react";
import styles from "./page.module.css";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    updateQuantity,
    updateItemSize,
    removeFromCart,
    cartTotal,
    clearCart,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [activeDiscount, setActiveDiscount] = useState(0);
  const [editingSizeVariantId, setEditingSizeVariantId] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const normalized = couponCode.trim().toUpperCase();
    if (!normalized) return;

    setValidatingCoupon(true);
    setCouponMessage("");

    try {
      const res = await couponsApi.validate(normalized, cartTotal);
      if (res.success && res.data) {
        const discountPct = res.data.discountPercent || res.data.value || 10;
        setActiveDiscount(discountPct);
        setCouponMessage(`Coupon ${normalized} applied! Saved ${discountPct}%`);
      } else {
        setCouponMessage("Invalid or expired coupon code.");
        setActiveDiscount(0);
      }
    } catch (err) {
      setCouponMessage(err.message || "Failed to validate coupon code.");
      setActiveDiscount(0);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const discountAmount = (cartTotal * activeDiscount) / 100;
  const finalTotal = Math.max(0, cartTotal - discountAmount);
  const freeShippingThreshold = 1500;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - finalTotal);

  return (
    <div className={`flex flex-col min-h-screen bg-[#fafafa] ${styles.cartPage}`}>
      <AnnouncementBar />
      <Header />
      
      <main className={`flex-grow ${styles.cartMain}`}>
        {/* Page Title & Breadcrumb */}
        <div className={`bg-white border-b border-neutral-200/80 py-10 px-4 ${styles.cartHero}`}>
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
              Your Shopping Cart
            </h1>
            <nav className="flex items-center justify-center gap-2 text-xs font-medium text-neutral-400 uppercase tracking-widest" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-neutral-900 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-neutral-900 font-bold">Cart ({cart.reduce((t, i) => t + i.quantity, 0)})</span>
            </nav>
          </div>
        </div>

        <div className={`w-full flex justify-center items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 ${styles.cartShell}`}>
          {cart.length === 0 ? (
            <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-sm text-center flex flex-col items-center mx-auto">
              <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-6 text-neutral-400">
                <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
              </div>
              <h2 className="text-xl font-extrabold text-neutral-900 mb-2 uppercase tracking-wide">
                Your cart is empty
              </h2>
              <p className="text-neutral-500 text-sm mb-8 leading-relaxed max-w-xs">
                Looks like you haven&apos;t added any items to your cart yet. Explore our latest collection.
              </p>
              <Link
                href="/collections/all"
                className="w-full h-13 sm:h-14 bg-black hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm uppercase tracking-[0.15em] rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer group active:scale-[0.99]"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

          ) : (
            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start ${styles.cartGrid}`}>
              
              {/* Left Column: Cart Items List */}
              <div className={`lg:col-span-8 flex flex-col gap-6 ${styles.itemsColumn}`}>
                
                {/* Free Shipping Progress */}
                <div className={`bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col gap-2 ${styles.shippingProgress}`}>
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-800">
                    <span className="flex items-center gap-2">
                      <Truck className="size-4 text-neutral-600" />
                      {remainingForFreeShipping > 0
                        ? `Add ₹${remainingForFreeShipping.toFixed(0)} more for FREE Shipping!`
                        : "🎉 You qualify for FREE Express Shipping!"}
                    </span>
                    <span>{remainingForFreeShipping > 0 ? `${Math.round((finalTotal / freeShippingThreshold) * 100)}%` : "100%"}</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-neutral-900 h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (finalTotal / freeShippingThreshold) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Items Table Container */}
                <div className={`bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden ${styles.itemsCard}`}>
                  <div className={`hidden sm:grid grid-cols-12 gap-4 px-6 py-4 border-b border-neutral-100 text-[11px] font-bold uppercase tracking-wider text-neutral-400 ${styles.itemsHeader}`}>
                    <div className="col-span-6">Product</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-right">Subtotal</div>
                  </div>

                  <div className="divide-y divide-neutral-100">
                    {cart.map((item) => {
                      const variant =
                        item.product.variants?.find((v) => v.id === item.variantId) ||
                        item.product.variants?.[0];
                      const price = parseFloat(variant?.price || 0);
                      const image = item.product.images?.[0]?.src || "";
                      const itemSubtotal = price * item.quantity;

                      return (
                        <div key={item.variantId} className={`p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center ${styles.cartLine}`}>
                          
                          {/* Product Info */}
                          <div className={`sm:col-span-6 flex items-center gap-4 ${styles.productInfo}`}>
                            <div className={`w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-neutral-100 overflow-hidden flex-shrink-0 border border-neutral-200/60 ${styles.productImage}`}>
                              {image ? (
                                <img
                                  src={image}
                                  alt={item.product.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                  <ShoppingBag size={24} />
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-1 min-w-0">
                              <Link
                                href={`/products/${item.product.handle}`}
                                className="font-bold text-neutral-900 text-sm hover:underline line-clamp-1"
                              >
                                {item.product.title}
                              </Link>
                              {/* Size Pill Control */}
                              <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium my-1">
                                <button
                                  type="button"
                                  className="cart-item-size-control"
                                  aria-expanded={editingSizeVariantId === item.variantId}
                                  onClick={() => setEditingSizeVariantId(editingSizeVariantId === item.variantId ? null : item.variantId)}
                                >
                                  <span>Size</span>
                                  <strong>{item.selectedSize || "M"}</strong>
                                  <Pencil size={12} aria-hidden="true" />
                                </button>
                              </div>

                              {/* Expandable Size Picker Box */}
                              {editingSizeVariantId === item.variantId && (
                                <div className="cart-size-picker-box my-2">
                                  <div className="cart-size-picker-header">
                                    <span>SELECT SIZE</span>
                                    <button
                                      type="button"
                                      onClick={() => setEditingSizeVariantId(null)}
                                      className="cart-size-picker-done"
                                    >
                                      <Check size={13} aria-hidden="true" /> Done
                                    </button>
                                  </div>

                                  <div className="cart-size-options flex items-center gap-1.5 flex-wrap">
                                    {(() => {
                                      const rawSizes = (item.product?.variants || [])
                                        .map((v) => v.option1 || v.size || v.title)
                                        .filter(Boolean);
                                      const foundSizes = Array.from(new Set(rawSizes));
                                      const standardSizes = ["S", "M", "L", "XL", "XXL"];
                                      const sizesToDisplay = Array.from(new Set([...foundSizes, ...standardSizes]));
                                      const currentSize = (item.selectedSize || "M").toString().toUpperCase();

                                      return sizesToDisplay.map((sz) => {
                                        const isCurrent = currentSize === sz.toString().toUpperCase();
                                        return (
                                          <button
                                            key={sz}
                                            type="button"
                                            onClick={() => {
                                              updateItemSize(item.variantId, sz, item.product);
                                              setEditingSizeVariantId(null);
                                            }}
                                            className={`cart-size-option ${isCurrent ? "selected" : ""}`}
                                          >
                                            {sz}
                                          </button>
                                        );
                                      });
                                    })()}
                                  </div>

                                </div>
                              )}




                              <button
                                type="button"
                                onClick={() => removeFromCart(item.variantId)}
                                className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-red-600 transition-colors cursor-pointer mt-1 w-fit"
                              >
                                <Trash2 size={13} /> Remove
                              </button>
                            </div>
                          </div>

                          {/* Unit Price */}
                          <div className="sm:col-span-2 text-left sm:text-center text-sm font-bold text-neutral-700">
                            <span className="sm:hidden text-xs text-neutral-400 font-medium mr-2">Price:</span>
                            ₹{price.toFixed(2)}
                          </div>

                          {/* Quantity Controller */}
                          <div className="sm:col-span-2 flex justify-start sm:justify-center">
                            <div className="flex items-center border border-neutral-200 rounded-xl bg-neutral-50 px-2 py-1">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:text-neutral-900 font-bold transition-colors cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-xs font-bold text-neutral-900">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                disabled={item.quantity >= MAX_QTY_PER_ITEM}
                                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                className={`w-7 h-7 flex items-center justify-center font-bold transition-colors ${
                                  item.quantity >= MAX_QTY_PER_ITEM
                                    ? "text-neutral-300 cursor-not-allowed opacity-40"
                                    : "text-neutral-600 hover:text-neutral-900 cursor-pointer"
                                }`}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Item Subtotal */}
                          <div className="sm:col-span-2 text-left sm:text-right font-extrabold text-neutral-900 text-base">
                            <span className="sm:hidden text-xs text-neutral-400 font-medium mr-2">Subtotal:</span>
                            ₹{itemSubtotal.toFixed(2)}
                          </div>

                        </div>
                      );
                    })}
                  </div>

                  {/* Table Footer / Controls */}
                  <div className={`p-5 bg-neutral-50 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4 ${styles.cartControls}`}>
                    <Link
                      href="/collections/all"
                      className="text-xs font-bold text-neutral-700 hover:text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                    >
                      ← Continue Shopping
                    </Link>
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Order Summary Card */}
              <div className={`lg:col-span-4 flex flex-col gap-6 ${styles.summaryColumn}`}>
                
                <div className={`bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm flex flex-col gap-6 sticky top-24 ${styles.summaryCard}`}>
                  <h3 className="text-lg font-extrabold text-neutral-900 tracking-tight border-b border-neutral-100 pb-4">
                    Order Summary
                  </h3>

                  {/* Coupon Box */}
                  <form onSubmit={handleApplyCoupon} className={`flex flex-col gap-2 ${styles.couponForm}`}>
                    <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                      <Tag size={13} /> Promo / Coupon Code
                    </label>
                    <div className={`flex gap-2 ${styles.couponRow}`}>
                      <input
                        type="text"
                        placeholder="ENTER CODE"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-mono font-bold uppercase tracking-wider outline-none focus:border-neutral-900 transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={validatingCoupon}
                        className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {validatingCoupon ? "..." : "Apply"}
                      </button>
                    </div>
                    {couponMessage && (
                      <p className={`text-xs font-medium ${couponMessage.includes("applied") ? "text-green-600" : "text-red-500"}`}>
                        {couponMessage}
                      </p>
                    )}
                  </form>

                  {/* Price Calculations Breakdown */}
                  <div className="flex flex-col gap-3 text-sm border-t border-b border-neutral-100 py-4">
                    <div className="flex items-center justify-between text-neutral-600">
                      <span>Subtotal</span>
                      <span className="font-bold text-neutral-900">₹{cartTotal.toFixed(2)}</span>
                    </div>

                    {activeDiscount > 0 && (
                      <div className="flex items-center justify-between text-green-600 font-medium">
                        <span>Discount ({activeDiscount}%)</span>
                        <span className="font-bold">-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-neutral-600">
                      <span>Estimated Shipping</span>
                      <span className="font-bold text-neutral-900">
                        {remainingForFreeShipping === 0 ? "FREE" : "₹100"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-base font-extrabold text-neutral-900 pt-2 border-t border-neutral-100">
                      <span>Total Amount</span>
                      <span className="text-xl">₹{(finalTotal + (remainingForFreeShipping === 0 ? 0 : 100)).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    type="button"
                    onClick={() => router.push("/checkout")}
                    className="w-full h-13 sm:h-14 bg-black hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm uppercase tracking-[0.15em] rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer group active:scale-[0.99]"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>


                  {/* Trust Badges */}
                  <div className={`flex flex-col gap-3 pt-2 text-xs text-neutral-500 ${styles.trustBadges}`}>
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck size={16} className="text-neutral-700" />
                      <span>100% Secure Checkout guaranteed</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Truck size={16} className="text-neutral-700" />
                      <span>Fast dispatched & tracked courier shipping</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <RefreshCw size={16} className="text-neutral-700" />
                      <span>Easy 7-day exchanges & returns</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
