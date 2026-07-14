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

/* ─── Data Mapper ─────────────────────────────────────────── */
const mapProduct = (bp) => ({
  id: bp.id,
  title: bp.title,
  handle: bp.handle,
  body_html: bp.description || "",
  vendor: bp.vendor || "House of Outliers",
  product_type: bp.productType || "Apparel",
  tags: bp.tags || [],
  variants:
    bp.variants?.map((v) => ({
      id: v.id,
      title: v.title,
      option1: v.option1 || null,
      option2: v.option2 || null,
      price: v.price,
      compare_at_price: v.comparePrice || null,
      sku: v.sku || null,
      available: v.inventory ? v.inventory.quantity > 0 : true,
      position: v.position || 1,
      product_id: bp.id,
    })) || [],
  images:
    bp.images?.map((img) => ({
      id: img.id,
      src: img.src,
      alt_text: img.altText || "",
      position: img.position || 1,
    })) || [],
  options: bp.options || [
    {
      name: "Size",
      position: 1,
      values: bp.variants?.map((v) => v.option1).filter(Boolean) || [],
    },
  ],
});

/* ─── Helpers ────────────────────────────────────────────── */
const fmt = (n) => Number(n).toLocaleString("en-IN");

const Stars = ({ rating = 0, size = 14 }) => (
  <span style={{ fontSize: size, color: "#F5A623", letterSpacing: 1 }}>
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
    <div style={{ background: "#f9f9f9", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #e0e0e0", borderTopColor: "#222", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function ProductDetailPage({ params }) {
  const { handle } = use(params);
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { isAuthenticated } = useAuth();
  const staticProducts = productsData.products || [];

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState({ type: "", text: "" });

  /* fetch product */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await productsApi.getByHandle(handle);
        if (res.success && res.data) setProduct(mapProduct(res.data));
        else {
          const sp = staticProducts.find((p) => p.handle === handle);
          if (sp) setProduct(sp);
        }
      } catch {
        const sp = staticProducts.find((p) => p.handle === handle);
        if (sp) setProduct(sp);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [handle]);

  /* after product loads */
  useEffect(() => {
    if (!product) return;
    const sizes = getSizes(product);
    if (sizes.length) setSelectedSize(sizes[0]);

    const related = staticProducts
      .filter((p) => p.id !== product.id && (p.product_type === product.product_type || p.vendor === product.vendor))
      .slice(0, 4);
    setRelatedProducts(related);

    // Load reviews
    reviewsApi.list(String(product.id)).then((res) => {
      if (res.success && res.data) {
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.avgRating || 0);
        setTotalReviews(res.data.totalReviews || 0);
      }
    }).catch(() => { });
  }, [product]);

  const getSizes = (p) =>
    p.options?.[0]?.values ||
    [...new Set(p.variants.map((v) => v.option1 || v.title).filter(Boolean))];

  const getActiveVariant = () =>
    product?.variants.find((v) => v.option1 === selectedSize || v.title === selectedSize) ||
    product?.variants[0];

  const handleAddToCart = () => {
    if (!getActiveVariant()?.available) return;
    addToCart(product, selectedSize, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewBody.trim()) {
      setReviewMsg({ type: "error", text: "Please fill in all fields." });
      return;
    }
    setSubmitting(true);
    setReviewMsg({ type: "", text: "" });
    try {
      await reviewsApi.create({ productId: product.id, rating: reviewRating, title: reviewTitle, body: reviewBody });
      setReviewMsg({ type: "success", text: "Review submitted! Thank you." });
      setReviewTitle("");
      setReviewBody("");
      setReviewRating(5);
    } catch (err) {
      setReviewMsg({ type: "error", text: err.message || "Failed to submit." });
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
                style={{ position: "relative", background: "#f5f5f5", cursor: "zoom-in", overflow: "hidden" }}
                onClick={() => setLightboxOpen(true)}
              >
                {discount > 0 && (
                  <span style={{
                    position: "absolute", top: 14, left: 14, zIndex: 2,
                    background: "#e84e4e", color: "#fff", fontSize: 10,
                    fontWeight: 800, padding: "4px 10px", borderRadius: 3, letterSpacing: "0.05em",
                  }}>
                    -{discount}% OFF
                  </span>
                )}
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
                <img
                  src={product.images[activeImg]?.src}
                  alt={product.title}
                  className="pdp-hero-image-media"
                  style={{ width: "100%", objectFit: "cover", display: "block", transition: "opacity 0.25s" }}
                />
              </div>

              {/* Thumbnail Strip with Arrows */}
              {product.images.length > 1 && (
                <div className="pdp-thumbnail-strip" style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>

                  {/* Prev Arrow */}
                  <button
                    onClick={() => setActiveImg((prev) => Math.max(0, prev - 1))}
                    disabled={activeImg === 0}
                    style={{
                      flexShrink: 0, width: 32, height: 32, borderRadius: "50%",
                      background: activeImg === 0 ? "#f0f0f0" : "#fff",
                      border: "1px solid #e0e0e0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: activeImg === 0 ? "default" : "pointer",
                      zIndex: 2, marginRight: 6,
                      boxShadow: activeImg === 0 ? "none" : "0 1px 4px rgba(0,0,0,0.12)",
                      transition: "all 0.15s",
                      opacity: activeImg === 0 ? 0.4 : 1,
                    }}
                    aria-label="Previous image"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>

                  {/* Thumbnails */}
                  <div className="pdp-thumbnails" style={{
                    flex: 1, display: "flex", gap: 10, overflowX: "auto",
                    scrollbarWidth: "none", msOverflowStyle: "none",
                  }}>
                    {product.images.map((img, i) => (
                      <button
                        key={img.id || i}
                        onClick={() => setActiveImg(i)}
                        className={`pdp-thumbnail${activeImg === i ? " active" : ""}`}
                        style={{
                          flex: "0 0 80px",
                          width: 80,
                          height: 96,
                          padding: 0, border: "none", outline: "none",
                          overflow: "hidden", background: "#f5f5f5",
                          cursor: "pointer",
                          opacity: activeImg === i ? 1 : 0.65,
                          transition: "opacity 0.15s",
                        }}
                        onMouseEnter={(e) => { if (activeImg !== i) e.currentTarget.style.opacity = "1"; }}
                        onMouseLeave={(e) => { if (activeImg !== i) e.currentTarget.style.opacity = "0.65"; }}
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

                  {/* Next Arrow */}
                  <button
                    onClick={() => setActiveImg((prev) => Math.min(product.images.length - 1, prev + 1))}
                    disabled={activeImg === product.images.length - 1}
                    style={{
                      flexShrink: 0, width: 32, height: 32, borderRadius: "50%",
                      background: activeImg === product.images.length - 1 ? "#f0f0f0" : "#fff",
                      border: "1px solid #e0e0e0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: activeImg === product.images.length - 1 ? "default" : "pointer",
                      zIndex: 2, marginLeft: 6,
                      boxShadow: activeImg === product.images.length - 1 ? "none" : "0 1px 4px rgba(0,0,0,0.12)",
                      transition: "all 0.15s",
                      opacity: activeImg === product.images.length - 1 ? 0.4 : 1,
                    }}
                    aria-label="Next image"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>


            {/* ── RIGHT: Info Panel ── */}
            <div className="pdp-info-panel lg:sticky lg:top-24" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Product title */}
              <div className="pdp-summary">
                <h1 style={{ fontSize: "clamp(19px, 2.5vw, 24px)", fontWeight: 700, color: "#111", lineHeight: 1.3, margin: 0 }}>{product.title}</h1>
              </div>

              {/* Rating */}
              <div className="pdp-rating-row" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Stars rating={avgRating || 4} size={13} />
                <span style={{ fontSize: 12, color: "#888" }}>
                  {totalReviews > 0 ? `${(avgRating || 4).toFixed(1)} · ${totalReviews} Reviews` : "Be the first to review"}
                </span>
              </div>

              {/* Price */}
              <div className="pdp-price-block">
                <div className="pdp-price-row">
                  <span className="pdp-sale-price">₹{fmt(price)}</span>
                  {comparePrice > price && (
                    <span className="pdp-compare-price">₹{fmt(comparePrice)}</span>
                  )}
                  {discount > 0 && (
                    <span className="pdp-discount-badge">Save {discount}%</span>
                  )}
                </div>
                <p className="pdp-price-note">Inclusive of all taxes · Free shipping above ₹999</p>
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
                      const v = product.variants.find((v) => v.option1 === size || v.title === size);
                      const isSoldOut = v?.available === false;
                      const isActive = selectedSize === size;
                      return (
                        <button
                          className={`pdp-size-option${isActive ? " active" : ""}`}
                          key={size}
                          onClick={() => !isSoldOut && setSelectedSize(size)}
                          disabled={isSoldOut}
                          style={{
                            minWidth: 44, height: 44, padding: "0 12px",
                            fontSize: 13, fontWeight: 600,
                            border: isActive ? "2px solid #111" : "1.5px solid #ddd",
                            background: isActive ? "#111" : "#fff",
                            color: isSoldOut ? "#ccc" : isActive ? "#fff" : "#333",
                            cursor: isSoldOut ? "not-allowed" : "pointer",
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
                      style={{ width: 38, height: "100%", border: "none", background: "#fff", fontSize: 18, cursor: "pointer", color: "#333" }}
                    >−</button>
                    <span style={{ width: 36, textAlign: "center", fontSize: 14, fontWeight: 600, color: "#111" }}>{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      style={{ width: 38, height: "100%", border: "none", background: "#fff", fontSize: 18, cursor: "pointer", color: "#333" }}
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
                      border: available ? "1.5px solid #111" : "1.5px solid #ccc",
                      background: addedToCart ? "#1a9e5d" : "#fff",
                      color: addedToCart ? "#fff" : available ? "#111" : "#bbb",
                      cursor: available ? "pointer" : "not-allowed",
                      borderRadius: 4, transition: "all 0.2s",
                    }}
                  >
                    {!available ? "Sold Out" : addedToCart ? "✓ Added!" : "Add to Cart"}
                  </button>
                </div>
              </div>

              {/* Buy Now */}
              {available && (
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
                <AccordionItem label="Fabric & Care">
                  <ul style={{ paddingLeft: 18, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                    <li>Wash inside out with similar colors</li>
                    <li>Do not tumble dry or dry clean</li>
                    <li>Do not iron directly on print</li>
                    <li>Line dry in shade</li>
                  </ul>
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
                  <p style={{ margin: 0 }}><strong>Company:</strong> House of Koala Fashion Private Limited</p>
                  <p style={{ margin: "4px 0 0 0" }}><strong>Address:</strong> Ground Floor, Sector 4, HSR Layout, Bengaluru, Karnataka, 560102</p>
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
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write a Review */}
            <div style={{ border: "1px solid #f0f0f0", borderRadius: 8, padding: 28, background: "#fff" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, textTransform: "uppercase", color: "#111", marginBottom: 20, letterSpacing: "0.04em" }}>Write a Review</h3>
              {!isAuthenticated ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ fontSize: 13, color: "#999", marginBottom: 16 }}>Log in to share your experience.</p>
                  <Link href="/pages/account" style={{ display: "inline-block", padding: "10px 24px", background: "#111", color: "#fff", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", borderRadius: 4 }}>
                    Log In / Sign Up
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {reviewMsg.text && (
                    <div style={{ padding: "10px 14px", borderRadius: 4, fontSize: 13, background: reviewMsg.type === "error" ? "#fff0f0" : "#f0fff4", color: reviewMsg.type === "error" ? "#c00" : "#0a6", border: `1px solid ${reviewMsg.type === "error" ? "#fcc" : "#b2f5c8"}` }}>
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
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Title</label>
                    <input
                      type="text"
                      placeholder="Great quality, fits perfectly"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
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
                      style={{ width: "100%", border: "1.5px solid #e8e8e8", borderRadius: 4, padding: "10px 12px", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.15s" }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#111"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "#e8e8e8"}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{ width: "100%", background: "#111", color: "#fff", border: "none", padding: "13px 0", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", cursor: submitting ? "not-allowed" : "pointer", borderRadius: 4, opacity: submitting ? 0.6 : 1, transition: "opacity 0.2s" }}
                  >
                    {submitting ? "Submitting…" : "Submit Review"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* ─── Lightbox ─── */}
      {lightboxOpen && product.images[activeImg] && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 350, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 350 }} onClick={() => setSizeGuideOpen(false)}>
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
