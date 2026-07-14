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
import productsData from "@/data/products.json";

// ─── Skeleton primitives ──────────────────────────────────────────────────
const SkBox = ({ className = "", style = {} }) => (
  <div className={`sk-box ${className}`} style={style} />
);

const SkLine = ({ w = "100%", h = 14 }) => (
  <div className="sk-box sk-line" style={{ width: w, height: h }} />
);

// ─── Hero Slider Skeleton ──────────────────────────────────────────────────
function SkHeroSlider() {
  return (
    <div className="sk-hero">
      {/* Full-bleed image placeholder */}
      <SkBox
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          borderRadius: 0,
        }}
      />

      {/* Overlay text — bottom-left */}
      <div className="sk-hero-content">
        <SkBox className="sk-hero-title" />
        <SkBox className="sk-hero-sub" />
        <SkBox className="sk-hero-btn" />
      </div>

      {/* Arrow buttons */}
      <div className="sk-slider-controls">
        <SkBox style={{ width: 50, height: 50, borderRadius: "50%" }} />
        <SkBox style={{ width: 50, height: 50, borderRadius: "50%" }} />
      </div>
    </div>
  );
}

// ─── Skeleton product card ────────────────────────────────────────────────
function SkProductCard() {
  return (
    <div className="product-card">
      {/* Image — 3:4 aspect ratio */}
      <div className="product-card-media" style={{ background: "transparent" }}>
        <SkBox
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            borderRadius: 0,
          }}
        />
      </div>
      {/* Text rows */}
      <div className="product-card-info">
        <SkLine w="48%" h={11} />
        <SkLine w="88%" h={14} />
        <SkLine w="38%" h={14} />
      </div>
    </div>
  );
}

// ─── Category Grid Skeleton ────────────────────────────────────────────────
function SkCategoryGrid() {
  return (
    <section
      className="container-fluid sk-section"
      style={{ marginTop: 60, marginBottom: 60 }}
    >
      <div className="sk-section-title-wrap">
        <SkBox style={{ width: 240, height: 28, borderRadius: 5 }} />
      </div>

      {/* 4 cards — aspect-ratio 4:5 via .category-card */}
      <div className="category-grid">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="category-card"
            style={{ background: "transparent" }}
          >
            <SkBox
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                borderRadius: 0,
              }}
            />
            {/* Label lines at bottom */}
            <div
              className="category-card-info"
              style={{ zIndex: 2, gap: 10, background: "transparent" }}
            >
              <SkBox style={{ width: 120, height: 18, borderRadius: 4 }} />
              <SkBox style={{ width: 80, height: 12, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Trending Now Skeleton ────────────────────────────────────────────────
function SkTrendingSection() {
  return (
    <section
      className="container-fluid sk-section"
      style={{ marginTop: 64, marginBottom: 64 }}
    >
      <div className="sk-section-title-wrap">
        <SkBox style={{ width: 200, height: 28, borderRadius: 5 }} />
      </div>

      {/* Tabs */}
      <div className="sk-tabs">
        <SkBox style={{ width: 110, height: 20, borderRadius: 4 }} />
        <SkBox style={{ width: 110, height: 20, borderRadius: 4 }} />
      </div>

      {/* 4-column product grid (4→3→2 via .product-grid media queries) */}
      <div className="product-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkProductCard key={i} />
        ))}
      </div>
    </section>
  );
}

// ─── Outliers Recommends Skeleton ──────────────────────────────────────────────
function SkProductRow({ count = 5 }) {
  return (
    <section
      className="container-fluid sk-section"
      style={{ marginTop: 64, marginBottom: 64 }}
    >
      <div className="sk-section-title-wrap">
        <SkBox style={{ width: 280, height: 28, borderRadius: 5 }} />
      </div>

      {/* 5-col → responsive via sk-5col-grid */}
      <div className="sk-5col-grid">
        {Array.from({ length: count }).map((_, i) => (
          <SkProductCard key={i} />
        ))}
      </div>

      {/* CTA button */}
      <div className="sk-cta-row">
        <SkBox style={{ width: 160, height: 48, borderRadius: 4 }} />
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const staticProducts = productsData.products || [];
  const [trending, setTrending] = useState(staticProducts.slice(0, 8));
  const [recommends, setRecommends] = useState(staticProducts.slice(8, 13));
  const [newArrivals, setNewArrivals] = useState(staticProducts.slice(13, 18));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [trendRes, recRes, newRes] = await Promise.all([
          productsApi.list({ collection: "bestsellers", limit: "8" }),
          productsApi.list({ collection: "outliers-recommends", limit: "5" }),
          productsApi.list({ collection: "whats-new", limit: "5" }),
        ]);

        const trend =
          trendRes.success && trendRes.data && trendRes.data.length > 0
            ? trendRes.data
            : staticProducts.slice(0, 8);

        const rec =
          recRes.success && recRes.data && recRes.data.length > 0
            ? recRes.data
            : staticProducts.slice(8, 13);

        const newVal =
          newRes.success && newRes.data && newRes.data.length > 0
            ? newRes.data
            : staticProducts.slice(13, 18);

        setTrending(trend);
        setRecommends(rec);
        setNewArrivals(newVal);
      } catch (e) {
        console.error("Error fetching backend products:", e);
      }
    };
    fetchAll();
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
        <section className="container-fluid home-section">
          <h2 className="section-title">Trending Now</h2>
          <div className="product-grid">
            {trending.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ⑥ Outliers Recommends */}
        <section className="container-fluid home-section">
          <h2 className="section-title">Outliers Recommends</h2>
          <div className="sk-5col-grid">
            {recommends.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ⑥.5 Campaign Image Banner */}
        <ImageBanner />

        {/* ⑦ New Arrivals */}
        <section className="container-fluid home-section">
          <h2 className="section-title">New Arrivals</h2>
          <div className="sk-5col-grid">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      {/* ⑨ Footer */}
      <Footer />

      {/* Side Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
