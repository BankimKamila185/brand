"use strict";
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { Heart, Eye, X } from "lucide-react";

const ProductCard = ({ product, onOpenDetails }) => {
  const { addToCart, toggleWishlist, isInWishlist, setCartOpen } = useCart();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Derive sizes from options array or variants list safely
  const sizes =
    product.options?.[0]?.values ||
    Array.from(
      new Set(
        product.variants.map((v) => v.option1 || v.title).filter((x) => !!x),
      ),
    );

  const defaultSize = sizes[0] || "M";
  const [modalSize, setModalSize] = useState(defaultSize);
  const [quantity, setQuantity] = useState(1);

  const firstImg = product.images[0]?.src || "";
  const secondImg = product.images[1]?.src || firstImg;

  // Calculate discount percentage
  const variant = product.variants[0];
  const priceNum = parseFloat(variant.price);
  const comparePriceRaw = variant.compare_at_price || variant.comparePrice;
  const comparePriceNum = comparePriceRaw ? parseFloat(comparePriceRaw) : 0;
  const discountPercent =
    comparePriceNum > priceNum
      ? Math.round(((comparePriceNum - priceNum) / comparePriceNum) * 100)
      : 0;

  const isWishlisted = isInWishlist(product.id);

  const handleSelectOptionsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleModalAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    for (let i = 0; i < quantity; i++) {
      addToCart(product, modalSize);
    }
    setIsQuickViewOpen(false);
  };

  const handleModalBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, modalSize);
    setIsQuickViewOpen(false);
    setCartOpen(true);
  };

  // Safe description parsing
  const descriptionText = product.body_html
    ? product.body_html.replace(/<[^>]*>/g, "").substring(0, 150) + "..."
    : "No description available.";

  return (
    <>
      <Link
        href={`/products/${product.handle}`}
        className="product-card cursor-pointer block text-current no-underline group"
      >
        <div className="product-card-media relative overflow-hidden rounded-sm bg-neutral-100">
          {/* Top Left Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-2.5 left-2.5 z-10 bg-[#e84e4e] text-white font-extrabold text-[11px] px-2 py-0.5 rounded-sm tracking-tight shadow-sm">
              -{discountPercent}%
            </div>
          )}

          <img
            src={firstImg}
            alt={product.title}
            className="product-card-img"
            loading="lazy"
          />

          {secondImg && (
            <img
              src={secondImg}
              alt={product.title}
              className="product-card-img secondary"
              loading="lazy"
            />
          )}

          {/* Hover action buttons (Heart & Eye) */}
          <div className="product-card-hover-actions">
            <button
              className={`hover-action-btn wishlist-btn ${isWishlisted ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              aria-label="Wishlist"
            >
              <Heart
                size={18}
                className={
                  isWishlisted ? "fill-[#e84e4e] stroke-[#e84e4e]" : ""
                }
              />
            </button>

            <button
              className="hover-action-btn quickview-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              aria-label="Quick view"
            >
              <Eye size={18} />
            </button>
          </div>

          {/* Floating bottom action bar */}
          <div className="product-card-bottom-action">
            <button
              className="select-options-btn"
              onClick={handleSelectOptionsClick}
            >
              Select Options
            </button>
          </div>
        </div>

        <div className="product-card-info pt-3 px-1 flex flex-col gap-1">
          <h3 className="product-card-title text-sm font-semibold text-neutral-800 line-clamp-2 leading-snug group-hover:text-black transition-colors">
            {product.title}
          </h3>

          {/* Price Row */}
          <div className="product-card-price-row flex items-center gap-2 pt-0.5">
            {comparePriceNum > priceNum ? (
              <>
                <span className="price-sale font-bold text-[#e84e4e] text-sm">
                  ₹ {priceNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                <span className="price-compare line-through text-neutral-400 text-xs">
                  ₹ {comparePriceNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </>
            ) : (
              <span className="price-regular font-bold text-neutral-900 text-sm">
                ₹ {priceNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>

          {/* Ratings & Reviews */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-600 pt-0.5">
            <span className="text-[#111] text-[13px] tracking-tight">★★★★★</span>
            <span className="text-[11px] text-neutral-500 font-medium">
              {product.reviewsCount || Math.floor((product.id ? String(product.id).charCodeAt(0) : 7) % 15 + 5)} reviews
            </span>
          </div>

          {/* EMI Badge */}
          {priceNum >= 800 && (
            <div className="flex items-center gap-1 text-[10px] text-neutral-600 font-medium pt-0.5">
              <span>or ₹{Math.round(priceNum / 3)}/Month</span>
              <span className="bg-black text-white px-1.5 py-0.2 rounded text-[9px] font-bold tracking-tight">
                Buy on EMI &gt;
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Quick View Modal Popup */}
      {isQuickViewOpen && (
        <div
          className="quickview-modal-overlay"
          onClick={() => setIsQuickViewOpen(false)}
        >
          <div
            className="quickview-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="quickview-close-btn"
              onClick={() => setIsQuickViewOpen(false)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="quickview-modal-grid">
              {/* Left Column: Image */}
              <div className="quickview-image-container">
                <img
                  src={firstImg}
                  alt={product.title}
                  className="quickview-modal-img"
                />
              </div>

              {/* Right Column: Details */}
              <div className="quickview-details-container">
                <h2 className="quickview-product-title">{product.title}</h2>

                <div className="quickview-price-row">
                  <span className="quickview-price-sale">
                    ₹{priceNum.toFixed(2)}
                  </span>
                  {comparePriceNum > priceNum && (
                    <>
                      <span className="quickview-price-compare">
                        ₹{comparePriceNum.toFixed(2)}
                      </span>
                      <span className="quickview-sale-badge">SALE</span>
                    </>
                  )}
                </div>

                {/* Description snippet */}
                <div className="quickview-desc-wrap">
                  <p className="quickview-description">
                    {descriptionText}
                    <Link
                      href={`/products/${product.handle}`}
                      className="quickview-view-details-link"
                    >
                      View details
                    </Link>
                  </p>
                </div>

                {/* In Stock status */}
                <div className="quickview-stock-status">
                  <span className="stock-dot">●</span> In Stock
                </div>

                {/* Size Selector */}
                {sizes.length > 0 && (
                  <div className="quickview-size-section">
                    <span className="quickview-size-label">
                      Size:{" "}
                      <span className="active-size-name">{modalSize}</span>
                    </span>
                    <div className="quickview-sizes-grid">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          className={`quickview-size-btn ${modalSize === size ? "active" : ""}`}
                          onClick={() => setModalSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity and Actions */}
                <div className="quickview-quantity-section">
                  <span className="quickview-qty-label">Quantity</span>
                  <div className="quickview-actions-row">
                    <div className="quickview-qty-selector">
                      <button
                        className="qty-btn"
                        onClick={() =>
                          setQuantity((prev) => Math.max(1, prev - 1))
                        }
                      >
                        -
                      </button>
                      <span className="qty-number">{quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => setQuantity((prev) => prev + 1)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="quickview-add-to-cart-btn"
                      onClick={handleModalAddToCart}
                    >
                      ADD TO CART
                    </button>
                  </div>
                </div>

                <button
                  className="quickview-buy-now-btn"
                  onClick={handleModalBuyNow}
                >
                  BUY IT NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
