"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart, MAX_QTY_PER_ITEM } from "../context/CartContext";
import { couponsApi } from "../lib/api";
import { Truck, Tag, ShoppingBag, ArrowRight, ChevronDown, Trash2 } from "lucide-react";

const CartDrawer = ({ onCheckoutSimulation }) => {
  const router = useRouter();
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateQuantity,
    updateItemSize,
    removeFromCart,
    cartTotal,
  } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [activeDiscount, setActiveDiscount] = useState(0); // percentage
  const [couponMessage, setCouponMessage] = useState("");
  const [editingSizeVariantId, setEditingSizeVariantId] = useState(null);

  // Freeze background page scrolling when CartDrawer is open
  useEffect(() => {
    if (cartOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [cartOpen]);

  // Expandable footer tabs state
  const [showShipping, setShowShipping] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);

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
                      
                      {/* Size Badge */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "4px 0 6px 0" }}>
                        <span style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>Size:</span>
                        <button
                          type="button"
                          onClick={() => setEditingSizeVariantId(editingSizeVariantId === item.variantId ? null : item.variantId)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "2px 8px",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#111",
                            background: "#f4f4f5",
                            border: "1px solid #e4e4e7",
                            borderRadius: 4,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {item.selectedSize || "M"} <ChevronDown size={11} style={{ opacity: 0.6 }} />
                        </button>
                      </div>

                      {/* Expandable Custom Size Picker Pills */}
                      {editingSizeVariantId === item.variantId && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", margin: "6px 0 8px 0", padding: "8px", background: "#fafafa", border: "1px solid #eaeaea", borderRadius: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 2 }}>Size:</span>
                          {((Array.from(new Set((item.product?.variants || []).map(v => v.option1 || v.size || v.title).filter(Boolean))).length > 0
                            ? Array.from(new Set((item.product?.variants || []).map(v => v.option1 || v.size || v.title).filter(Boolean)))
                            : ["XS", "S", "M", "L", "XL", "XXL"]
                          )).map((sz) => {
                            const isSelected = (item.selectedSize || "").toString().toLowerCase() === sz.toString().toLowerCase();
                            return (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => {
                                  updateItemSize(item.variantId, sz, item.product);
                                  setEditingSizeVariantId(null);
                                }}
                                style={{
                                  padding: "3px 8px",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  borderRadius: 4,
                                  border: isSelected ? "1px solid #000" : "1px solid #e0e0e0",
                                  background: isSelected ? "#000" : "#fff",
                                  color: isSelected ? "#fff" : "#333",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                {sz}
                              </button>
                            );
                          })}
                        </div>
                      )}

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
                            disabled={item.quantity >= MAX_QTY_PER_ITEM}
                            style={{ opacity: item.quantity >= MAX_QTY_PER_ITEM ? 0.4 : 1, cursor: item.quantity >= MAX_QTY_PER_ITEM ? "not-allowed" : "pointer" }}
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.variantId)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            background: "none",
                            border: "none",
                            color: "#888",
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: "pointer",
                            marginLeft: "auto",
                            padding: "4px 6px",
                            borderRadius: 4,
                            transition: "color 0.15s ease"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "#dc2626"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "#888"}
                          title="Remove item"
                        >
                          <Trash2 size={15} />
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
                className={`footer-action-btn ${showShipping ? "active" : ""}`}
                onClick={() => {
                  setShowShipping(!showShipping);
                  setShowCoupon(false);
                }}
              >
                <Truck size={16} /> Shipping
              </button>
              <button
                className={`footer-action-btn ${showCoupon ? "active" : ""}`}
                onClick={() => {
                  setShowCoupon(!showCoupon);
                  setShowShipping(false);
                }}
              >
                <Tag size={16} /> Coupon
              </button>
            </div>

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
                router.push("/cart");
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
