"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, MAX_QTY_PER_ITEM } from "../context/CartContext";
import { Heart, Eye, X, Check, ShoppingBag } from "lucide-react";

function normalizeR2Url(src) {
  if (!src || typeof src !== "string") return "";
  if (src.includes(".r2.cloudflarestorage.com/")) {
    const filename = src.split(".r2.cloudflarestorage.com/")[1];
    return `https://pub-41f23aca788f4f3d8eb5a286adbb6f8d.r2.dev/${filename}`;
  }
  return src;
}

const ProductCard = ({ product, onOpenDetails, viewMode = "grid" }) => {
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

  const rawImages = product.images?.length > 0 ? product.images : [{ src: "" }];
  const imagesList = rawImages.map((img) => ({ ...img, src: normalizeR2Url(img.src) }));
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

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsQuickViewOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
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
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!selectedVariant || !selectedVariant.id) return;
    setIsAdding(true);
    try {
      const cartItemData = {
        variantId: selectedVariant.id,
        productId: product.id,
        title: product.title,
        handle: product.handle,
        size: modalSize,
        price: priceNum,
        comparePrice: comparePriceNum > priceNum ? comparePriceNum : null,
        image: firstImg,
      };
      await addToCart(cartItemData, quantity);
      setAddedSuccess(true);
      setTimeout(() => {
        setAddedSuccess(false);
        setIsQuickViewOpen(false);
        setCartOpen(true);
      }, 400);
    } catch (err) {
      console.error("Error adding product to cart from modal:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleModalBuyNow = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsAdding(true);
    try {
      const cartItemData = {
        variantId: selectedVariant.id,
        productId: product.id,
        title: product.title,
        handle: product.handle,
        size: modalSize,
        price: priceNum,
        comparePrice: comparePriceNum > priceNum ? comparePriceNum : null,
        image: firstImg,
      };
      await addToCart(cartItemData, quantity);
      setIsQuickViewOpen(false);
      router.push("/checkout");
    } catch (err) {
      console.error("Error in buy now from modal:", err);
    } finally {
      setIsAdding(false);
    }
  };

  // Description text for list view
  const cleanDescription = product.body_html
    ? product.body_html.replace(/<[^>]*>/g, "").trim()
    : product.description
    ? String(product.description).replace(/<[^>]*>/g, "").trim()
    : "-Color : Yellow -Casual shirt -Button down collar with placket -Single pocket, long regular sleeves, curved hem...";

  const reviewsCount =
    product.reviewsCount ||
    Math.floor((product.id ? String(product.id).charCodeAt(0) : 7) % 15 + 5);

  /* ── 1. LIST VIEW CARD ── */
  if (viewMode === "list") {
    return (
      <>
        <div className="product-card-list-view flex flex-col sm:flex-row gap-5 p-4 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-all bg-white group">
          {/* Left Media Container */}
          <div className="relative w-full sm:w-64 md:w-72 aspect-[3/4] overflow-hidden rounded bg-neutral-100 flex-shrink-0">
            {discountPercent > 0 && (
              <div className="absolute top-2.5 left-2.5 z-10 bg-[#e84e4e] text-white font-extrabold text-[11px] px-2 py-0.5 rounded-sm tracking-tight select-none">
                -{discountPercent}%
              </div>
            )}
            <Link href={`/products/${product.handle}`} className="block w-full h-full">
              <img
                src={firstImg}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>

          {/* Right Info Panel */}
          <div className="flex-1 flex flex-col justify-between py-1">
            <div className="flex flex-col gap-2">
              <Link href={`/products/${product.handle}`}>
                <h3 className="text-base font-bold text-neutral-900 hover:text-black transition-colors leading-snug">
                  {product.title}
                </h3>
              </Link>

              {/* Ratings */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                <span className="text-[#111] text-[13px] tracking-tight">★★★★★</span>
                <span className="text-[11px] text-neutral-500 font-medium">
                  {reviewsCount} review{reviewsCount === 1 ? "" : "s"}
                </span>
              </div>

              {/* Price & EMI */}
              <div className="flex flex-wrap items-baseline gap-2 mt-1">
                <span className="text-base font-extrabold text-[#e84e4e]">
                  ₹ {priceNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                {comparePriceNum > priceNum && (
                  <span className="text-xs text-neutral-400 line-through">
                    ₹ {comparePriceNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                )}
                <span className="text-[11px] text-neutral-500 ml-1">
                  or ₹{Math.round(priceNum / 3).toLocaleString("en-IN")}/Month <span className="bg-black text-white text-[9px] px-1.5 py-0.5 rounded font-semibold ml-1 inline-block">Buy on EMI &gt;</span>
                </span>
              </div>

              {/* Attributes / Description Summary */}
              <p className="text-xs text-neutral-600 leading-relaxed mt-1 line-clamp-3">
                {cleanDescription}
              </p>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-neutral-100">
              <button
                onClick={openQuickView}
                className="px-5 py-2.5 bg-white border border-neutral-900 text-neutral-900 text-xs font-bold uppercase tracking-wider rounded hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                SELECT OPTIONS
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                className={`p-2.5 border rounded-full transition-colors cursor-pointer ${
                  isWishlisted
                    ? "border-[#e84e4e] bg-red-50 text-[#e84e4e]"
                    : "border-neutral-300 text-neutral-700 hover:border-black"
                }`}
                aria-label="Wishlist"
              >
                <Heart size={16} className={isWishlisted ? "fill-[#e84e4e] stroke-[#e84e4e]" : ""} />
              </button>
              <button
                onClick={openQuickView}
                className="p-2.5 border border-neutral-300 rounded-full text-neutral-700 hover:border-black transition-colors cursor-pointer"
                aria-label="Quick View"
              >
                <Eye size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick View Modal */}
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
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className="quickview-grid">
                <div className="quickview-media">
                  <div className="quickview-main-image-wrap">
                    <img
                      src={selectedModalImg}
                      alt={product.title}
                      className="quickview-main-image"
                    />
                  </div>
                  {imagesList.length > 1 && (
                    <div className="quickview-thumbs">
                      {imagesList.map((img, idx) => (
                        <button
                          key={idx}
                          className={`quickview-thumb-btn ${
                            selectedModalImg === img.src ? "active" : ""
                          }`}
                          onClick={() => setSelectedModalImg(img.src)}
                        >
                          <img src={img.src} alt="" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="quickview-details">
                  <div className="quickview-header">
                    <span className="quickview-vendor">{product.vendor || "TEVAR"}</span>
                    <h2 className="quickview-title">{product.title}</h2>

                    <div className="quickview-price-row">
                      <span className="quickview-price">
                        ₹ {priceNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                      {comparePriceNum > priceNum && (
                        <>
                          <span className="quickview-compare-price">
                            ₹ {comparePriceNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                          <span className="quickview-discount-badge">
                            Save {discountPercent}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {sizes.length > 0 && (
                    <div className="quickview-option-group">
                      <label className="quickview-label">
                        Size: <span className="font-semibold">{modalSize}</span>
                      </label>
                      <div className="quickview-sizes">
                        {sizes.map((sz) => {
                          const v = product.variants?.find(
                            (varItem) =>
                              varItem.option1 === sz ||
                              varItem.title === sz ||
                              varItem.option2 === sz
                          );
                          const isAvail = v ? v.available !== false : true;
                          return (
                            <button
                              key={sz}
                              className={`quickview-size-btn ${
                                modalSize === sz ? "selected" : ""
                              } ${!isAvail ? "disabled" : ""}`}
                              onClick={() => isAvail && setModalSize(sz)}
                              disabled={!isAvail}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="quickview-actions">
                    <div className="quickview-qty-selector">
                      <button
                        className="qty-btn"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      >
                        -
                      </button>
                      <span className="qty-val">{quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => setQuantity((q) => Math.min(MAX_QTY_PER_ITEM, q + 1))}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className={`quickview-add-btn ${addedSuccess ? "success" : ""}`}
                      onClick={handleModalAddToCart}
                      disabled={isAdding || !isSelectedVariantInStock}
                    >
                      {!isSelectedVariantInStock ? (
                        "Out of Stock"
                      ) : isAdding ? (
                        "Adding..."
                      ) : addedSuccess ? (
                        <>
                          <Check size={16} /> Added to Cart!
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} /> Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  /* ── 2. STANDARD GRID VIEW CARD ── */
  return (
    <>
      <Link
        href={`/products/${product.handle}`}
        className="product-card cursor-pointer block text-current no-underline group"
      >
        <div className="product-card-media relative overflow-hidden rounded-sm bg-neutral-100">
          {/* Top Left Discount Badge */}
          {discountPercent > 0 && (
            <div className="product-card-discount">
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

          {/* Image actions */}
          <div className="product-card-hover-actions">
            <button
              className="hover-action-btn mobile-card-action"
              onClick={openQuickView}
              aria-label={`Choose options for ${product.title}`}
            >
              <ShoppingBag size={18} />
            </button>
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

        <div className="product-card-info pt-2 px-0 flex flex-col gap-0.5">
          <h3 className="product-card-title text-sm font-semibold text-neutral-800 line-clamp-2 leading-snug group-hover:text-black transition-colors">
            {product.title}
          </h3>

          {/* Ratings & Reviews */}
          <div className="product-card-rating flex items-center gap-1.5 text-xs text-neutral-600">
            <span className="text-[#111] text-[13px] tracking-tight">★★★★★</span>
            <span className="text-[11px] text-neutral-500 font-medium">
              {reviewsCount} reviews
            </span>
          </div>

          {/* Price Row */}
          <div className="product-card-price-row flex items-center gap-2">
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

          <p className="product-card-emi">or ₹{Math.round(priceNum / 3).toLocaleString("en-IN")}/Month <span>Buy on EMI ›</span></p>
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
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="quickview-grid">
              {/* Left image gallery */}
              <div className="quickview-media">
                <div className="quickview-main-image-wrap">
                  <img
                    src={selectedModalImg}
                    alt={product.title}
                    className="quickview-main-image"
                  />
                </div>
                {imagesList.length > 1 && (
                  <div className="quickview-thumbs">
                    {imagesList.map((img, idx) => (
                      <button
                        key={idx}
                        className={`quickview-thumb-btn ${
                          selectedModalImg === img.src ? "active" : ""
                        }`}
                        onClick={() => setSelectedModalImg(img.src)}
                      >
                        <img src={img.src} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right details panel */}
              <div className="quickview-details">
                <div className="quickview-header">
                  <span className="quickview-vendor">{product.vendor || "TEVAR"}</span>
                  <h2 className="quickview-title">{product.title}</h2>

                  <div className="quickview-price-row">
                    <span className="quickview-price">
                      ₹ {priceNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                    {comparePriceNum > priceNum && (
                      <>
                        <span className="quickview-compare-price">
                          ₹ {comparePriceNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="quickview-discount-badge">
                          Save {discountPercent}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Size Selector */}
                {sizes.length > 0 && (
                  <div className="quickview-option-group">
                    <label className="quickview-label">
                      Size: <span className="font-semibold">{modalSize}</span>
                    </label>
                    <div className="quickview-sizes">
                      {sizes.map((sz) => {
                        const v = product.variants?.find(
                          (varItem) =>
                            varItem.option1 === sz ||
                            varItem.title === sz ||
                            varItem.option2 === sz
                        );
                        const isAvail = v ? v.available !== false : true;
                        return (
                          <button
                            key={sz}
                            className={`quickview-size-btn ${
                              modalSize === sz ? "selected" : ""
                            } ${!isAvail ? "disabled" : ""}`}
                            onClick={() => isAvail && setModalSize(sz)}
                            disabled={!isAvail}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity & Add to Cart */}
                <div className="quickview-actions">
                  <div className="quickview-qty-selector">
                    <button
                      className="qty-btn"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      -
                    </button>
                    <span className="qty-val">{quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => setQuantity((q) => Math.min(MAX_QTY_PER_ITEM, q + 1))}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className={`quickview-add-btn ${addedSuccess ? "success" : ""}`}
                    onClick={handleModalAddToCart}
                    disabled={isAdding || !isSelectedVariantInStock}
                  >
                    {!isSelectedVariantInStock ? (
                      "Out of Stock"
                    ) : isAdding ? (
                      "Adding..."
                    ) : addedSuccess ? (
                      <>
                        <Check size={16} /> Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={16} /> Add to Cart
                      </>
                    )}
                  </button>
                </div>

                {/* Buy It Now Button */}
                <div className="pt-4">
                  <button
                    type="button"
                    disabled={isAdding}
                    className="w-full h-12 bg-black text-white font-extrabold text-xs uppercase tracking-[0.18em] rounded-lg hover:bg-neutral-800 transition-all shadow-md active:scale-[0.99] cursor-pointer flex items-center justify-center"
                    onClick={handleModalBuyNow}
                  >
                    BUY IT NOW
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
