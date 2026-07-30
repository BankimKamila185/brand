"use strict";
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { couponsApi } from "../lib/api";
import { FileText, Truck, Tag, ShoppingBag, ArrowRight } from "lucide-react";

const CartDrawer = ({ onCheckoutSimulation }) => {
  const router = useRouter();
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [activeDiscount, setActiveDiscount] = useState(0); // percentage
  const [couponMessage, setCouponMessage] = useState("");

  // Expandable footer tabs state
  const [showNote, setShowNote] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);

  const [cartNote, setCartNote] = useState("");

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const normalized = couponCode.trim().toUpperCase();
    if (!normalized) return;

    try {
      const res = await couponsApi.validate(normalized, cartTotal);
      if (res.success && res.data) {
        const discountPct = res.data.discountPercent || res.data.value || 10;
        setActiveDiscount(discountPct);
        setCouponMessage(`Coupon ${normalized} applied: ${discountPct}% discount!`);
      } else {
        setCouponMessage("Invalid coupon code!");
      }
    } catch (err) {
      if (normalized === "OUTLIERS10") {
        if (cartTotal >= 2499) {
          setActiveDiscount(10);
          setCouponMessage("Coupon OUTLIERS10 applied: 10% discount!");
        } else {
          setCouponMessage("OUTLIERS10 requires order above ₹2499!");
        }
      } else if (normalized === "OUTLIERS21") {
        if (cartTotal >= 5999) {
          setActiveDiscount(21);
          setCouponMessage("Coupon OUTLIERS21 applied: 21% discount!");
        } else {
          setCouponMessage("OUTLIERS21 requires order above ₹5999!");
        }
      } else {
        setCouponMessage(err?.message || "Invalid coupon code!");
      }
    }
  };

  const discountAmount = Math.round(cartTotal * (activeDiscount / 100));
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    setCartOpen(false);
    router.push("/checkout");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop ${cartOpen ? "open" : ""}`}
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer Panel */}
      <div
        className={`side-drawer ${cartOpen ? "open" : ""} transition-transform duration-300 ease-in-out`}
      >
        <div className="drawer-header">
          <h2 className="drawer-title">Shopping Cart</h2>
          <button
            className="drawer-close"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
              {/* Icon Badge */}
              <div 
                className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-6 relative shadow-inner"
                style={{ border: "1px solid #eaeaea" }}
              >
                <ShoppingBag className="w-9 h-9 text-neutral-800" style={{ strokeWidth: 1.5 }} />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">
                  0
                </span>
              </div>

              {/* Eyebrow & Title */}
              <p className="text-[11px] font-semibold tracking-[0.2em] text-neutral-400 uppercase mb-2">
                YOUR SHOPPING BAG IS EMPTY
              </p>
              <h3 className="text-xl font-bold text-neutral-900 mb-2 tracking-tight">
                Looks like you haven't added anything yet
              </h3>
              <p className="text-xs text-neutral-500 max-w-[270px] mb-8 leading-relaxed">
                Explore our latest drops and elevated streetwear essentials to start building your wardrobe.
              </p>

              {/* Action Button */}
              <button
                onClick={() => {
                  setCartOpen(false);
                  router.push("/collections/all");
                }}
                className="w-full max-w-[260px] bg-black hover:bg-neutral-800 text-white py-4 px-6 rounded-full text-xs font-bold tracking-[0.14em] uppercase transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>CONTINUE SHOPPING</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Collection Pills */}
              <div className="mt-10 pt-8 border-t border-neutral-100 w-full max-w-[300px]">
                <p className="text-[10px] font-bold tracking-[0.16em] text-neutral-400 uppercase mb-3 text-center">
                  POPULAR CATEGORIES
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    { label: "Bestsellers", href: "/collections/bestsellers" },
                    { label: "Winterwear", href: "/collections/winterwear" },
                    { label: "Outerwear", href: "/collections/outerwear" },
                    { label: "All Items", href: "/collections/all" }
                  ].map((cat) => (
                    <button
                      key={cat.href}
                      onClick={() => {
                        setCartOpen(false);
                        router.push(cat.href);
                      }}
                      className="text-xs px-3.5 py-1.5 rounded-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 font-medium transition-colors cursor-pointer"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {cart.map((item) => {
                const variant =
                  item.product.variants.find((v) => v.id === item.variantId) ||
                  item.product.variants[0];
                const price = parseFloat(variant.price);
                const image = item.product.images[0]?.src || "";

                return (
                  <div key={item.variantId} className="cart-item">
                    <img
                      src={image}
                      alt={item.product.title}
                      className="cart-item-img"
                    />

                    <div className="cart-item-details">
                      <h4 className="cart-item-title">{item.product.title}</h4>
                      <span className="cart-item-size">
                        Size: {item.selectedSize}
                      </span>
                      <span className="cart-item-price">
                        ₹{price.toFixed(2)}
                      </span>

                      <div className="cart-item-actions-row">
                        <div className="cart-item-quantity">
                          <button
                            className="qty-btn"
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity - 1)
                            }
                          >
                            -
                          </button>
                          <span className="qty-val">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>

                        <button
                          className="cart-item-remove-link"
                          onClick={() => removeFromCart(item.variantId)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="drawer-footer">
            {/* Expandable Panel Tabs */}
            <div className="drawer-footer-actions">
              <button
                className={`footer-action-btn ${showNote ? "active" : ""}`}
                onClick={() => {
                  setShowNote(!showNote);
                  setShowShipping(false);
                  setShowCoupon(false);
                }}
              >
                <FileText size={16} /> Note
              </button>
              <button
                className={`footer-action-btn ${showShipping ? "active" : ""}`}
                onClick={() => {
                  setShowShipping(!showShipping);
                  setShowNote(false);
                  setShowCoupon(false);
                }}
              >
                <Truck size={16} /> Shipping
              </button>
              <button
                className={`footer-action-btn ${showCoupon ? "active" : ""}`}
                onClick={() => {
                  setShowCoupon(!showCoupon);
                  setShowNote(false);
                  setShowShipping(false);
                }}
              >
                <Tag size={16} /> Coupon
              </button>
            </div>

            {/* Note Panel */}
            {showNote && (
              <div className="footer-panel-expand">
                <textarea
                  placeholder="Add special instructions for your order..."
                  value={cartNote}
                  onChange={(e) => setCartNote(e.target.value)}
                  className="footer-panel-textarea"
                />
              </div>
            )}

            {/* Shipping Panel */}
            {showShipping && (
              <div className="footer-panel-expand shipping-info">
                <p>
                  🚚 <strong>Free Shipping</strong> on orders above ₹1,500!
                </p>
                <p className="text-gray-500 text-xs">
                  Estimated delivery: 3-5 business days.
                </p>
              </div>
            )}

            {/* Coupon Panel */}
            {showCoupon && (
              <div className="footer-panel-expand">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="PROMO CODE"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="footer-panel-input"
                  />

                  <button type="submit" className="footer-panel-submit-btn">
                    Apply
                  </button>
                </form>
                {couponMessage && (
                  <p
                    className={`coupon-msg ${couponMessage.includes("applied") ? "text-green-600" : "text-red-500"}`}
                  >
                    {couponMessage}
                  </p>
                )}
              </div>
            )}

            <div className="drawer-summary-row">
              <span>Subtotal</span>
              <span className="font-bold">₹{cartTotal.toFixed(2)}</span>
            </div>

            {activeDiscount > 0 && (
              <div className="drawer-summary-row text-green-600">
                <span>Discount ({activeDiscount}%)</span>
                <span className="font-bold">-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="drawer-summary-row total">
              <span>Total</span>
              <span>₹{finalTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="drawer-checkout-btn"
            >
              Checkout
            </button>

            <button
              onClick={() => {
                setCartOpen(false);
                router.push("/checkout");
              }}
              className="drawer-view-cart-link"
            >
              View Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
