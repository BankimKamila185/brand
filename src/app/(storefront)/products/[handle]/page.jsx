"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { productsApi, reviewsApi } from "@/lib/api";
import productsData from "@/data/products.json";

// Map backend product data to frontend Product interface safely
const mapBackendProductToProduct = (bp) => {
  return {
    id: bp.id,
    title: bp.title,
    handle: bp.handle,
    body_html: bp.description || "",
    published_at: bp.createdAt || "",
    created_at: bp.createdAt || "",
    updated_at: bp.updatedAt || "",
    vendor: bp.vendor || "",
    product_type: bp.productType || "",
    tags: bp.tags || [],
    variants:
      bp.variants?.map((v) => ({
        id: v.id,
        title: v.title,
        option1: v.option1 || null,
        option2: v.option2 || null,
        option3: null,
        sku: v.sku || null,
        requires_shipping: true,
        taxable: true,
        featured_image: null,
        available: v.inventory ? v.inventory.quantity > 0 : true,
        price: v.price,
        grams: 0,
        compare_at_price: v.comparePrice || null,
        position: v.position || 1,
        product_id: bp.id,
        created_at: "",
        updated_at: "",
      })) || [],
    images:
      bp.images?.map((img) => ({
        id: img.id,
        src: img.src,
        width: img.width || 0,
        height: img.height || 0,
        position: img.position || 1,
        product_id: bp.id,
        created_at: "",
        updated_at: "",
        variant_ids: [],
      })) || [],
    options: bp.options || [
      {
        name: "Size",
        position: 1,
        values: bp.variants?.map((v) => v.option1).filter(Boolean) || [],
      },
    ],
  };
};

