"use strict";
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { Heart, Eye, X, Check, ShoppingBag } from "lucide-react";

const ProductCard = ({ product, onOpenDetails }) => {
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist, setCartOpen } = useCart();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Derive sizes from options array or variants list safely
  const sizes =
    product.options?.[0]?.values ||
    Array.from(
      new Set(
        product.variants?.map((v) => v.option1 || v.title).filter((x) => !!x) || []
      )
    );

  const defaultSize = sizes[0] || "M";
  const [modalSize, setModalSize] = useState(defaultSize);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const imagesList = product.images?.length > 0 ? product.images : [{ src: "" }];
  const firstImg = imagesList[0]?.src || "";
  const secondImg = imagesList[1]?.src || firstImg;
  const [selectedModalImg, setSelectedModalImg] = useState(firstImg);

  // Keep selected modal image synced when firstImg changes
  useEffect(() => {
    setSelectedModalImg(firstImg);
  }, [firstImg]);

  // Dynamically find variant for currently selected size
  const selectedVariant =
    product.variants?.find(
      (v) =>
        v.option1 === modalSize ||
        v.title === modalSize ||
        v.option2 === modalSize
    ) || product.variants?.[0] || {};

  const priceNum = parseFloat(selectedVariant.price || 0);
  const comparePriceRaw = selectedVariant.compare_at_price || selectedVariant.comparePrice;
  const comparePriceNum = comparePriceRaw ? parseFloat(comparePriceRaw) : 0;
  const discountPercent =
    comparePriceNum > priceNum
      ? Math.round(((comparePriceNum - priceNum) / comparePriceNum) * 100)
      : 0;

  const isSelectedVariantInStock = selectedVariant.available !== false;

  const isWishlisted = isInWishlist(product.id);

  // Scroll lock and Escape key listener when quick view modal is active
  useEffect(() => {
    if (!isQuickViewOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsQuickViewOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isQuickViewOpen]);

  const openQuickView = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setModalSize(defaultSize);
    setQuantity(1);
    setSelectedModalImg(firstImg);
    setAddedSuccess(false);
    setIsQuickViewOpen(true);
  };

  const handleModalAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);
    try {
      await addToCart(product, modalSize, quantity);
      setAddedSuccess(true);
      setTimeout(() => {
        setAddedSuccess(false);
        setIsQuickViewOpen(false);
        setCartOpen(true); // Auto-open slideout cart drawer
      }, 500);
    } catch (err) {
      console.error("Error adding product to cart from modal:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleModalBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);
    try {
      await addToCart(product, modalSize, quantity);
      setIsQuickViewOpen(false);
      router.push("/checkout");
    } catch (err) {
      console.error("Error in buy now from modal:", err);
    } finally {
      setIsAdding(false);
    }
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
            <div className="absolute top-2.5 left-2.5 z-10 bg-[#e84e4e] text-white font-extrabold text-[11px] px-2 py-0.5 rounded-sm tracking-tight shadow-sm select-none">
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
              onClick={openQuickView}
              aria-label="Quick view"
            >
              <Eye size={18} />
            </button>
          </div>

          {/* Floating bottom action bar */}
          <div className="product-card-bottom-action">
            <button
              className="select-options-btn"
              onClick={openQuickView}
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
            {/* Close Button */}
            <button
              className="quickview-close-btn"
              onClick={() => setIsQuickViewOpen(false)}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="quickview-modal-grid">
              {/* Left Column: Main Image & Gallery Thumbnails */}
              <div className="quickview-image-container flex flex-col items-center justify-between p-4 bg-neutral-900 text-white relative">
                <div className="w-full flex-1 flex items-center justify-center overflow-hidden min-h-[320px]">
                  <img
                    src={selectedModalImg || firstImg}
                    alt={product.title}
                    className="max-h-[460px] w-auto object-contain transition-all duration-300"
                  />
                </div>

                {/* Gallery Thumbnails Strip */}
                {imagesList.length > 1 && (
                  <div className="flex items-center gap-2 pt-3 overflow-x-auto max-w-full z-10">
                    {imagesList.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedModalImg(img.src)}
                        className={`w-12 h-14 rounded overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                          selectedModalImg === img.src
                            ? "border-white scale-105"
                            : "border-neutral-700 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img.src}
                          alt={`${product.title} view ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Interactive Product Details & Actions */}
              <div className="quickview-details-container p-6 md:p-8 flex flex-col justify-between">
                <div className="flex flex-col gap-4">
                  {/* Title */}
                  <h2 className="quickview-product-title text-xl md:text-2xl font-bold text-neutral-900 leading-tight">
                    {product.title}
                  </h2>

                  {/* Pricing */}
                  <div className="quickview-price-row flex items-center gap-3">
                    <span className="quickview-price-sale text-xl md:text-2xl font-extrabold text-[#e84e4e]">
                      ₹{priceNum.toFixed(2)}
                    </span>
                    {comparePriceNum > priceNum && (
                      <>
                        <span className="quickview-price-compare line-through text-neutral-400 text-sm">
                          ₹{comparePriceNum.toFixed(2)}
                        </span>
                        <span className="bg-[#e84e4e] text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                          SALE
                        </span>
                      </>
                    )}
                  </div>

                  {/* Description Snippet & Link */}
                  <div className="quickview-desc-wrap border-y border-neutral-200 py-3 text-xs md:text-sm text-neutral-600 leading-relaxed">
                    <p className="m-0">
                      {descriptionText}{" "}
                      <Link
                        href={`/products/${product.handle}`}
                        onClick={() => setIsQuickViewOpen(false)}
                        className="font-bold text-neutral-900 underline hover:text-black ml-1 whitespace-nowrap"
                      >
                        View details
                      </Link>
                    </p>
                  </div>

                  {/* Stock Status Indicator */}
                  <div className={`quickview-stock-status flex items-center gap-2 text-xs font-bold ${
                    isSelectedVariantInStock ? "text-emerald-600" : "text-red-500"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      isSelectedVariantInStock ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                    }`} />
                    <span>{isSelectedVariantInStock ? "In Stock" : "Out of Stock"}</span>
                  </div>

                  {/* Interactive Size Selector */}
                  {sizes.length > 0 && (
                    <div className="quickview-size-section flex flex-col gap-2 pt-1">
                      <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                        <span>Size:</span>
                        <span className="font-extrabold text-black uppercase">{modalSize}</span>
                      </div>
                      <div className="quickview-sizes-grid flex flex-wrap gap-2">
                        {sizes.map((size) => {
                          const isSelected = modalSize === size;
                          return (
                            <button
                              key={size}
                              type="button"
                              style={{
                                backgroundColor: isSelected ? "#000000" : "#ffffff",
                                color: isSelected ? "#ffffff" : "#111111",
                                borderColor: isSelected ? "#000000" : "#d4d4d4",
                              }}
                              className="w-11 h-11 rounded border text-xs font-bold transition-all cursor-pointer flex items-center justify-center shadow-none hover:border-black"
                              onClick={() => setModalSize(size)}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quantity Selector & Add To Cart Row */}
                  <div className="quickview-quantity-section flex flex-col gap-2 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Quantity
                    </span>
                    <div className="quickview-actions-row flex items-center gap-3">
                      
                      {/* Quantity Stepper (- 1 +) */}
                      <div className="flex items-center border border-neutral-300 rounded h-11 overflow-hidden select-none bg-white">
                        <button
                          type="button"
                          className="w-10 h-full flex items-center justify-center font-bold text-neutral-600 hover:bg-neutral-100 hover:text-black transition-colors cursor-pointer"
                          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-xs text-neutral-900">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          className="w-10 h-full flex items-center justify-center font-bold text-neutral-600 hover:bg-neutral-100 hover:text-black transition-colors cursor-pointer"
                          onClick={() => setQuantity((prev) => prev + 1)}
                        >
                          +
                        </button>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        type="button"
                        disabled={isAdding}
                        className={`flex-1 h-11 rounded border font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          addedSuccess
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white border-black text-black hover:bg-neutral-900 hover:text-white"
                        }`}
                        onClick={handleModalAddToCart}
                      >
                        {addedSuccess ? (
                          <>
                            <Check className="w-4 h-4" /> Added to Cart!
                          </>
                        ) : isAdding ? (
                          "Adding..."
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" /> Add to Cart
                          </>
                        )}
                      </button>

                    </div>
                  </div>
                </div>

                {/* Buy It Now Button */}
                <div className="pt-4">
                  <button
                    type="button"
                    disabled={isAdding}
                    className="w-full h-12 bg-black text-white font-bold text-xs uppercase tracking-widest rounded hover:bg-neutral-800 transition-all shadow-md active:scale-[0.99] cursor-pointer"
                    onClick={handleModalBuyNow}
                  >
                    Buy It Now
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
