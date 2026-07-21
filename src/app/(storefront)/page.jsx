"use client";

import React, { useState, useEffect } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";
import ImageBanner from "@/components/ImageBanner";
import { productsApi } from "@/lib/api";
import localProducts from "@/data/products.json";

// ─── Normalize API product → ProductCard prop shape ───────────────────────────
// Backend returns camelCase fields. ProductCard expects Shopify-style snake_case.
function normalizeProduct(p) {
  if (!p) return null;

  // If it's already a Shopify-style product (has product_type, body_html), just return it
  if (p.product_type || p.body_html) {
    // Ensure images have src (they should already, but just in case)
    const images = (p.images || []).map((img) => ({ ...img, src: img.src || "" }));
    // Ensure variants have compare_at_price
    const variants = (p.variants || []).map((v) => ({
      ...v,
      price: String(v.price || "0"),
      compare_at_price: v.compare_at_price ? String(v.compare_at_price) : (v.comparePrice ? String(v.comparePrice) : null),
      comparePrice: v.compare_at_price ? String(v.compare_at_price) : (v.comparePrice ? String(v.comparePrice) : null),
    }));
    return { ...p, images, variants };
  }

  // Map variants (backend camelCase to Shopify snake_case)
  const variants = (p.variants || []).map((v) => ({
    ...v,
    id: v.id,
    title: v.title || v.option1 || "Default",
    option1: v.option1,
    option2: v.option2,
    price: String(v.price || "0"),
    compare_at_price: v.comparePrice ? String(v.comparePrice) : null,
    comparePrice: v.comparePrice ? String(v.comparePrice) : null,
    inventory: v.inventory,
  }));

  // Map images — ensure each has a `src` property
  const images = (p.images || []).map((img) => ({
    ...img,
    src: img.src || img.url || img.imageSrc || "",
  }));

  return {
    ...p,
    id: p.id,
    title: p.title,
    handle: p.handle,
    product_type: p.productType || p.product_type || "",
    body_html: p.description || p.body_html || "",
    tags: p.tags || [],
    vendor: p.vendor || "",
    variants: variants.length > 0 ? variants : [{ id: "default", title: "Default", price: "0", compare_at_price: null }],
    images: images,
    options: p.options || [{ name: "Size", values: variants.map((v) => v.option1).filter(Boolean) }],
  };
}

// ─── Skeleton primitives ──────────────────────────────────────────────────────
const SkBox = ({ className = "", style = {} }) => (
  <div className={`sk-box ${className}`} style={style} />
);

const SkLine = ({ w = "100%", h = 14 }) => (
  <div className="sk-box sk-line" style={{ width: w, height: h }} />
);

// ─── Hero Slider Skeleton ─────────────────────────────────────────────────────
function SkHeroSlider() {
  return (
    <div className="sk-hero">
      <SkBox style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: 0 }} />
      <div className="sk-hero-content">
        <SkBox className="sk-hero-title" />
        <SkBox className="sk-hero-sub" />
        <SkBox className="sk-hero-btn" />
      </div>
      <div className="sk-slider-controls">
        <SkBox style={{ width: 50, height: 50, borderRadius: "50%" }} />
        <SkBox style={{ width: 50, height: 50, borderRadius: "50%" }} />
      </div>
    </div>
  );
}

// ─── Skeleton product card ────────────────────────────────────────────────────
function SkProductCard() {
  return (
    <div className="product-card">
      <div className="product-card-media" style={{ background: "transparent" }}>
        <SkBox style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: 0 }} />
      </div>
      <div className="product-card-info">
        <SkLine w="48%" h={11} />
        <SkLine w="88%" h={14} />
        <SkLine w="38%" h={14} />
      </div>
    </div>
  );
}

// ─── Category Grid Skeleton ───────────────────────────────────────────────────
function SkCategoryGrid() {
  return (
    <section className="container-fluid sk-section" style={{ marginTop: 60, marginBottom: 60 }}>
      <div className="sk-section-title-wrap">
        <SkBox style={{ width: 240, height: 28, borderRadius: 5 }} />
      </div>
      <div className="category-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="category-card" style={{ background: "transparent" }}>
            <SkBox style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: 0 }} />
            <div className="category-card-info" style={{ zIndex: 2, gap: 10, background: "transparent" }}>
              <SkBox style={{ width: 120, height: 18, borderRadius: 4 }} />
              <SkBox style={{ width: 80, height: 12, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Trending Now Skeleton ────────────────────────────────────────────────────
function SkTrendingSection() {
  return (
    <section className="container-fluid sk-section" style={{ marginTop: 64, marginBottom: 64 }}>
      <div className="sk-section-title-wrap">
        <SkBox style={{ width: 200, height: 28, borderRadius: 5 }} />
      </div>
      <div className="product-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkProductCard key={i} />
        ))}
      </div>
    </section>
  );
}