export default function ProductDetailPage({ params }) {
  const unwrappedParams = use(params);
  const handle = unwrappedParams.handle;

  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { isAuthenticated } = useAuth();

  const staticProducts = productsData.products || [];

  // Core PDP State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Accordion Toggles
  const [descOpen, setDescOpen] = useState(true);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState([0, 0, 0, 0, 0]);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  // Fetch product data and related content
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        // 1. Fetch details from backend API
        const res = await productsApi.getByHandle(handle);
        if (res.success && res.data) {
          const mappedProduct = mapBackendProductToProduct(res.data);
          setProduct(mappedProduct);
        } else {
          // Fallback to static catalog data
          const staticProd = staticProducts.find((p) => p.handle === handle);
          if (staticProd) {
            setProduct(staticProd);
          }
        }
      } catch (err) {
        console.error(
          "Failed to fetch from backend, attempting static fallback",
          err,
        );
        const staticProd = staticProducts.find((p) => p.handle === handle);
        if (staticProd) {
          setProduct(staticProd);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [handle]);

  // Setup default size selection, related products, and load reviews
  useEffect(() => {
    if (!product) return;

    // Set default selected size to first variant size
    const sizes =
      product.options?.[0]?.values ||
      Array.from(
        new Set(
          product.variants.map((v) => v.option1 || v.title).filter((x) => !!x),
        ),
      );
    if (sizes.length > 0) {
      setSelectedSize(sizes[0]);
    }

    // Set related products
    const related = staticProducts
      .filter(
        (p) =>
          p.id !== product.id &&
          (p.product_type === product.product_type ||
            p.vendor === product.vendor),
      )
      .slice(0, 4);
    setRelatedProducts(related);

    // Fetch reviews
    loadReviews();
  }, [product]);

  const loadReviews = async () => {
    if (!product) return;
    try {
      const reviewsRes = await reviewsApi.list(String(product.id));
      if (reviewsRes.success && reviewsRes.data) {
        const rawReviews = reviewsRes.data.reviews || [];
        setReviews(rawReviews);
        setAvgRating(reviewsRes.data.avgRating || 0);
        setTotalReviews(reviewsRes.data.totalReviews || 0);

        // Compute rating distribution (5 down to 1)
        const counts = [0, 0, 0, 0, 0];
        rawReviews.forEach((r) => {
          if (r.rating >= 1 && r.rating <= 5) {
            counts[5 - r.rating]++;
          }
        });
        setRatingDistribution(counts);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;

    setReviewError("");
    setReviewSuccess("");

    if (!reviewTitle.trim()) {
      setReviewError("Please enter a review title.");
      return;
    }

    if (!reviewBody.trim()) {
      setReviewError("Please write your review details.");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await reviewsApi.create({
        productId: String(product.id),
        rating: reviewRating,
        title: reviewTitle,
        body: reviewBody,
      });

      if (res.success) {
        setReviewSuccess(res.message || "Review submitted successfully!");
        setReviewTitle("");
        setReviewBody("");
        setReviewRating(5);
        // Refresh reviews list
        loadReviews();
      } else {
        setReviewError(res.message || "Failed to submit review.");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setReviewError(
        err.message ||
          "Something went wrong. Please check if you have purchased this item.",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <AnnouncementBar />
        <Header />
        <main className="flex-grow flex items-center justify-center py-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <AnnouncementBar />
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center py-40 text-center px-4">
          <p className="text-6xl mb-6">🧸</p>
          <h1 className="text-3xl font-extrabold uppercase mb-2">
            Product Not Found
          </h1>
          <p className="text-gray-500 mb-8 max-w-md">
            The product page you are looking for does not exist or has been
            removed.
          </p>
          <Link
            href="/collections/all"
            className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest text-sm rounded transition hover:bg-neutral-800"
          >
            Continue Shopping
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Gallery Navigation helper for mobile scroll snap
  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const clientWidth = e.target.clientWidth;
    if (clientWidth > 0) {
      const index = Math.round(scrollLeft / clientWidth);
      setActiveImageIndex(index);
    }
  };

  // Derive sizes dynamically
  const sizes =
    product.options?.[0]?.values ||
    Array.from(
      new Set(
        product.variants.map((v) => v.option1 || v.title).filter((x) => !!x),
      ),
    );

  const activeVariant =
    product.variants.find(
      (v) => v.option1 === selectedSize || v.title === selectedSize,
    ) || product.variants[0];

  // Pricing calculations
  const priceNum = parseFloat(activeVariant.price);
  const comparePriceRaw =
    activeVariant.compare_at_price || activeVariant.comparePrice;
  const comparePriceNum = comparePriceRaw ? parseFloat(comparePriceRaw) : 0;
  const discountPercent =
    comparePriceNum > priceNum
      ? Math.round(((comparePriceNum - priceNum) / comparePriceNum) * 100)
      : 0;

  const isAvailable = activeVariant.available !== false;

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow">
        {/* Breadcrumb Navigation */}
        <div
          className="container-fluid"
          style={{ paddingTop: 16, paddingBottom: 16 }}
        >
          <nav className="text-xs uppercase tracking-wider text-neutral-500 flex flex-wrap items-center gap-y-1 gap-x-2">
            <Link href="/" className="hover:text-black whitespace-nowrap">
              Home
            </Link>
            <span className="text-neutral-300">/</span>
            <Link
              href={`/collections/${product.product_type.toLowerCase().replace(/ /g, "-")}`}
              className="hover:text-black whitespace-nowrap"
            >
              {product.product_type}
            </Link>
            <span className="text-neutral-300">/</span>
            <span
              className="text-black font-semibold truncate max-w-[180px] sm:max-w-none whitespace-nowrap"
              title={product.title}
            >
              {product.title}
            </span>
          </nav>
        </div>

        {/* Main Product Layout */}
        <section className="container-fluid" style={{ paddingBottom: 80 }}>
          <div className="product-detail-layout">
            {/* Gallery Column (Left) */}
            <div className="w-full">
              <div 
                className="product-detail-gallery-col w-full"
                onScroll={handleScroll}
              >
                {product.images.length > 0 ? (
                  product.images.map((img, i) => (
                    <div 
                      key={img.id || i} 
                      className="pdp-main-img-wrap relative group"
                    >
                      {discountPercent > 0 && i === 0 && (
                        <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black tracking-widest px-3 py-1.5 z-10 shadow-sm uppercase">
                          -{discountPercent}% OFF
                        </span>
                      )}
                      <img
                        src={img.src}
                        className="pdp-main-img w-full h-full object-cover"
                        alt={`${product.title} view ${i + 1}`}
                      />
                    </div>
                  ))
                ) : (
                  <div className="pdp-main-img-wrap w-full flex items-center justify-center bg-neutral-100 text-neutral-400 text-sm">
                    No Image Available
                  </div>
                )}
              </div>

              {/* Mobile pagination dots */}
              {product.images.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3 md:hidden">
                  {product.images.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 transition-all duration-200 ${
                        activeImageIndex === i ? "w-6 bg-black" : "w-1.5 bg-neutral-200"
                      }`}
                      style={{ borderRadius: "2px" }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Info Panel Column (Right) */}
            <div className="pdp-info-col">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-[0.2em] block mb-2 select-none">
                  {product.vendor}
                </span>
                <h1 className="text-2xl md:text-3xl font-black mb-3 text-neutral-900 tracking-wide leading-tight">
                  {product.title}
                </h1>

                {/* Rating Summary Row */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="pdp-rating text-yellow-500 text-sm flex items-center">
                    {"★".repeat(Math.round(avgRating || 4))}
                    {"☆".repeat(5 - Math.round(avgRating || 4))}
                  </div>
                  <span className="text-xs text-neutral-400 font-bold tracking-wider uppercase">
                    {totalReviews > 0
                      ? `${avgRating.toFixed(1)} (${totalReviews} Reviews)`
                      : "No Reviews Yet"}
                  </span>
                </div>
              </div>

              {/* Pricing Panel */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-black">
                  ₹{priceNum}
                </span>
                {comparePriceNum > priceNum && (
                  <>
                    <span className="text-lg text-neutral-400 line-through">
                      ₹{comparePriceNum}
                    </span>
                    <span className="pdp-discount-badge bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded-full">
                      -{discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-neutral-400 -mt-2 uppercase tracking-wider font-semibold select-none">
                Inclusive of all taxes
              </p>

              <hr className="border-neutral-100" />

              {/* Size Selector */}
              <div>
                <div className="flex justify-between items-center mb-3 select-none">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Select Size
                  </span>
                  <button
                    className="text-xs text-neutral-500 underline hover:text-black transition-colors"
                    onClick={() => setSizeGuideOpen(true)}
                  >
                    Size Guide
                  </button>
                </div>
                <div className="pdp-sizes flex flex-wrap gap-2.5">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      className={`pdp-size-btn ${selectedSize === size ? "active" : ""}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Purchase Call to Actions */}
              <div className="flex gap-3 mt-4">
                <button
                  className={`pdp-add-btn flex-1 ${
                    isAvailable
                      ? ""
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  onClick={() =>
                    isAvailable && addToCart(product, selectedSize)
                  }
                  disabled={!isAvailable}
                >
                  {isAvailable ? "Add To Cart" : "Out Of Stock"}
                </button>
                <button
                  className={`pdp-wishlist-btn w-14 h-14 flex items-center justify-center font-bold text-lg ${
                    isInWishlist(product.id)
                      ? "active"
                      : ""
                  }`}
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Wishlist"
                >
                  {isInWishlist(product.id) ? "♥" : "♡"}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col gap-4 text-xs font-semibold text-neutral-800 uppercase tracking-wider select-none">
                <div className="flex items-center gap-3.5">
                  <span className="text-base">🚚</span>
                  <span>Free Shipping across India on prepaid orders</span>
                </div>
                <div className="flex items-center gap-3.5">
                  <span className="text-base">🔄</span>
                  <span>Easy 7-day returns & exchange policy</span>
                </div>
                <div className="flex items-center gap-3.5">
                  <span className="text-base">🔒</span>
                  <span>100% secure checkout & encrypted payments</span>
                </div>
              </div>

              {/* Description Accordion */}
              <div className="border-t border-neutral-150 py-4 mt-6">
                <button
                  className="flex justify-between items-center w-full py-2 font-extrabold uppercase text-[11px] tracking-widest text-neutral-800 hover:opacity-75 transition-opacity"
                  onClick={() => setDescOpen(!descOpen)}
                >
                  <span>Description</span>
                  <span className="text-sm font-semibold">{descOpen ? "—" : "+"}</span>
                </button>
                {descOpen && (
                  <div className="pt-3 pb-2">
                    <div
                      className="pdp-desc-html prose prose-sm max-w-none text-neutral-600 text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: product.body_html }}
                    />
                  </div>
                )}
              </div>

              {/* Delivery Info Accordion */}
              <div className="border-t border-neutral-150 py-4">
                <button
                  className="flex justify-between items-center w-full py-2 font-extrabold uppercase text-[11px] tracking-widest text-neutral-800 hover:opacity-75 transition-opacity"
                  onClick={() => setDeliveryOpen(!deliveryOpen)}
                >
                  <span>Delivery & Returns</span>
                  <span className="text-sm font-semibold">{deliveryOpen ? "—" : "+"}</span>
                </button>
                {deliveryOpen && (
                  <div className="pt-3 pb-2 text-xs leading-relaxed text-neutral-600 flex flex-col gap-2.5">
                    <p>
                      ⚡ **Dispatch Time:** Orders are dispatched within 24-48
                      business hours.
                    </p>
                    <p>
                      📦 **Shipping Duration:** Metro cities: 2-4 days. Rest of
                      India: 4-7 days.
                    </p>
                    <p>
                      🔄 **Returns:** Easily raise a return or exchange request
                      within 7 days of delivery through our support panel.
                    </p>
                  </div>
                )}
              </div>

              {/* Tags panel */}
              {product.tags && product.tags.length > 0 && (
                <div className="border-t border-neutral-150 py-4 flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-neutral-100 text-[9px] font-bold text-neutral-500 uppercase px-2.5 py-1 tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* You May Also Like */}
        {relatedProducts.length > 0 && (
          <section
            className="container-fluid border-t border-neutral-200 pt-16 pb-8"
            style={{ marginTop: 64, marginBottom: 32 }}
          >
            <div className="mb-8 flex items-baseline justify-between">
              <h2 className="text-xl font-black uppercase tracking-widest text-neutral-800">
                You May Also Like
              </h2>
              <Link
                href="/collections/all"
                className="text-xs font-bold text-neutral-500 hover:text-black underline"
              >
                View All
              </Link>
            </div>
            <div className="product-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <section
          className="container-fluid border-t border-neutral-200 pt-16 pb-20"
          style={{ marginBottom: 64 }}
        >
          <div className="mb-8">
            <h2 className="text-xl font-black uppercase tracking-widest text-neutral-800">
              Customer Reviews
            </h2>
          </div>

          <div className="pdp-sk-reviews-summary">
            {/* Avg Rating Summary Card */}
            <div className="pdp-sk-reviews-avg">
              <span className="text-5xl font-black text-black">
                {(avgRating || 4.0).toFixed(1)}
              </span>
              <div className="text-yellow-500 text-lg">
                {"★".repeat(Math.round(avgRating || 4))}
                {"☆".repeat(5 - Math.round(avgRating || 4))}
              </div>
              <p className="text-xs font-bold text-neutral-500">
                Based on {totalReviews} ratings
              </p>
            </div>

            {/* Distribution bars */}
            <div className="pdp-sk-reviews-bars flex-grow">
              {ratingDistribution.map((count, index) => {
                const stars = 5 - index;
                const percent =
                  totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div
                    key={stars}
                    className="pdp-sk-review-bar-row text-xs font-bold text-neutral-800"
                  >
                    <span className="w-12 text-right">{stars} Star</span>
                    <div className="pdp-sk-bar-track flex-grow bg-neutral-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-yellow-500 h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-8 text-neutral-500 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Reviews List */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-neutral-800 mb-6">
                Customer Feedbacks ({reviews.length})
              </h3>
              {reviews.length === 0 ? (
                <div className="py-12 border border-dashed border-neutral-200 rounded-lg text-center bg-neutral-50/50">
                  <p className="text-neutral-500 text-sm font-semibold">
                    No reviews yet for this product.
                  </p>
                  <p className="text-neutral-400 text-xs mt-1">
                    Be the first to review it below!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="pdp-sk-review-card border border-neutral-200 rounded-lg p-5"
                    >
                      <div className="flex flex-wrap items-center gap-3 justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-sm text-neutral-700 uppercase">
                            {r.user?.avatar ? (
                              <img
                                src={r.user.avatar}
                                alt=""
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              (r.user?.name || "Anonymous")[0]
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-black text-neutral-800">
                              {r.user?.name || "Anonymous"}
                            </p>
                            <p className="text-[10px] text-neutral-400">
                              {new Date(r.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-yellow-500 text-xs">
                          {"★".repeat(r.rating)}
                          {"☆".repeat(5 - r.rating)}
                        </div>
                      </div>
                      {r.title && (
                        <h4 className="text-sm font-extrabold text-neutral-800 mb-1">
                          {r.title}
                        </h4>
                      )}
                      {r.body && (
                        <p className="text-xs leading-relaxed text-neutral-600">
                          {r.body}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write a Review Panel */}
            <div className="border border-neutral-100 p-6 bg-neutral-50 h-fit">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 mb-4 select-none">
                Write a Review
              </h3>

              {!isAuthenticated ? (
                <div className="text-center py-6">
                  <p className="text-xs text-neutral-500 mb-4 font-semibold">
                    You must be logged in to leave a review.
                  </p>
                  <Link
                    href="/pages/account"
                    className="bg-black text-white text-xs font-extrabold uppercase tracking-widest px-6 py-3 hover:bg-neutral-800 transition-all inline-block select-none"
                  >
                    Log In / Sign Up
                  </Link>
                </div>
              ) : (
                <form
                  onSubmit={handleReviewSubmit}
                  className="flex flex-col gap-4"
                >
                  {reviewError && (
                    <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold p-3">
                      {reviewError}
                    </div>
                  )}
                  {reviewSuccess && (
                    <div className="bg-green-50 border border-green-100 text-green-700 text-xs font-semibold p-3">
                      {reviewSuccess}
                    </div>
                  )}

                  {/* Rating Selector */}
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 block mb-1">
                      Overall Rating
                    </label>
                    <div className="flex gap-1 text-lg">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={
                            star <= reviewRating
                              ? "text-yellow-500"
                              : "text-neutral-300"
                          }
                          onClick={() => setReviewRating(star)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Title */}
                  <div>
                    <label
                      htmlFor="review-title-input"
                      className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 block mb-1"
                    >
                      Review Title
                    </label>
                    <input
                      id="review-title-input"
                      type="text"
                      className="w-full border border-neutral-200 px-3 py-2.5 text-xs bg-white outline-none focus:border-black font-semibold text-neutral-800 transition-colors"
                      placeholder="Summarize your experience"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                    />
                  </div>

                  {/* Review Body */}
                  <div>
                    <label
                      htmlFor="review-body-input"
                      className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 block mb-1"
                    >
                      Review Comments
                    </label>
                    <textarea
                      id="review-body-input"
                      rows={4}
                      className="w-full border border-neutral-200 px-3 py-2.5 text-xs bg-white outline-none focus:border-black font-semibold text-neutral-800 transition-colors"
                      placeholder="What did you like or dislike?"
                      value={reviewBody}
                      onChange={(e) => setReviewBody(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-black text-white text-xs font-extrabold uppercase tracking-widest py-3.5 hover:bg-neutral-800 transition disabled:bg-neutral-200 select-none"
                    disabled={submittingReview}
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Size Guide Modal Popup */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="size-guide-modal relative shadow-2xl">
            <button
              className="absolute top-4 right-4 text-2xl font-bold hover:text-red-500"
              onClick={() => setSizeGuideOpen(false)}
            >
              &times;
            </button>
            <h3 className="text-lg font-black uppercase tracking-wider text-neutral-800 mb-6">
              Size Chart Guide
            </h3>
            <div className="overflow-x-auto w-full">
              <table className="size-guide-table">
                <thead>
                  <tr>
                    <th>Waist Size</th>
                    <th>Hip (inches)</th>
                    <th>Thigh (inches)</th>
                    <th>Length (inches)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-bold">28 / S</td>
                    <td>36</td>
                    <td>22</td>
                    <td>39</td>
                  </tr>
                  <tr>
                    <td className="font-bold">30 / M</td>
                    <td>38</td>
                    <td>23</td>
                    <td>40</td>
                  </tr>
                  <tr>
                    <td className="font-bold">32 / L</td>
                    <td>40</td>
                    <td>24</td>
                    <td>41</td>
                  </tr>
                  <tr>
                    <td className="font-bold">34 / XL</td>
                    <td>42</td>
                    <td>25</td>
                    <td>41.5</td>
                  </tr>
                  <tr>
                    <td className="font-bold">36 / XXL</td>
                    <td>44</td>
                    <td>26</td>
                    <td>42</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-neutral-400 mt-4 leading-relaxed">
              * Note: Measure your waist around where you normally wear your
              pants. If in between sizes, order the larger size for a relaxed
              baggy fit.
            </p>
          </div>
        </div>
      )}

      {/* Side Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
