"use client";

import React, { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useCart, MAX_QTY_PER_ITEM } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { productsApi, reviewsApi } from "@/lib/api";
import localProducts from "@/data/products.json";

function normalizeR2Url(src) {
  if (!src || typeof src !== "string") return "";
  if (src.includes(".r2.cloudflarestorage.com/")) {
    const filename = src.split(".r2.cloudflarestorage.com/")[1];
    return `https://pub-41f23aca788f4f3d8eb5a286adbb6f8d.r2.dev/${filename}`;
  }
  return src;
}

/* ─── Data Mapper ─────────────────────────────────────────── */
const mapProduct = (bp) => ({
  id: bp.id,
  title: bp.title,
  handle: bp.handle,
  body_html: bp.description || "",
  care_instructions: bp.careInstructions || null,
  manufacturer_details: bp.manufacturerDetails || null,
  vendor: bp.vendor || "House of Outliers",
  product_type: bp.productType || "Apparel",
  tags: bp.tags || [],
  variants:
    bp.variants?.map((v) => {
      const whQty = Array.isArray(v.warehouseStocks)
        ? v.warehouseStocks.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0)
        : 0;
      const invQty = Number(v.inventory?.quantity ?? 0);
      const totalQty = Math.max(invQty, whQty);
      const inStock = totalQty > 0 || v.available === true;

      return {
        id: v.id,
        title: v.title,
        option1: v.option1 || null,
        option2: v.option2 || null,
        price: v.price,
        compare_at_price: v.comparePrice || null,
        available: inStock,
        position: v.position || 1,
        product_id: bp.id,
        inventory: {
          quantity: totalQty,
          reserved,
        },
      };
    }) || [],
  images:
    bp.images?.map((img) => ({
      id: img.id,
      src: normalizeR2Url(img.src),
      alt_text: img.altText || "",
      position: img.position || 1,
    })) || [],
  options: bp.options || [
    {
      name: "Size",
      position: 1,
      values: bp.variants?.map((v) => v.option1 || v.title).filter(Boolean) || [],
    },
  ],
});

/* ─── Helpers ────────────────────────────────────────────── */
const fmt = (n) => Number(n).toLocaleString("en-IN");

