"use strict";
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { FileText, Truck, Tag } from "lucide-react";

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

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const normalized = couponCode.trim().toUpperCase();

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
    } else if (normalized) {
      setCouponMessage("Invalid coupon code!");
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
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-5xl mb-4">👜</span>
              <p className="text-gray-500 font-bold uppercase tracking-wider mb-6">
                Your cart is empty
              </p>
              <button
                onClick={() => setCartOpen(false)}
                className="bg-black text-white px-8 py-3 uppercase font-bold text-sm tracking-wider"
              >
                Continue Shopping
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
              onClick={(e) => {
                e.preventDefault();
                setCartOpen(false);
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
