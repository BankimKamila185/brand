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

        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[420px] text-center px-6 py-12">
              {/* Minimalist Dark Icon Circle */}
              <div 
                className="w-20 h-20 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-md"
                style={{ marginBottom: "28px" }}
              >
                <ShoppingBag className="w-8 h-8" style={{ strokeWidth: 1.5 }} />
              </div>

              {/* Title */}
              <h3 
                className="text-xl font-extrabold text-neutral-900 uppercase"
                style={{ marginBottom: "12px", letterSpacing: "0.16em" }}
              >
                YOUR CART IS EMPTY
              </h3>

              {/* Subtitle Description */}
              <p 
                className="text-xs text-neutral-500 max-w-[270px]"
                style={{ marginBottom: "36px", lineHeight: "1.6" }}
              >
                Your shopping cart is currently empty. Explore our latest drops and statement streetwear essentials.
              </p>

              {/* High-End Luxury CTA Button */}
              <button
                onClick={() => {
                  setCartOpen(false);
                  router.push("/collections/all");
                }}
                style={{
                  height: "52px",
                  paddingLeft: "28px",
                  paddingRight: "28px",
                  letterSpacing: "0.18em",
                  backgroundColor: "#000000",
                  color: "#ffffff",
                }}
                className="w-full max-w-[270px] rounded-lg text-xs font-bold uppercase transition-all shadow-md hover:shadow-xl hover:bg-neutral-800 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-3 group"
              >
                <span>CONTINUE SHOPPING</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
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
