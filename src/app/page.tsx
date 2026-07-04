'use client';

import React from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Header from '../components/Header';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';

// ─── Skeleton primitives ──────────────────────────────────────────────────
const SkBox = ({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`sk-box ${className}`} style={style} />
);

const SkLine = ({ w = '100%', h = 14 }: { w?: string | number; h?: number }) => (
  <div className="sk-box sk-line" style={{ width: w, height: h }} />
);

// ─── Hero Slider ──────────────────────────────────────────────────────────
function SkHeroSlider() {
  return (
    <div className="sk-hero">
      {/* Full-bleed image placeholder */}
      <SkBox style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 0 }} />

      {/* Overlay text — bottom-left */}
      <div className="sk-hero-content">
        <SkBox className="sk-hero-title" />
        <SkBox className="sk-hero-sub" />
        <SkBox className="sk-hero-btn" />
      </div>

      {/* Arrow buttons */}
      <div className="sk-slider-controls">
        <SkBox style={{ width: 50, height: 50, borderRadius: '50%' }} />
        <SkBox style={{ width: 50, height: 50, borderRadius: '50%' }} />
      </div>
    </div>
  );
}

// ─── Skeleton product card ────────────────────────────────────────────────
function SkProductCard() {
  return (
    <div className="product-card">
      {/* Image — 3:4 aspect ratio */}
      <div className="product-card-media" style={{ background: 'transparent' }}>
        <SkBox style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 0 }} />
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

// ─── Category Grid ────────────────────────────────────────────────────────
function SkCategoryGrid() {
  return (
    <section className="container-fluid sk-section" style={{ marginTop: 60, marginBottom: 60 }}>
      <div className="sk-section-title-wrap">
        <SkBox style={{ width: 240, height: 28, borderRadius: 5 }} />
      </div>

      {/* 4 cards — aspect-ratio 4:5 via .category-card */}
      <div className="category-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="category-card" style={{ background: 'transparent' }}>
            <SkBox style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 0 }} />
            {/* Label lines at bottom */}
            <div className="category-card-info" style={{ zIndex: 2, gap: 10, background: 'transparent' }}>
              <SkBox style={{ width: 120, height: 18, borderRadius: 4 }} />
              <SkBox style={{ width: 80,  height: 12, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Trending Now — tabbed 4×2 product grid ──────────────────────────────
function SkTrendingSection() {
  return (
    <section className="container-fluid sk-section" style={{ marginTop: 64, marginBottom: 64 }}>
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

// ─── Koala Recommends — 5-col row + CTA ──────────────────────────────────
function SkProductRow({ count = 5 }: { count?: number }) {
  return (
    <section className="container-fluid sk-section" style={{ marginTop: 64, marginBottom: 64 }}>
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

// ─── Dark "Our Story" Band ────────────────────────────────────────────────
function SkStoryBand() {
  const darkBox = { background: 'rgba(255,255,255,0.12)', animation: 'none' } as React.CSSProperties;
  const dimBox  = { background: 'rgba(255,255,255,0.07)', animation: 'none' } as React.CSSProperties;

  return (
    <section className="sk-story-band">
      <div className="sk-story-inner">
        {/* Left — heading + paragraph lines + CTA */}
        <div className="sk-story-text">
          <SkBox style={{ ...darkBox, width: 180, height: 24, borderRadius: 5 }} />
          {[100, 92, 96, 72, 83].map((w, i) => (
            <SkBox key={i} style={{ ...dimBox, width: `${w}%`, height: 12, borderRadius: 4 }} />
          ))}
          <SkBox style={{ ...darkBox, width: 140, height: 44, borderRadius: 4, marginTop: 8 }} />
        </div>

        {/* Right — 2 card boxes (testimonials / trust cards) */}
        <div className="sk-story-cards">
          {[0, 1].map((i) => (
            <div key={i} className="sk-story-card">
              {[100, 80, 90, 60].map((w, j) => (
                <SkBox key={j} style={{ ...dimBox, width: `${w}%`, height: 12, borderRadius: 4 }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ① Scrolling promo bar */}
      <AnnouncementBar />

      {/* ② Sticky header */}
      <Header />

      <main className="flex-grow">
        {/* ③ Full-width hero banner */}
        <SkHeroSlider />

        {/* ④ Shop by Category — 4-col grid */}
        <SkCategoryGrid />

        {/* ⑤ Trending Now — tabs + 4×2 grid */}
        <SkTrendingSection />

        {/* ⑥ Koala Recommends — 5-col row */}
        <SkProductRow count={5} />

        {/* ⑦ New Arrivals — 5-col row */}
        <SkProductRow count={5} />

      </main>

      {/* ⑨ Footer */}
      <Footer />

      {/* Side Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