// ─── Row Skeleton ─────────────────────────────────────────────────────────────
function SkProductRow({ count = 5 }) {
  return (
    <section className="container-fluid sk-section" style={{ marginTop: 64, marginBottom: 64 }}>
      <div className="sk-section-title-wrap">
        <SkBox style={{ width: 280, height: 28, borderRadius: 5 }} />
      </div>
      <div className="sk-5col-grid">
        {Array.from({ length: count }).map((_, i) => (
          <SkProductCard key={i} />
        ))}
      </div>
      <div className="sk-cta-row">
        <SkBox style={{ width: 160, height: 48, borderRadius: 4 }} />
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [trending, setTrending] = useState([]);
  const [recommends, setRecommends] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to get products from local data (matching collection tags)
  const getLocalProductsByCollection = (collection, limit) => {
    const all = localProducts.products;
    let filtered = all;
    if (collection === "bestsellers") {
      filtered = all.filter((p) =>
        p.tags.some((t) => ["bestseller", "best-seller", "trending"].includes(t.toLowerCase()))
      );
    } else if (collection === "outliers-recommends") {
      filtered = all.filter((p) =>
        p.tags.some((t) => t.toLowerCase().includes("outliers"))
      );
    } else if (collection === "whats-new") {
      filtered = all.filter((p) =>
        p.tags.some((t) => ["new", "new-arrival", "whats-new"].includes(t.toLowerCase()))
      );
    }
    return filtered.slice(0, limit).map(normalizeProduct);
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [trendRes, recRes, newRes, allRes] = await Promise.all([
          productsApi.list({ collection: "bestsellers", limit: "8" }),
          productsApi.list({ collection: "outliers-recommends", limit: "5" }),
          productsApi.list({ collection: "whats-new", limit: "5" }),
          productsApi.list({ limit: "24" }),
        ]);

        const extract = (res) => {
          if (res && res.success) {
            const raw = Array.isArray(res.data)
              ? res.data
              : Array.isArray(res.data?.products)
              ? res.data.products
              : [];
            return raw.map(normalizeProduct);
          }
          return [];
        };

        const allDb = extract(allRes);
        const trendDb = extract(trendRes);
        const recDb = extract(recRes);
        const newDb = extract(newRes);

        setTrending(trendDb.length > 0 ? trendDb : (allDb.length > 0 ? allDb.slice(0, 8) : getLocalProductsByCollection("bestsellers", 8)));
        setRecommends(recDb.length > 0 ? recDb : (allDb.length > 0 ? allDb.slice(8, 13) : getLocalProductsByCollection("outliers-recommends", 5)));
        setNewArrivals(newDb.length > 0 ? newDb : (allDb.length > 0 ? allDb.slice(13, 18) : getLocalProductsByCollection("whats-new", 5)));
      } catch (e) {
        console.error("Error fetching backend products, using local data:", e);
        // Fallback to local products
        setTrending(getLocalProductsByCollection("bestsellers", 8));
        setRecommends(getLocalProductsByCollection("outliers-recommends", 5));
        setNewArrivals(getLocalProductsByCollection("whats-new", 5));
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="storefront-home flex flex-col min-h-screen">
      {/* ① Scrolling promo bar */}
      <AnnouncementBar />

      {/* ② Sticky header */}
      <Header />

      <main className="home-main flex-grow">
        {/* ③ Full-width hero banner */}
        <HeroSlider />

        {/* ⑤ Trending Now */}
        {loading ? (
          <SkTrendingSection />
        ) : (
          <section className="container-fluid home-section">
            <h2 className="section-title">Trending Now</h2>
            <div className="product-grid">
              {trending.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* ⑥ Outliers Recommends */}
        {loading ? (
          <SkProductRow count={5} />
        ) : (
          <section className="container-fluid home-section">
            <h2 className="section-title">Outliers Recommends</h2>
            <div className="sk-5col-grid">
              {recommends.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* ⑥.5 Campaign Image Banner */}
        <ImageBanner />

        {/* ⑦ New Arrivals */}
        {loading ? (
          <SkProductRow count={5} />
        ) : (
          <section className="container-fluid home-section">
            <h2 className="section-title">New Arrivals</h2>
            <div className="sk-5col-grid">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ⑨ Footer */}
      <Footer />

      {/* Side Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
