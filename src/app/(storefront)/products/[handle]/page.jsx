"use client";

import React, { useState, useEffect, use, useRef } from "react";
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
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
  const [careOpen, setCareOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Additional Page States
  const [quantity, setQuantity] = useState(1);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const galleryRef = useRef(null);

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

    // Update recently viewed list in localStorage
    try {
      const stored = localStorage.getItem("recentlyViewed");
      let items = stored ? JSON.parse(stored) : [];
      items = items.filter((p) => p.id !== product.id);
      items.unshift({
        id: product.id,
        title: product.title,
        handle: product.handle,
        images: product.images,
        variants: product.variants,
        vendor: product.vendor,
        product_type: product.product_type
      });
      localStorage.setItem("recentlyViewed", JSON.stringify(items.slice(0, 5)));

      // Load recently viewed list excluding current product
      const filtered = items.filter((p) => p.id !== product.id);
      setRecentlyViewed(filtered);
    } catch (e) {
      console.error("Failed to update recently viewed:", e);
    }
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

  // Scroll to active thumbnail on click
  const scrollToImage = (index) => {
    setActiveImageIndex(index);
    if (galleryRef.current) {
      const width = galleryRef.current.clientWidth;
      galleryRef.current.scrollTo({
        left: index * width,
        behavior: "smooth"
      });
    }
  };

  // Dynamic delivery date calculator
  const getDeliveryDateString = () => {
    const today = new Date();
    const minDelivery = new Date(today);
    minDelivery.setDate(today.getDate() + 2);
    
    const maxDelivery = new Date(today);
    maxDelivery.setDate(today.getDate() + 4);

    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    const minStr = minDelivery.toLocaleDateString('en-US', options);
    const maxStr = maxDelivery.toLocaleDateString('en-US', options);

    return `Get it between ${minStr} - ${maxStr}`;
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

      <main className="flex-grow pb-[80px] md:pb-0">
        {/* Breadcrumb Navigation */}
        <div
          className="container-fluid"
          style={{ paddingTop: 16, paddingBottom: 16 }}
        >
          <nav className="text-[10px] uppercase tracking-[0.15em] text-neutral-400 flex flex-wrap items-center gap-y-1 gap-x-2 select-none font-bold">
            <Link href="/" className="hover:text-black whitespace-nowrap">
              Home
            </Link>
            <span className="text-neutral-300 text-[9px]">&gt;</span>
            <Link
              href={`/collections/${product.product_type.toLowerCase().replace(/ /g, "-")}`}
              className="hover:text-black whitespace-nowrap"
            >
              {product.product_type}
            </Link>
            <span className="text-neutral-300 text-[9px]">&gt;</span>
            <span
              className="text-black font-extrabold truncate max-w-[180px] sm:max-w-none whitespace-nowrap"
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
              <div className="relative w-full">
                {/* Circular Floating action overlay buttons on mobile */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-md border border-neutral-100 transition-transform active:scale-95 md:hidden"
                  aria-label="Wishlist"
                  style={{ color: isInWishlist(product.id) ? '#ef4444' : '#000000' }}
                >
                  {isInWishlist(product.id) ? (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-md border border-neutral-100 transition-transform active:scale-95 text-neutral-800 md:hidden"
                  aria-label="Zoom Image"
                >
                  <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    <line x1="11" y1="8" x2="11" y2="14"/>
                    <line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                </button>

                <div 
                  ref={galleryRef}
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
                          <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black tracking-widest px-2.5 py-1.5 z-10 shadow-sm uppercase flex flex-col items-center justify-center leading-none text-center select-none">
                            <span>-{discountPercent}%</span>
                            <span className="text-[8px] mt-1 font-bold">OFF</span>
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
              </div>

              {/* Mobile Thumbnails and Dots Wrapper */}
              {product.images.length > 1 && (
                <div className="md:hidden mt-3 flex flex-col gap-4 select-none">
                  {/* Mobile Thumbnail previews */}
                  <div className="flex gap-2 overflow-x-auto overflow-y-hidden pb-1 scrollbar-none w-full">
                    {product.images.map((img, i) => (
                      <button
                        key={img.id || i}
                        onClick={() => scrollToImage(i)}
                        className={`w-14 h-16 flex-shrink-0 border-2 transition-all outline-none focus:outline-none focus:ring-0 ${
                          activeImageIndex === i ? "border-black scale-102" : "border-neutral-200"
                        }`}
                      >
                        <img src={img.src} className="w-full h-full object-cover" alt="" />
                      </button>
                    ))}
                  </div>

                  {/* Mobile Carousel Pagination Dots */}
                  <div className="flex justify-center items-center gap-2">
                    {product.images.map((_, i) => (
                      <div
                        key={i}
                        className={`transition-all duration-200 rounded-full ${
                          activeImageIndex === i
                            ? "w-2.5 h-2.5 border-[1.5px] border-black bg-white"
                            : "w-1.5 h-1.5 bg-neutral-800"
                        }`}
                      />
                    ))}
                  </div>
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
                  <span className="text-xs text-neutral-400 font-bold tracking-wider uppercase flex items-center gap-1.5">
                    {totalReviews > 0
                      ? `${avgRating.toFixed(1)} (${totalReviews} Reviews)`
                      : "No Reviews Yet"}
                    {totalReviews > 0 && (
                      <span className="text-green-600 text-[10px] font-extrabold uppercase bg-green-50 px-1.5 py-0.5 rounded">✓ Verified</span>
                    )}
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
                    <span className="text-lg text-neutral-400 line-through font-medium">
                      ₹{comparePriceNum}
                    </span>
                    <span className="text-green-600 font-bold text-sm tracking-wide select-none">
                      ({discountPercent}% OFF)
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
                    Size: {selectedSize}
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

              {/* Quantity Selector */}
              <div className="select-none">
                <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 block mb-2">
                  Select Qty
                </span>
                <div className="w-[100px] relative">
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full bg-white border border-neutral-200 text-xs font-bold px-3 py-3.5 outline-none appearance-none rounded-none cursor-pointer pr-8"
                    style={{ color: '#000000' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none text-[10px]">▼</span>
                </div>
              </div>

              {/* Primary Inline Add to Cart */}
              <div className="mt-4">
                <button
                  className={`pdp-add-btn w-full ${
                    isAvailable
                      ? ""
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  onClick={() =>
                    isAvailable && addToCart(product, selectedSize, quantity)
                  }
                  disabled={!isAvailable}
                  style={{ color: '#ffffff' }}
                >
                  {isAvailable ? "Add To Cart" : "Out Of Stock"}
                </button>
              </div>

              {/* Secondary Wishlist and Share row */}
              <div className="grid grid-cols-2 gap-3 mt-3 select-none">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`border py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition ${
                    isInWishlist(product.id)
                      ? "border-red-500 text-red-500 bg-red-50/20"
                      : "border-neutral-200 text-neutral-700 hover:border-black"
                  }`}
                >
                   <span>{isInWishlist(product.id) ? "♥" : "♡"}</span>
                   <span>{isInWishlist(product.id) ? "In Wishlist" : "Wishlist"}</span>
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: product.title,
                        url: window.location.href
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link copied to clipboard!");
                    }
                  }}
                  className="border border-neutral-200 text-neutral-700 hover:border-black py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                >
                  <span>✈</span>
                  <span>Share</span>
                </button>
              </div>

              {/* Order on WhatsApp Button */}
              <a
                href={`https://wa.me/919999999999?text=Hi%2C%20I%20am%20interested%20in%20ordering%20the%20${encodeURIComponent(product.title)}%20(Size%3A%20${selectedSize}%2C%20Qty%3A%20${quantity}).%20Link%3A%20${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25d366] hover:bg-[#20ba5a] text-white py-3.5 text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-2.5 mt-3 transition-colors select-none"
                style={{ color: '#ffffff' }}
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.011 20.29c-3.244 0-6.287-1.258-8.58-3.542l-.546-.546-3.69 1.157 1.15-3.69-.54-.54C-2.485 10.88-3.75 7.838-3.75 4.59.006.012 4.37.012 9.8 0c2.63 0 5.1 1.026 6.96 2.885 1.86 1.86 2.88 4.33 2.88 6.96 0 5.43-4.37 9.8-9.8 9.8l.17.65zm1.96-1.936c.27-.1.47-.15.67-.15.2.3.77.98.95 1.18.17.2.35.22.65.07.3-.15 1.26-.47 2.41-1.48.89-.8 1.49-1.78 1.66-2.08.17-.3.02-.46-.13-.61-.13-.13-.3-.35-.45-.52-.15-.17-.2-.3-.3-.5s-.05-.38.03-.53c.07-.15.67-1.62.92-2.22.25-.6.49-.51.68-.52.17-.01.37-.01.57-.01.2 0 .53.08.8 0 .37-.28 1.07-1.05 1.07-2.58s-1.12-3.1-1.37-3.4c-.25-.3-2.2-3.36-5.33-4.72-.74-.32-1.32-.52-1.78-.66-.75-.24-1.43-.2-1.97-.28-.6-.09-1.78-.73-2.03-.14-.25.7-1.78.73-1.98.78-.2.05-.35.08-.45.25-.1.15-.1.85.25 1.2M12.011 21.3c3.244 0 6.287-1.258 8.58-3.542l.546-.546 3.69 1.157-1.15-3.69.54-.54C26.485 11.88 27.75 8.838 27.75 5.59 24.006 1.012 19.63.012 14.2 0c-2.63 0-5.1 1.026-6.96 2.885-1.86 1.86-2.88 4.33-2.88 6.96 0 5.43 4.37 9.8 9.8 9.8l-.17-.65zM22.057.06l1.687 6.163c-1.041 1.804-1.588 3.849-1.587 5.946C22.06 18.652 16.723 23.99 10.112 23.99c-3.202 0-6.212-1.246-8.477-3.514C-.631 18.208-1.872 15.196-1.87 11.992c.004-6.657 5.34-11.997 11.953-11.997 2.005 0 3.973.502 5.724 1.457L22.057.06z"/>
                </svg>
                <span>Order on WhatsApp</span>
              </a>

              {/* Localized Delivery Estimation Banner */}
              <div className="mt-6 border border-neutral-100 p-4 bg-neutral-50 flex items-start gap-3 select-none">
                <span className="text-lg mt-0.5">🚚</span>
                <div className="flex-1 text-xs">
                  <p className="font-extrabold text-neutral-800 uppercase tracking-wide">
                    {getDeliveryDateString()}
                  </p>
                  <div className="text-neutral-500 mt-1.5 flex flex-col gap-1 font-semibold">
                    <p>✓ 100% Original Products</p>
                    <p>✓ Pay on Delivery (Cash/UPI) available</p>
                  </div>
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

              {/* Clean & Care Accordion */}
              <div className="border-t border-neutral-150 py-4">
                <button
                  className="flex justify-between items-center w-full py-2 font-extrabold uppercase text-[11px] tracking-widest text-neutral-800 hover:opacity-75 transition-opacity"
                  onClick={() => setCareOpen(!careOpen)}
                >
                  <span>Clean & Care</span>
                  <span className="text-sm font-semibold">{careOpen ? "—" : "+"}</span>
                </button>
                {careOpen && (
                  <div className="pt-3 pb-2 text-xs leading-relaxed text-neutral-600 flex flex-col gap-2.5 font-semibold">
                    <p>🚿 **Washing Instructions:** Machine wash cold, inside out, with like colors. Do not bleach.</p>
                    <p>☀️ **Drying Instructions:** Tumble dry low or line dry in shade for long-lasting color quality.</p>
                    <p>💨 **Ironing:** Iron medium heat inside out. Do not iron directly on graphics or prints.</p>
                  </div>
                )}
              </div>

              {/* Return, Shipping & Exchange Accordion */}
              <div className="border-t border-neutral-150 py-4">
                <button
                  className="flex justify-between items-center w-full py-2 font-extrabold uppercase text-[11px] tracking-widest text-neutral-800 hover:opacity-75 transition-opacity"
                  onClick={() => setPolicyOpen(!policyOpen)}
                >
                  <span>Return, Shipping & Exchange</span>
                  <span className="text-sm font-semibold">{policyOpen ? "—" : "+"}</span>
                </button>
                {policyOpen && (
                  <div className="pt-3 pb-2 text-xs leading-relaxed text-neutral-600 flex flex-col gap-2.5 font-semibold">
                    <p>📦 **Shipping Fee:** Free delivery across India on all prepaid orders. Flat shipping fee of ₹99 on COD orders.</p>
                    <p>⚡ **Dispatch Info:** Orders are processed and shipped within 24-48 business hours.</p>
                    <p>🔄 **Hassle-Free Returns:** 7-day returns or exchanges from date of delivery. Support panel handles returns instantly.</p>
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
            <div className="mb-8 flex items-baseline justify-between select-none">
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

        {/* Recently Viewed Products */}
        {recentlyViewed.length > 0 && (
          <section
            className="container-fluid border-t border-neutral-200 pt-16 pb-8"
            style={{ marginTop: 32, marginBottom: 32 }}
          >
            <div className="mb-8 select-none">
              <h2 className="text-xl font-black uppercase tracking-widest text-neutral-800">
                Recently Viewed Products
              </h2>
            </div>
            <div className="product-grid">
              {recentlyViewed.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Bottom SEO Content Section */}
        <section className="container-fluid border-t border-neutral-200 pt-16 pb-8">
          <div className="max-w-4xl select-none">
            <h2 className="text-sm font-black uppercase tracking-wider text-neutral-800 mb-4">
              Buy Unisex {product.title} Online At Tevar Studio
            </h2>
            <p className="text-xs leading-relaxed text-neutral-500 font-medium">
              Elevate your street fashion style with our signature {product.title}. Crafted from high-density, breathable fabrics and custom-tailored for a modern silhouette, this official {product.vendor} merchandise offers premium comfort and durability. Style it with minimal sneakers or layered accessories to complete your look. Discover the latest collections and wardrobe essentials with secure payments and fast dispatch across India.
            </p>
          </div>
        </section>

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

      {/* Lightbox Zoom Overlay Modal */}
      {lightboxOpen && product && product.images && product.images[activeImageIndex] && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 select-none animate-fade-in">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 text-white text-3xl font-light hover:opacity-75 transition-opacity"
            aria-label="Close Lightbox"
          >
            &times;
          </button>
          <img
            src={product.images[activeImageIndex].src}
            alt={product.title}
            className="max-w-full max-h-[85vh] object-contain shadow-2xl"
          />
        </div>
      )}

      {/* Sticky Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-150 p-3 z-40 flex items-center gap-3 shadow-[0_-6px_20px_rgba(0,0,0,0.06)]">
        {/* Size selection dropdown */}
        <div className="w-[120px] relative">
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="w-full bg-white border border-neutral-200 text-xs font-bold uppercase tracking-wider px-3 py-3.5 outline-none appearance-none rounded-none cursor-pointer pr-8"
            style={{ color: '#000000' }}
          >
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none text-[10px]">▼</span>
        </div>

        {/* Add to Cart button */}
        <button
          onClick={() => isAvailable && addToCart(product, selectedSize, quantity)}
          disabled={!isAvailable}
          className={`flex-1 bg-black text-white text-xs font-extrabold uppercase tracking-widest py-3.5 hover:bg-neutral-800 transition active:scale-98 ${
            isAvailable ? "" : "opacity-50 cursor-not-allowed"
          }`}
          style={{ color: '#ffffff' }}
        >
          {isAvailable ? "Add To Cart" : "Out Of Stock"}
        </button>
      </div>
    </div>
  );
}
