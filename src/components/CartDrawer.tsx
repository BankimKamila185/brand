'use strict';
'use client';

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onCheckoutSimulation?: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckoutSimulation }) => {
  const { cart, cartOpen, setCartOpen, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [activeDiscount, setActiveDiscount] = useState<number>(0); // percentage
  const [couponMessage, setCouponMessage] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = couponCode.trim().toUpperCase();

    if (normalized === 'OUTLIERS10') {
      if (cartTotal >= 2499) {
        setActiveDiscount(10);
        setCouponMessage('Coupon OUTLIERS10 applied: 10% discount!');
      } else {
        setCouponMessage('OUTLIERS10 requires order above ₹2499!');
      }
    } else if (normalized === 'OUTLIERS21') {
      if (cartTotal >= 5999) {
        setActiveDiscount(21);
        setCouponMessage('Coupon OUTLIERS21 applied: 21% discount!');
      } else {
        setCouponMessage('OUTLIERS21 requires order above ₹5999!');
      }
    } else if (normalized) {
      setCouponMessage('Invalid coupon code!');
    }
  };

  const discountAmount = Math.round(cartTotal * (activeDiscount / 100));
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    setCartOpen(false);
    if (onCheckoutSimulation) {
      onCheckoutSimulation();
    } else {
      alert('Simulating checkout! Thank you for shopping with House of Outliers.');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`drawer-backdrop ${cartOpen ? 'open' : ''}`}
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer Panel */}
      <div className={`side-drawer ${cartOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="drawer-header">
          <h2 className="drawer-title">Shopping Cart ({cart.length})</h2>
          <button className="drawer-close" onClick={() => setCartOpen(false)}>
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-5xl mb-4">👜</span>
              <p className="text-gray-500 font-bold uppercase tracking-wider mb-6">Your cart is empty</p>
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
                const variant = item.product.variants.find(v => v.id === item.variantId) || item.product.variants[0];
                const price = parseFloat(variant.price);
                const itemTotal = price * item.quantity;
                const image = item.product.images[0]?.src || '';

                return (
                  <div key={item.variantId} className="cart-item">
                    <img src={image} alt={item.product.title} className="cart-item-img" />
                    
                    <div className="cart-item-info">
                      <h4 className="cart-item-title">{item.product.title}</h4>
                      <span className="cart-item-meta">Size: {item.selectedSize}</span>
                      
                      <div className="cart-item-quantity">
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-price">
                      <span>₹{itemTotal}</span>
                      <button 
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.variantId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="drawer-footer">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="PROMO CODE (OUTLIERS10, OUTLIERS21)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none uppercase font-bold"
              />
              <button 
                type="submit"
                className="bg-black text-white text-xs font-bold uppercase px-4 py-2 rounded"
              >
                Apply
              </button>
            </form>
            
            {couponMessage && (
              <p className={`text-xs font-bold mb-4 ${couponMessage.includes('applied') ? 'text-green-600' : 'text-red-500'}`}>
                {couponMessage}
              </p>
            )}

            <div className="drawer-summary-row text-gray-600">
              <span>Subtotal</span>
              <span className="font-bold">₹{cartTotal}</span>
            </div>

            {activeDiscount > 0 && (
              <div className="drawer-summary-row text-green-600">
                <span>Discount ({activeDiscount}%)</span>
                <span className="font-bold">-₹{discountAmount}</span>
              </div>
            )}

            <div className="drawer-summary-row total text-lg font-black text-black">
              <span>Total</span>
              <span>₹{finalTotal}</span>
            </div>

            <button 
              onClick={handleCheckoutClick}
              className="drawer-checkout-btn font-bold text-center w-full block bg-black text-white py-4 uppercase tracking-widest mt-4"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