const Stars = ({ rating = 0, size = 14, color = "#111" }) => (
  <span style={{ fontSize: size, color: color, letterSpacing: 2 }}>
    {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
  </span>
);

const Chevron = ({ open }) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s" }}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/* ─── Accordion Item ─────────────────────────────────────── */
function AccordionItem({ label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #eeeeee" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "center", padding: "15px 0", background: "none",
          border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "#111", letterSpacing: "0.01em" }}>{label}</span>
        <Chevron open={open} />
      </button>
      {open && (
        <div style={{ paddingBottom: 18, fontSize: 13, color: "#666", lineHeight: 1.75 }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ flex: 1, background: "#fff" }}>
      {/* Breadcrumb Skeleton */}
      <div style={{ borderBottom: "1px solid #f0f0f0", padding: "12px 0" }}>
        <div className="container" style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="skeleton-box" style={{ width: 48, height: 14 }} />
          <div style={{ fontSize: 12, color: "#ccc" }}>/</div>
          <div className="skeleton-box" style={{ width: 64, height: 14 }} />
          <div style={{ fontSize: 12, color: "#ccc" }}>/</div>
          <div className="skeleton-box" style={{ width: 120, height: 14 }} />
        </div>
      </div>

      {/* PDP Main Layout Grid Skeleton */}
      <section className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>
        <div className="pdp-two-col" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }}>

          {/* Left Gallery Skeleton */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="pdp-hero-image skeleton-box" style={{ width: "min(100%, 510px)", aspectRatio: "3 / 4", maxHeight: 580, borderRadius: 18 }} />
            <div className="pdp-thumbnail-strip" style={{ display: "flex", gap: 10 }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-box" style={{ width: 64, aspectRatio: "3 / 4", borderRadius: 10 }} />
              ))}
            </div>
          </div>

          {/* Right Info Panel Skeleton */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="skeleton-box" style={{ width: "75%", height: 30, borderRadius: 6 }} />
            <div className="skeleton-box" style={{ width: "45%", height: 26, borderRadius: 6, marginTop: 4 }} />
            <div className="skeleton-box" style={{ width: 140, height: 18, borderRadius: 12, marginTop: 2 }} />

            {/* Size Selector */}
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="skeleton-box" style={{ width: 90, height: 14 }} />
              <div style={{ display: "flex", gap: 8 }}>
                {["S", "M", "L", "XL", "XXL"].map((s) => (
                  <div key={s} className="skeleton-box" style={{ width: 44, height: 44, borderRadius: 8 }} />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: 14, display: "flex", gap: 12 }}>
              <div className="skeleton-box" style={{ width: 110, height: 48, borderRadius: 8 }} />
              <div className="skeleton-box" style={{ flex: 1, height: 48, borderRadius: 8 }} />
            </div>

            <div className="skeleton-box" style={{ width: "100%", height: 48, borderRadius: 8 }} />

            {/* Accordions */}
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="skeleton-box" style={{ width: "100%", height: 44, borderRadius: 6 }} />
              <div className="skeleton-box" style={{ width: "100%", height: 44, borderRadius: 6 }} />
              <div className="skeleton-box" style={{ width: "100%", height: 44, borderRadius: 6 }} />
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function ProductDetailPage({ params }) {
  const { handle } = use(params);
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Review & Rating States (Declared at top to prevent TDZ ReferenceError in useEffect)
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewModalImg, setReviewModalImg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState({ type: "", text: "" });

  // Notify Me States
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitting, setNotifySubmitting] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [notifyError, setNotifyError] = useState("");

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (!notifyEmail.trim()) {
      setNotifyError("Please enter your email or phone number.");
      return;
    }
    setNotifySubmitting(true);
    setNotifyError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setNotifySuccess(true);
      setNotifyEmail("");
    } catch {
      setNotifyError("Something went wrong. Please try again.");
    } finally {
      setNotifySubmitting(false);
    }
  };

  // Freeze background page scrolling when Lightbox, Size Guide, or Review photo modal is open
  useEffect(() => {
    if (lightboxOpen || sizeGuideOpen || reviewModalImg) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [lightboxOpen, sizeGuideOpen, reviewModalImg]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        setSizeGuideOpen(false);
        setReviewModalImg(null);
      }
    };
    if (lightboxOpen || sizeGuideOpen || reviewModalImg) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [lightboxOpen, sizeGuideOpen, reviewModalImg]);

  const thumbnailsRef = useRef(null);

  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const diff = touchStartX - touchEndX;
    if (diff > 50) {
      setActiveImg((prev) => Math.min((product?.images?.length || 1) - 1, prev + 1));
    } else if (diff < -50) {
      setActiveImg((prev) => Math.max(0, prev - 1));
    }
    setTouchStartX(0);
    setTouchEndX(0);
  };

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mouseStartX, setMouseStartX] = useState(0);
  const [dragged, setDragged] = useState(false);

  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return;
    setIsMouseDown(true);
    setMouseStartX(e.clientX);
    setDragged(false);
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown) return;
    if (Math.abs(mouseStartX - e.clientX) > 10) {
      setDragged(true);
    }
  };

  const handleMouseUp = (e) => {
    if (!isMouseDown) return;
    const diff = mouseStartX - e.clientX;
    if (diff > 50) {
      setActiveImg((prev) => Math.min((product?.images?.length || 1) - 1, prev + 1));
    } else if (diff < -50) {
      setActiveImg((prev) => Math.max(0, prev - 1));
    }
    setIsMouseDown(false);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleHeroClick = (e) => {
    if (dragged) {
      e.preventDefault();
      e.stopPropagation();
      setDragged(false);
    } else {
      setLightboxOpen(true);
    }
  };

  useEffect(() => {
    if (thumbnailsRef.current) {
      const activeThumbnail = thumbnailsRef.current.querySelector('.pdp-thumbnail.active');
      if (activeThumbnail) {
        activeThumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeImg]);

  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1025 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1025);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleReviewImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remainingSlots = 4 - reviewImages.length;
    if (remainingSlots <= 0) return;

    const selectedFiles = files.slice(0, remainingSlots);
    selectedFiles.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result;
        if (src) {
          setReviewImages((prev) => [...prev, src].slice(0, 4));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeReviewImage = (indexToRemove) => {
    setReviewImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  /* fetch product */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const cleanHandle = decodeURIComponent(handle || "").trim().toLowerCase();
      try {
        const res = await productsApi.getByHandle(cleanHandle);
        if (res.success && res.data) {
          setProduct(mapProduct(res.data));
        } else {
          // Fallback to local product
          const localProduct = localProducts.products.find(
            (p) => p.handle.toLowerCase() === cleanHandle
          );
          if (localProduct) {
            setProduct({
              id: localProduct.id,
              title: localProduct.title,
              handle: localProduct.handle,
              body_html: localProduct.body_html,
              vendor: localProduct.vendor,
              product_type: localProduct.product_type,
              tags: localProduct.tags,
              variants: localProduct.variants.map((v) => ({
                id: v.id,
                title: v.title,
                option1: v.option1,
                option2: v.option2,
                price: v.price,
                compare_at_price: v.compare_at_price,
                available: v.available,
              })),
              images: localProduct.images.map((img) => ({
                id: img.id,
                src: img.src,
                alt_text: img.alt,
              })),
              options: localProduct.options,
            });
          } else {
            setProduct(null);
          }
        }
      } catch {
        // Fallback to local product if API fails
        const localProduct = localProducts.products.find(
          (p) => p.handle.toLowerCase() === cleanHandle
        );
        if (localProduct) {
          setProduct({
            id: localProduct.id,
            title: localProduct.title,
            handle: localProduct.handle,
            body_html: localProduct.body_html,
            vendor: localProduct.vendor,
            product_type: localProduct.product_type,
            tags: localProduct.tags,
            variants: localProduct.variants.map((v) => ({
              id: v.id,
              title: v.title,
              option1: v.option1,
              option2: v.option2,
              price: v.price,
              compare_at_price: v.compare_at_price,
              available: v.available,
            })),
            images: localProduct.images.map((img) => ({
              id: img.id,
              src: img.src,
              alt_text: img.alt,
            })),
            options: localProduct.options,
          });
        } else {
          setProduct(null);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [handle]);

  const getSizes = (p) =>
    p.options?.[0]?.values ||
    [...new Set(p.variants.map((v) => v.option1 || v.title).filter(Boolean))];

  /* after product loads */
  useEffect(() => {
    if (!product) return;
    const sizes = getSizes(product);
    if (sizes.length) setSelectedSize(sizes[0]);

    // Load related products from DB
    productsApi.getRelated(String(product.id)).then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setRelatedProducts(res.data.map(mapProduct));
      } else {
        // Fallback to local related products
        const currentIndex = localProducts.products.findIndex(p => p.handle === product.handle);
        const related = [];
        for (let i = 1; i <= 4; i++) {
          const idx = (currentIndex + i) % localProducts.products.length;
          const p = localProducts.products[idx];
          related.push({
            id: p.id,
            title: p.title,
            handle: p.handle,
            body_html: p.body_html,
            vendor: p.vendor,
            product_type: p.product_type,
            tags: p.tags,
            variants: p.variants.map(v => ({
              id: v.id,
              title: v.title,
              option1: v.option1,
              option2: v.option2,
              price: v.price,
              compare_at_price: v.compare_at_price,
              available: v.available
            })),
            images: p.images.map(img => ({
              id: img.id,
              src: img.src,
              alt_text: img.alt
            })),
            options: p.options
          });
        }
        setRelatedProducts(related);
      }
    }).catch(() => {
      // Fallback to local related products if API fails
      const currentIndex = localProducts.products.findIndex(p => p.handle === product.handle);
      const related = [];
      for (let i = 1; i <= 4; i++) {
        const idx = (currentIndex + i) % localProducts.products.length;
        const p = localProducts.products[idx];
        related.push({
          id: p.id,
          title: p.title,
          handle: p.handle,
          body_html: p.body_html,
          vendor: p.vendor,
          product_type: p.product_type,
          tags: p.tags,
          variants: p.variants.map(v => ({
            id: v.id,
            title: v.title,
            option1: v.option1,
            option2: v.option2,
            price: v.price,
            compare_at_price: v.compare_at_price,
            available: v.available
          })),
          images: p.images.map(img => ({
            id: img.id,
            src: img.src,
            alt_text: img.alt
          })),
          options: p.options
        });
      }
      setRelatedProducts(related);
    });

    // Load reviews
    reviewsApi.list(String(product.id)).then((res) => {
      if (res.success && res.data) {
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.avgRating || 0);
        setTotalReviews(res.data.totalReviews || 0);
      }
    }).catch(() => { });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const getActiveVariant = () =>
    product?.variants.find((v) => {
      const vSize = (v.option1 || v.title || "").trim().toLowerCase();
      const sSize = (selectedSize || "").trim().toLowerCase();
      return vSize === sSize;
    }) || product?.variants[0];

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setReviewMsg({ type: "error", text: "Please sign in to your account to write a review." });
      return;
    }
    if (!reviewTitle.trim() || !reviewBody.trim()) {
      setReviewMsg({ type: "error", text: "Please fill in all required fields." });
      return;
    }
    setSubmitting(true);
    setReviewMsg({ type: "", text: "" });
    try {
      await reviewsApi.create({
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle,
        body: reviewBody,
        images: reviewImages,
      });
      setReviewMsg({ type: "success", text: "Review published live!" });
      setReviewTitle("");
      setReviewBody("");
      setReviewRating(5);
      setReviewImages([]);
      // Reload live reviews immediately in real-time
      const refreshed = await reviewsApi.list(String(product.id));
      if (refreshed.success && refreshed.data) {
        setReviews(refreshed.data.reviews || []);
        setAvgRating(refreshed.data.avgRating || 0);
        setTotalReviews(refreshed.data.totalReviews || 0);
      }
    } catch (err) {
      setReviewMsg({ type: "error", text: err.message || "Failed to submit review." });
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Loading / Not Found ─────────────────────────────── */
  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AnnouncementBar /><Header /><Skeleton /><Footer />
    </div>
  );

  if (!product) return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AnnouncementBar /><Header />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", textAlign: "center" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Product Not Found</h1>
        <p style={{ color: "#888", marginBottom: 28 }}>This item may be out of stock or no longer available.</p>
        <Link href="/collections/all" style={{ padding: "12px 28px", background: "#111", color: "#fff", borderRadius: 4, fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Shop All
        </Link>
      </main>
      <Footer />
    </div>
  );

  /* ─── Computed ────────────────────────────────────────── */
  const sizes = getSizes(product);
  const activeVariant = getActiveVariant();
  const price = parseFloat(activeVariant?.price || 0);
  const comparePrice = parseFloat(activeVariant?.compare_at_price || 0);
  const discount = comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const available = activeVariant?.available !== false;
  const wishlisted = isInWishlist(product.id);

  /* ─── JSX ─────────────────────────────────────────────── */
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      <AnnouncementBar />
      <Header />

      <main style={{ flex: 1 }}>

        {/* Breadcrumb */}
        <div style={{ borderBottom: "1px solid #f0f0f0", padding: "10px 0" }}>
          <div className="container">
            <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#aaa", flexWrap: "wrap" }}>
              <Link href="/" style={{ color: "#aaa" }}>Home</Link>
              <span>/</span>
              <Link href={`/collections/${product.product_type.toLowerCase().replace(/ /g, "-")}`} style={{ color: "#aaa" }}>
                {product.product_type}
              </Link>
              <span>/</span>
              <span style={{ color: "#444", fontWeight: 500 }}>{product.title}</span>
            </nav>
          </div>
        </div>

        {/* ── Product Section ── */}
        <section className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 40 }} className="pdp-two-col">

            {/* ── LEFT: Gallery — Hero + Thumbnail Strip ── */}
            <div className="pdp-gallery" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Hero Image */}
              <div
                className="pdp-hero-image"
                style={{ position: "relative", background: "#f5f5f5", cursor: "zoom-in", overflow: "visible" }}
                onClick={handleHeroClick}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                  style={{
                    position: "absolute", top: 14, right: 14, zIndex: 2,
                    width: 38, height: 38, borderRadius: "50%",
                    background: "#fff", border: "1px solid #eee",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                  }}
                  aria-label="Wishlist"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? "#e84e4e" : "none"} stroke={wishlisted ? "#e84e4e" : "#888"} strokeWidth="2">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>

                {product.images.length > 1 && (
                  <>
                    {/* Prev Arrow */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImg((prev) => Math.max(0, prev - 1));
                      }}
                      disabled={activeImg === 0}
                      style={{
                        position: "absolute",
                        top: "50%",
                        transform: "translateY(-50%)",
                        left: isDesktop ? -20 : 12,
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: "#fff",
                        border: "1px solid #eee",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 3,
                        boxShadow: activeImg === 0 ? "none" : "0 3px 10px rgba(0,0,0,0.08)",
                        transition: "all 0.2s ease",
                        cursor: activeImg === 0 ? "default" : "pointer",
                        opacity: activeImg === 0 ? 0 : 1,
                        visibility: activeImg === 0 ? "hidden" : "visible",
                      }}
                      aria-label="Previous image"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>

                    {/* Next Arrow */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImg((prev) => Math.min(product.images.length - 1, prev + 1));
                      }}
                      disabled={activeImg === product.images.length - 1}
                      style={{
                        position: "absolute",
                        top: "50%",
                        transform: "translateY(-50%)",
                        right: isDesktop ? -20 : 12,
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: "#fff",
                        border: "1px solid #eee",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 3,
                        boxShadow: activeImg === product.images.length - 1 ? "none" : "0 3px 10px rgba(0,0,0,0.08)",
                        transition: "all 0.2s ease",
                        cursor: activeImg === product.images.length - 1 ? "default" : "pointer",
                        opacity: activeImg === product.images.length - 1 ? 0 : 1,
                        visibility: activeImg === product.images.length - 1 ? "hidden" : "visible",
                      }}
                      aria-label="Next image"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </>
                )}

                <img
                  src={product.images[activeImg]?.src}
                  alt={product.title}
                  className="pdp-hero-image-media"
                  style={{ width: "100%", objectFit: "cover", display: "block", transition: "opacity 0.25s", borderRadius: "inherit" }}
                />
              </div>

              {/* Thumbnail Strip */}
              {product.images.length > 1 && (
                <div className="pdp-thumbnail-strip" style={{ position: "relative" }}>

                  {/* Thumbnails */}
                  <div ref={thumbnailsRef} className="pdp-thumbnails" style={{
                    display: "flex", gap: 10, overflowX: "auto",
                    scrollbarWidth: "none", msOverflowStyle: "none",
                    padding: "6px 4px", margin: "0 -4px",
                  }}>
                    {product.images.map((img, i) => (
                      <button
                        key={img.id || i}
                        onClick={() => setActiveImg(i)}
                        className={`pdp-thumbnail${activeImg === i ? " active" : ""}`}
                        style={{
                          position: "relative",
                          flex: "0 0 80px",
                          width: 80,
                          aspectRatio: "3 / 4",
                          padding: 0, border: "none", outline: "none",
                          overflow: "hidden", background: "#f5f5f5",
                          cursor: "pointer",
                          opacity: 1,
                        }}
                        aria-label={`View image ${i + 1}`}
                      >
                        <img
                          src={img.src}
                          alt={`${product.title} ${i + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>


            {/* ── RIGHT: Info Panel ── */}
            <div className="pdp-info-panel lg:sticky lg:top-24" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Product title */}
              <div className="pdp-summary">
                <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#111", lineHeight: 1.2, margin: 0, letterSpacing: "-0.01em" }}>
                  {product.title}
                </h1>
              </div>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "2px 0 0 0" }}>
                <span style={{ fontSize: "26px", fontWeight: 800, color: "#111", letterSpacing: "-0.02em" }}>
                  ₹ {fmt(price)}.00
                </span>
                {comparePrice > price && (
                  <span style={{ fontSize: "16px", color: "#888", textDecoration: "line-through" }}>
                    ₹ {fmt(comparePrice)}.00
                  </span>
                )}
                {discount > 0 && (
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#df5c35", background: "#fff0ea", padding: "4px 8px", borderRadius: 6 }}>
                    {discount}% OFF
                  </span>
                )}
              </div>

              {/* Rating */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 4px 0" }}>
                <Stars rating={avgRating || 0} size={15} color="#111" />
                <span style={{ fontSize: 13, color: "#666", fontWeight: 500 }}>
                  {totalReviews > 0 ? (
                    `${Number(avgRating || 0).toFixed(1)} (${totalReviews} ${totalReviews === 1 ? "review" : "reviews"})`
                  ) : (
                    <a href="#reviews" style={{ color: "#888", textDecoration: "underline", fontSize: 12 }}>
                      No reviews yet • Be the first to review
                    </a>
                  )}
                </span>
              </div>

              {/* Size Selector */}
              {sizes.length > 0 && (
                <div className="pdp-size-section">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0 }}>
                      Size: <span style={{ fontWeight: 700 }}>{selectedSize}</span>
                    </p>
                    <button
                      className="pdp-size-guide"
                      onClick={() => setSizeGuideOpen(true)}
                      style={{ fontSize: 12, color: "#555", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}
                    >
                      Size guide
                    </button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {sizes.map((size) => {
                      const v = product.variants.find((v) => {
                        const vSize = (v.option1 || v.title || "").trim().toLowerCase();
                        const sSize = (size || "").trim().toLowerCase();
                        return vSize === sSize;
                      });
                      const isSoldOut = v ? v.available === false : false;
                      const isActive = (selectedSize || "").trim().toLowerCase() === (size || "").trim().toLowerCase();
                      return (
                        <button
                          className={`pdp-size-option${isActive ? " active" : ""}${isSoldOut ? " sold-out" : ""}`}
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          style={{
                            minWidth: 44, height: 44, padding: "0 12px",
                            fontSize: 13, fontWeight: 600,
                            border: isActive
                              ? (isSoldOut ? "2px solid #555" : "2px solid #111")
                              : isSoldOut ? "1.5px dashed #ccc" : "1.5px solid #ddd",
                            background: isActive
                              ? (isSoldOut ? "#222" : "#111")
                              : isSoldOut ? "#f8f8f8" : "#fff",
                            color: isActive ? "#fff" : isSoldOut ? "#aaa" : "#333",
                            cursor: "pointer",
                            borderRadius: 4,
                            textDecoration: isSoldOut ? "line-through" : "none",
                            transition: "all 0.15s",
                          }}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity + Add to Cart */}
              <div className="pdp-quantity-section">
                <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: "0 0 10px 0" }}>Quantity</p>
                <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
                  {/* Qty stepper */}
                  <div className="pdp-quantity-control" style={{ display: "flex", alignItems: "center", border: "1.5px solid #ddd", borderRadius: 4, height: 48, overflow: "hidden", flexShrink: 0 }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={!available}
                      style={{ width: 38, height: "100%", border: "none", background: "#fff", fontSize: 18, cursor: !available ? "not-allowed" : "pointer", color: !available ? "#ccc" : "#333" }}
                    >−</button>
                    <span style={{ width: 36, textAlign: "center", fontSize: 14, fontWeight: 600, color: !available ? "#999" : "#111" }}>{quantity}</span>
                    <button
                      onClick={() => setQuantity((prev) => Math.min(MAX_QTY_PER_ITEM, prev + 1))}
                      disabled={!available || quantity >= MAX_QTY_PER_ITEM}
                      style={{ width: 38, height: "100%", border: "none", background: "#fff", fontSize: 18, cursor: (!available || quantity >= MAX_QTY_PER_ITEM) ? "not-allowed" : "pointer", color: (!available || quantity >= MAX_QTY_PER_ITEM) ? "#ccc" : "#333" }}
                    >+</button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    className="pdp-add-to-cart"
                    onClick={handleAddToCart}
                    disabled={!available}
                    style={{
                      flex: 1, height: 48, fontSize: 13, fontWeight: 700,
                      letterSpacing: "0.07em", textTransform: "uppercase",
                      border: available ? "1.5px solid #111" : "1.5px solid #e0e0e0",
                      background: !available ? "#f5f5f5" : addedToCart ? "#1a9e5d" : "#fff",
                      color: !available ? "#999" : addedToCart ? "#fff" : "#111",
                      cursor: available ? "pointer" : "not-allowed",
                      borderRadius: 4, transition: "all 0.2s",
                    }}
                  >
                    {!available ? "OUT OF STOCK" : addedToCart ? "✓ Added!" : "Add to Cart"}
                  </button>
                </div>
              </div>

              {/* Buy Now or Out of Stock Notify */}
              {available ? (
                <button
                  onClick={() => { addToCart(product, selectedSize, quantity); }}
                  className="pdp-buy-now"
                  style={{
                    width: "100%", height: 48, fontSize: 13, fontWeight: 700,
                    letterSpacing: "0.07em", textTransform: "uppercase",
                    border: "none", background: "#111", color: "#fff",
                    cursor: "pointer", borderRadius: 4, transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "0.88"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                >
                  Buy It Now
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
                  <div style={{
                    width: "100%", padding: "10px 14px",
                    background: "#fff1f0", border: "1px solid #ffccc7",
                    borderRadius: 4, textAlign: "center",
                    color: "#cf1322", fontSize: 13, fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                  }}>
                    <span>⚠️</span>
                    <span>Size {selectedSize} is currently Out of Stock</span>
                  </div>

                  {!notifyOpen && !notifySuccess && (
                    <button
                      type="button"
                      onClick={() => setNotifyOpen(true)}
                      style={{
                        width: "100%", height: 48, fontSize: 13, fontWeight: 700,
                        letterSpacing: "0.04em", textTransform: "uppercase",
                        border: "1.5px solid #111", background: "#111", color: "#fff",
                        cursor: "pointer", borderRadius: 4, transition: "all 0.2s",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#2a2a2a"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "#111"}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                      Notify Me When Available (Size {selectedSize})
                    </button>
                  )}

                  {notifyOpen && !notifySuccess && (
                    <form onSubmit={handleNotifySubmit} style={{
                      padding: "16px", background: "#fafafa", border: "1.5px solid #111",
                      borderRadius: 6, display: "flex", flexDirection: "column", gap: 10
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>
                          🔔 Get notified for Size {selectedSize}
                        </span>
                        <button
                          type="button"
                          onClick={() => setNotifyOpen(false)}
                          style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: "#888", padding: 0 }}
                        >×</button>
                      </div>
                      <p style={{ fontSize: 12, color: "#666", margin: 0, lineHeight: 1.4 }}>
                        We will notify you immediately once Size {selectedSize} is restocked.
                      </p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="text"
                          required
                          value={notifyEmail}
                          onChange={(e) => setNotifyEmail(e.target.value)}
                          placeholder="Email or mobile number"
                          style={{
                            flex: 1, height: 42, padding: "0 12px", fontSize: 13,
                            border: "1px solid #ccc", borderRadius: 4, outline: "none"
                          }}
                        />
                        <button
                          type="submit"
                          disabled={notifySubmitting}
                          style={{
                            height: 42, padding: "0 18px", fontSize: 12, fontWeight: 700,
                            letterSpacing: "0.05em", textTransform: "uppercase",
                            background: "#111", color: "#fff", border: "none", borderRadius: 4,
                            cursor: notifySubmitting ? "not-allowed" : "pointer"
                          }}
                        >
                          {notifySubmitting ? "..." : "Notify Me"}
                        </button>
                      </div>
                      {notifyError && (
                        <span style={{ fontSize: 11, color: "#cf1322" }}>{notifyError}</span>
                      )}
                    </form>
                  )}

                  {notifySuccess && (
                    <div style={{
                      padding: "14px 16px", background: "#f6ffed", border: "1px solid #b7eb8f",
                      borderRadius: 6, textAlign: "center", color: "#389e0d", fontSize: 13, fontWeight: 600
                    }}>
                      ✓ You&rsquo;re on the list! We&rsquo;ll notify you as soon as Size {selectedSize} is back in stock.
                    </div>
                  )}
                </div>
              )}

              {/* Delivery Info */}
              <div className="pdp-delivery-info" style={{ display: "flex", gap: 18, padding: "12px 0", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" style={{ flexShrink: 0 }}>
                    <rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 5v3h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <span style={{ fontSize: 12, color: "#555", lineHeight: 1.4 }}>Free delivery above ₹999</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" style={{ flexShrink: 0 }}>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span style={{ fontSize: 12, color: "#555", lineHeight: 1.4 }}>15-day easy returns</span>
                </div>
              </div>

              {/* Accordions */}
              <div className="pdp-accordions" style={{ borderTop: "1px solid #f0f0f0" }}>
                <AccordionItem label="Description">
                  {product.body_html ? (
                    <div dangerouslySetInnerHTML={{ __html: product.body_html }} />
                  ) : (
                    <p style={{ margin: 0 }}>No description available.</p>
                  )}
                </AccordionItem>
                <AccordionItem label="Care Instructions">
                  {product.care_instructions ? (
                    <div style={{ whiteSpace: "pre-line", fontSize: 13, color: "#444", lineHeight: 1.6 }}>
                      {product.care_instructions}
                    </div>
                  ) : (
                    <ul style={{ paddingLeft: 18, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                      <li>Wash inside out with similar colors</li>
                      <li>Do not tumble dry or dry clean</li>
                      <li>Do not iron directly on print</li>
                      <li>Line dry in shade</li>
                    </ul>
                  )}
                </AccordionItem>
                <AccordionItem label="Shipping & Returns">
                  <ul style={{ paddingLeft: 18, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                    <li>Free shipping on orders above ₹999</li>
                    <li>Delivered within 5–7 business days</li>
                    <li>Easy 15-day return & exchange policy</li>
                    <li>COD available on all orders</li>
                  </ul>
                </AccordionItem>
                <AccordionItem label="Manufacturer Details">
                  {product.manufacturer_details ? (
                    <div style={{ whiteSpace: "pre-line", fontSize: 13, color: "#444", lineHeight: 1.6 }}>
                      {product.manufacturer_details}
                    </div>
                  ) : (
                    <div>
                      <p style={{ margin: 0 }}><strong>Company:</strong> THE OUTLIERS STUDIO</p>
                      <p style={{ margin: "4px 0 0 0" }}><strong>Address:</strong> 3 A, Rakeshe Chawl, Shivshakti Colony, Laxman Nagar, Kurar Village, Nr Shiv Mandir, Malad East, Mumbai, Maharashtra - 400097</p>
                    </div>
                  )}
                </AccordionItem>
              </div>

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div className="pdp-tags-list" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {product.tags.slice(0, 6).map((tag) => (
                    <span key={tag} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, border: "1px solid #eee", color: "#888", background: "#fafafa" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <section className="container" style={{ borderTop: "1px solid #f0f0f0", paddingTop: 48, paddingBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 28 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, textTransform: "uppercase", color: "#111", margin: 0, letterSpacing: "0.03em" }}>You Might Also Like</h2>
              <Link href="/collections/all" style={{ fontSize: 12, color: "#999", textDecoration: "underline" }}>View All</Link>
            </div>
            <div className="product-grid">
              {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* ── Reviews ── */}
        <section id="reviews" className="container" style={{ borderTop: "1px solid #f0f0f0", paddingTop: 48, paddingBottom: 64 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, textTransform: "uppercase", color: "#111", margin: "0 0 32px 0", letterSpacing: "0.03em" }}>
            Customer Reviews {totalReviews > 0 && <span style={{ fontWeight: 400, color: "#aaa", fontSize: 14 }}>({totalReviews})</span>}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 40 }} className="reviews-two-col">

            {/* Review List */}
            <div>
              {reviews.length === 0 ? (
                <div style={{ padding: "32px 20px", border: "1.5px dashed #e8e8e8", textAlign: "center", borderRadius: 8 }}>
                  <p style={{ color: "#bbb", fontSize: 13, margin: 0 }}>No reviews yet. Be the first to share your experience!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {reviews.map((r) => (
                    <div key={r.id} style={{ border: "1px solid #f0f0f0", borderRadius: 8, padding: "18px 20px", background: "#fafafa" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#e8e8e8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#666" }}>
                            {r.user?.name ? r.user.name[0].toUpperCase() : "A"}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#222" }}>{r.user?.name || "Anonymous"}</p>
                            <p style={{ margin: 0, fontSize: 11, color: "#bbb" }}>{new Date(r.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</p>
                          </div>
                        </div>
                        <Stars rating={r.rating} size={12} />
                      </div>
                      {r.title && <h4 style={{ margin: "0 0 6px 0", fontSize: 14, fontWeight: 700, color: "#222" }}>{r.title}</h4>}
                      <p style={{ margin: 0, fontSize: 13, color: "#666", lineHeight: 1.65 }}>{r.body}</p>
                      {r.images && r.images.length > 0 && (
                        <div style={{ display: "flex", gap: 10, marginTop: 12, overflowX: "auto" }}>
                          {r.images.map((imgSrc, imgIdx) => (
                            <img
                              key={imgIdx}
                              src={imgSrc}
                              alt="Customer review photo"
                              onClick={() => setReviewModalImg(imgSrc)}
                              style={{ width: 68, height: 68, objectFit: "cover", borderRadius: 6, border: "1px solid #e0e0e0", cursor: "pointer", transition: "transform 0.15s ease" }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write a Review Section */}
            <div style={{ border: "1px solid #f0f0f0", borderRadius: 12, padding: 28, background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, textTransform: "uppercase", color: "#111", marginBottom: 16, letterSpacing: "0.04em" }}>Write a Review</h3>
              
              {!isAuthenticated ? (
                <div style={{ textAlign: "center", padding: "32px 20px", background: "#fcfbf9", borderRadius: 10, border: "1px dashed #e2ded7" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 18 }}>
                    🔒
                  </div>
                  <h4 style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", color: "#111", letterSpacing: "0.05em", marginBottom: 6 }}>
                    Sign In to Leave a Review
                  </h4>
                  <p style={{ fontSize: 12, color: "#666", maxWidth: 360, margin: "0 auto 20px", lineHeight: 1.5 }}>
                    You must be signed in to your Outliers account to post a verified customer review.
                  </p>
                  <Link
                    href={`/login?redirect=/products/${product?.handle || handle}`}
                    style={{ display: "inline-block", background: "#111", color: "#fff", padding: "12px 28px", borderRadius: 6, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: "none", transition: "all 0.2s" }}
                  >
                    Log In / Register &rarr;
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Logged-in Reviewer Identity */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f8f7f5", borderRadius: 8, border: "1px solid #eee" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
                        {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#111", lineHeight: 1.2 }}>
                          {user?.name || user?.email?.split("@")[0] || "User"}
                        </div>
                        <div style={{ fontSize: 11, color: "#888" }}>
                          {user?.email}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: "#ecfdf5", color: "#065f46", padding: "3px 8px", borderRadius: 4, border: "1px solid #a7f3d0" }}>
                      ✓ Verified Account
                    </span>
                  </div>

                  {reviewMsg.text && (
                    <div style={{ padding: "10px 14px", borderRadius: 6, fontSize: 13, background: reviewMsg.type === "error" ? "#fff0f0" : "#f0fff4", color: reviewMsg.type === "error" ? "#c00" : "#0a6", border: `1px solid ${reviewMsg.type === "error" ? "#fcc" : "#b2f5c8"}` }}>
                      {reviewMsg.text}
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>Your Rating</label>
                    <div style={{ display: "flex", gap: 4, fontSize: 28 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" style={{ background: "none", border: "none", cursor: "pointer", color: s <= reviewRating ? "#F5A623" : "#e0e0e0", padding: 0, lineHeight: 1, transition: "color 0.1s" }} onClick={() => setReviewRating(s)}>★</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Review Headline</label>
                    <input
                      type="text"
                      placeholder="Great quality, fits perfectly"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      required
                      style={{ width: "100%", border: "1.5px solid #e8e8e8", borderRadius: 4, padding: "10px 12px", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.15s" }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#111"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "#e8e8e8"}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Comments</label>
                    <textarea
                      rows={4}
                      placeholder="Share your experience with the product..."
                      value={reviewBody}
                      onChange={(e) => setReviewBody(e.target.value)}
                      required
                      style={{ width: "100%", border: "1.5px solid #e8e8e8", borderRadius: 4, padding: "10px 12px", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.15s" }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#111"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "#e8e8e8"}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>
                      Upload Photos (Optional - Max 4)
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                      {reviewImages.map((imgSrc, idx) => (
                        <div key={idx} style={{ position: "relative", width: 64, height: 64, borderRadius: 6, overflow: "hidden", border: "1px solid #e8e8e8" }}>
                          <img src={imgSrc} alt={`Review upload ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button
                            type="button"
                            onClick={() => removeReviewImage(idx)}
                            style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.65)", color: "#fff", border: "none", borderRadius: "50%", width: 18, height: 18, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {reviewImages.length < 4 && (
                        <label style={{ width: 64, height: 64, borderRadius: 6, border: "1.5px dashed #ccc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#fafafa", color: "#666", fontSize: 11, transition: "all 0.15s" }}>
                          <span style={{ fontSize: 18, lineHeight: 1 }}>📷</span>
                          <span style={{ fontSize: 10, marginTop: 4, fontWeight: 600 }}>Add Photo</span>
                          <input type="file" accept="image/*" multiple onChange={handleReviewImageUpload} style={{ display: "none" }} />
                        </label>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{ width: "100%", background: "#111", color: "#fff", border: "none", padding: "13px 0", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", cursor: submitting ? "not-allowed" : "pointer", borderRadius: 4, opacity: submitting ? 0.6 : 1, transition: "opacity 0.2s" }}
                  >
                    {submitting ? "Publishing…" : "Submit Review"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {reviewModalImg && (
            <div
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overscrollBehavior: "contain", touchAction: "none" }}
              onClick={() => setReviewModalImg(null)}
            >
              <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
                <img src={reviewModalImg} alt="Review full resolution" style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: 8, objectFit: "contain" }} />
                <button
                  onClick={() => setReviewModalImg(null)}
                  style={{ position: "absolute", top: -14, right: -14, background: "#111", color: "#fff", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* ─── Lightbox ─── */}
      {lightboxOpen && product.images[activeImg] && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 350, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overscrollBehavior: "contain", touchAction: "none" }}
          onClick={() => setLightboxOpen(false)}
        >
          <button onClick={() => setLightboxOpen(false)} style={{ position: "absolute", top: 20, right: 24, color: "#fff", fontSize: 32, background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>×</button>
          {product.images.length > 1 && (
            <>
              <button style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#fff", fontSize: 28, background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={(e) => { e.stopPropagation(); setActiveImg((activeImg - 1 + product.images.length) % product.images.length); }}>‹</button>
              <button style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "#fff", fontSize: 28, background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={(e) => { e.stopPropagation(); setActiveImg((activeImg + 1) % product.images.length); }}>›</button>
            </>
          )}
          <img src={product.images[activeImg].src} alt={product.title} style={{ maxWidth: "100%", maxHeight: "88vh", objectFit: "contain", borderRadius: 4 }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* ─── Size Guide Modal ─── */}
      {sizeGuideOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 350, overscrollBehavior: "contain", touchAction: "none" }} onClick={() => setSizeGuideOpen(false)}>
          <div style={{ background: "#fff", maxWidth: 500, width: "100%", padding: 32, borderRadius: 10, position: "relative", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            <button style={{ position: "absolute", top: 16, right: 20, fontSize: 26, background: "none", border: "none", cursor: "pointer", color: "#aaa", lineHeight: 1 }} onClick={() => setSizeGuideOpen(false)}>×</button>
            <h3 style={{ fontSize: 16, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Size Guide</h3>
            <p style={{ fontSize: 12, color: "#bbb", marginBottom: 20 }}>All measurements in inches</p>
            <div style={{ overflowX: "auto" }}>
              <table className="size-guide-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    {["Size", "Chest", "Waist", "Shoulder", "Length"].map((h) => (
                      <th key={h} style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#555", textAlign: "left", borderBottom: "1px solid #eee" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[["S", "36–38", "30–32", "18.5", "27.5"], ["M", "38–40", "32–34", "19.5", "28.5"], ["L", "40–42", "34–36", "20.5", "29.5"], ["XL", "42–44", "36–38", "21.5", "30.5"], ["2XL", "44–46", "38–40", "22.5", "31.5"]].map(([size, ...vals]) => (
                    <tr key={size} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "10px 12px", fontWeight: 700, fontSize: 13 }}>{size}</td>
                      {vals.map((v, i) => <td key={i} style={{ padding: "10px 12px", fontSize: 13, color: "#555" }}>{v}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 11, color: "#bbb", marginTop: 16, lineHeight: 1.6 }}>* Oversized fit — order true-to-size for the intended boxy look.</p>
          </div>
        </div>
      )}



      <CartDrawer />
    </div>
  );
}
