'use client';

import React, { useState } from 'react';
import AnnouncementBar from '../../../components/AnnouncementBar';
import Header from '../../../components/Header';
import CartDrawer from '../../../components/CartDrawer';

// ─── Skeleton primitives ───────────────────────────────────────────────────
const SkBox = ({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`sk-box ${className}`} style={style} />
);
const SkLine = ({ w = '100%', h = 14 }: { w?: string | number; h?: number }) => (
  <div className="sk-box sk-line" style={{ width: w, height: h }} />
);

// ─── Breadcrumb row ────────────────────────────────────────────────────────
function SkBreadcrumb() {
  return (
    <div className="container-fluid" style={{ paddingTop: 16, paddingBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <SkLine w={40} h={11} />
        <SkLine w={6} h={11} />
        <SkLine w={90} h={11} />
        <SkLine w={6} h={11} />
        <SkLine w={200} h={11} />
      </div>
    </div>
  );
}

// ─── Product Gallery (left column) ────────────────────────────────────────
function SkGallery() {
  return (
    <div className="pdp-sk-gallery">
      {/* Vertical thumbnail strip */}
      <div className="pdp-sk-thumbs">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <SkBox key={i} className="pdp-sk-thumb" />
        ))}
      </div>

      {/* Main large image */}
      <div className="pdp-sk-main-img">
        {/* Discount badge */}
        <SkBox style={{ position: 'absolute', top: 16, left: 16, width: 72, height: 26, borderRadius: 40, zIndex: 2 }} />
        {/* Full image */}
        <SkBox style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 0 }} />
        {/* Prev / Next arrows */}
        <SkBox style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: '50%' }} />
        <SkBox style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: '50%' }} />
      </div>

      {/* Mobile thumbnail scroll — hidden on desktop */}
      <div className="pdp-sk-mobile-thumbs">
        {[0, 1, 2, 3, 4].map((i) => (
          <SkBox key={i} className="pdp-sk-mobile-thumb" />
        ))}
      </div>
    </div>
  );
}

// ─── Product Info (right column) ──────────────────────────────────────────
function SkInfoPanel() {
  const [descOpen, setDescOpen] = useState(true);
  const [deliveryOpen, setDeliveryOpen] = useState(false);

  return (
    <div className="pdp-sk-info">

      {/* Brand / category tag */}
      <SkLine w={110} h={12} />

      {/* Product title — 2 lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
        <SkLine w="90%" h={28} />
        <SkLine w="70%" h={28} />
      </div>

      {/* Rating row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <SkBox style={{ width: 96, height: 16, borderRadius: 4 }} />
        <SkLine w={80} h={12} />
      </div>

      {/* Price row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <SkBox style={{ width: 90, height: 32, borderRadius: 4 }} />
        <SkBox style={{ width: 80, height: 24, borderRadius: 4 }} />
        <SkBox style={{ width: 72, height: 26, borderRadius: 40 }} />
      </div>

      {/* Tax note */}
      <SkLine w="65%" h={11} />

      {/* Divider */}
      <div className="pdp-sk-divider" />

      {/* Color / variant heading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <SkLine w={80} h={12} />
        <SkBox style={{ width: 18, height: 18, borderRadius: '50%' }} />
      </div>

      {/* Divider */}
      <div className="pdp-sk-divider" />

      {/* Size row: label + size guide link */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SkLine w={90} h={13} />
          <SkBox style={{ width: 28, height: 28, borderRadius: '50%', background: '#e8e8e8' }} />
        </div>
        <SkLine w={70} h={11} />
      </div>

      {/* Size chips — waist sizes 28–38 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[52, 52, 52, 52, 52, 52].map((w, i) => (
          <SkBox key={i} style={{ width: w, height: 50, borderRadius: 5 }} />
        ))}
      </div>

      {/* Divider */}
      <div className="pdp-sk-divider" />

      {/* Add to Cart + Wishlist buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <SkBox style={{ flex: 1, height: 56, borderRadius: 5 }} />
        <SkBox style={{ width: 56, height: 56, borderRadius: 5, flexShrink: 0 }} />
      </div>

      {/* Buy Now ghost */}
      <SkBox style={{ width: '100%', height: 52, borderRadius: 5 }} />

      {/* Trust badges 2×2 */}
      <div className="pdp-sk-badges">
        {['🚚 Free Shipping', '↩ Easy Returns', '🔒 Secure Pay', '✓ Genuine'].map((_, i) => (
          <div key={i} className="pdp-sk-badge">
            <SkBox style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0 }} />
            <SkLine w="70%" h={11} />
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="pdp-sk-divider" />

      {/* Description accordion */}
      <div className="pdp-sk-accordion">
        <button
          className="pdp-sk-accordion-header"
          onClick={() => setDescOpen(!descOpen)}
        >
          <SkLine w={160} h={14} />
          <SkBox style={{ width: 18, height: 18, borderRadius: 3 }} />
        </button>
        {descOpen && (
          <div className="pdp-sk-accordion-body">
            {[100, 90, 95, 75, 80, 65].map((w, i) => (
              <SkLine key={i} w={`${w}%`} h={12} />
            ))}
          </div>
        )}
      </div>

      {/* Delivery info accordion */}
      <div className="pdp-sk-accordion">
        <button
          className="pdp-sk-accordion-header"
          onClick={() => setDeliveryOpen(!deliveryOpen)}
        >
          <SkLine w={120} h={14} />
          <SkBox style={{ width: 18, height: 18, borderRadius: 3 }} />
        </button>
        {deliveryOpen && (
          <div className="pdp-sk-accordion-body">
            {[100, 70, 85].map((w, i) => (
              <SkLine key={i} w={`${w}%`} h={12} />
            ))}
          </div>
        )}
      </div>

      {/* Tags row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 8 }}>
        {[60, 80, 70, 55, 90, 65].map((w, i) => (
          <SkBox key={i} style={{ width: w, height: 26, borderRadius: 40 }} />
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton product card (for "You May Also Like") ──────────────────────
function SkProductCard() {
  return (
    <div className="product-card">
      <div className="product-card-media" style={{ background: 'transparent' }}>
        <SkBox style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 0 }} />
      </div>
      <div className="product-card-info">
        <SkLine w="48%" h={11} />
        <SkLine w="88%" h={14} />
        <SkLine w="38%" h={14} />
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────
function SkFooter() {
  return (
    <footer className="main-footer">
      <div className="container-fluid">
        <div className="footer-grid">
          <div className="sk-footer-inner">
            <SkBox style={{ width: 120, height: 40, borderRadius: 5 }} />
            {[100, 90, 80, 65].map((w, i) => <SkLine key={i} w={`${w}%`} h={11} />)}
            <div className="sk-social-row">
              {[0, 1, 2].map((i) => <SkBox key={i} style={{ width: 40, height: 40, borderRadius: '50%' }} />)}
            </div>
          </div>
          <div className="sk-footer-inner">
            <SkLine w={110} h={14} />
            {[80, 90, 70, 100].map((w, i) => <SkLine key={i} w={w} h={11} />)}
          </div>
          <div className="sk-footer-inner">
            <SkLine w={80} h={14} />
            {[100, 85, 90, 110].map((w, i) => <SkLine key={i} w={w} h={11} />)}
          </div>
          <div className="sk-footer-inner">
            <SkLine w={130} h={14} />
            {[100, 85, 70].map((w, i) => <SkLine key={i} w={`${w}%`} h={11} />)}
            <div className="sk-newsletter-row">
              <SkBox style={{ flex: 1, height: 44, borderRadius: 4 }} />
              <SkBox style={{ width: 70, height: 44, borderRadius: 4, flexShrink: 0 }} />
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <SkLine w={280} h={12} />
          <div style={{ display: 'flex', gap: 10 }}>
            {[0, 1, 2, 3].map((i) => <SkBox key={i} style={{ width: 40, height: 24, borderRadius: 4 }} />)}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow">
        {/* Breadcrumb */}
        <SkBreadcrumb />

        {/* Main product area */}
        <section className="container-fluid" style={{ paddingBottom: 80 }}>
          <div className="pdp-sk-layout">
            <SkGallery />
            <SkInfoPanel />
          </div>
        </section>

        {/* You May Also Like */}
        <section className="container-fluid sk-section" style={{ marginTop: 64, marginBottom: 64 }}>
          <div className="sk-section-title-wrap">
            <SkBox style={{ width: 280, height: 28, borderRadius: 5 }} />
          </div>
          <div className="product-grid">
            {[0, 1, 2, 3].map((i) => <SkProductCard key={i} />)}
          </div>
        </section>

        {/* Reviews section */}
        <section className="container-fluid sk-section" style={{ marginTop: 0, marginBottom: 80 }}>
          <div className="sk-section-title-wrap">
            <SkBox style={{ width: 200, height: 26, borderRadius: 5 }} />
          </div>
          {/* Average rating summary bar */}
          <div className="pdp-sk-reviews-summary">
            <div className="pdp-sk-reviews-avg">
              <SkBox style={{ width: 80, height: 64, borderRadius: 6 }} />
              <SkBox style={{ width: 140, height: 18, borderRadius: 4 }} />
              <SkLine w={100} h={12} />
            </div>
            <div className="pdp-sk-reviews-bars">
              {[5, 4, 3, 2, 1].map((n) => (
                <div key={n} className="pdp-sk-review-bar-row">
                  <SkLine w={30} h={12} />
                  <div className="pdp-sk-bar-track">
                    <SkBox style={{ width: `${n * 18}%`, height: '100%', borderRadius: 4 }} />
                  </div>
                  <SkLine w={24} h={12} />
                </div>
              ))}
            </div>
          </div>

          {/* Individual review cards */}
          <div className="pdp-sk-review-cards">
            {[0, 1, 2].map((i) => (
              <div key={i} className="pdp-sk-review-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <SkBox style={{ width: 44, height: 44, borderRadius: '50%' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <SkLine w={100} h={13} />
                    <SkLine w={80}  h={11} />
                  </div>
                  <SkBox style={{ width: 80, height: 14, borderRadius: 4, marginLeft: 'auto' }} />
                </div>
                <SkLine w="100%" h={12} />
                <SkLine w="92%"  h={12} />
                <SkLine w="75%"  h={12} />
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <SkBox style={{ width: 60, height: 60, borderRadius: 4 }} />
                  <SkBox style={{ width: 60, height: 60, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SkFooter />

      {/* Side Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
