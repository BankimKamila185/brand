"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <>
      <style>{`
        /* ── Footer Base ─────────────────────────────────────────── */
        .hoo-footer {
          background: #0a0a0a;
          color: #fff;
          font-family: inherit;
          position: relative;
          overflow: hidden;
        }

        /* Subtle noise texture via pseudo-element */
        .hoo-footer::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }

        /* accent line removed */

        /* ── Wordmark strip ──────────────────────────────────────── */
        .hoo-footer-wordmark-strip {
          position: relative;
          z-index: 1;
          padding: 56px 40px 0;
          max-width: 1340px;
          margin: 0 auto;
          overflow: hidden;
          display: flex;
          justify-content: center;
        }

        .hoo-footer-logo {
          height: clamp(80px, 12vw, 160px);
          width: auto;
          display: block;
          filter: brightness(0) invert(1);
          opacity: 0.92;
          user-select: none;
        }

        .hoo-footer-wordmark-tagline {
          display: block;
          font-size: clamp(11px, 1.5vw, 15px);
          font-weight: 400;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          margin-top: 16px;
          font-style: italic;
        }

        /* divider removed */

        /* ── Main Grid ───────────────────────────────────────────── */
        .hoo-footer-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1.8fr;
          gap: 0;
          max-width: 1340px;
          margin: 0 auto;
          padding: 0 40px;
        }

        .hoo-footer-col {
          padding: 48px 0;
          padding-right: 40px;
        }
        .hoo-footer-col:last-child {
          padding-right: 0;
          padding-left: 40px;
        }
        .hoo-footer-col:first-child {
          padding-left: 0;
        }

        /* ── Col headings ────────────────────────────────────────── */
        .hoo-col-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hoo-col-label::after {
          content: "";
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
          max-width: 40px;
        }

        /* ── Store info column ───────────────────────────────────── */
        .hoo-store-tagline {
          font-size: 15px;
          line-height: 1.6;
          color: rgba(255,255,255,0.55);
          margin-bottom: 28px;
          font-weight: 300;
        }

        .hoo-contact-row {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 32px;
        }

        .hoo-contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          transition: color 0.2s;
        }
        .hoo-contact-item:hover {
          color: #fff;
        }
        .hoo-contact-item svg {
          flex-shrink: 0;
          opacity: 0.5;
        }
        .hoo-contact-item:hover svg {
          opacity: 1;
        }

        /* ── Socials ─────────────────────────────────────────────── */
        .hoo-socials {
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }

        .hoo-social-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.5);
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
          background: rgba(255,255,255,0.03);
        }
        .hoo-social-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.25s;
        }
        .hoo-social-btn:hover {
          border-color: rgba(255,255,255,0.3);
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255,255,255,0.07);
        }
        .hoo-social-btn:hover::before {
          background: rgba(255,255,255,0.05);
        }

        /* ── Nav link columns ────────────────────────────────────── */
        .hoo-nav-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .hoo-nav-links li a {
          display: inline-block;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          padding: 6px 0;
          position: relative;
          transition: color 0.2s;
          letter-spacing: 0.01em;
        }

        .hoo-nav-links li a::after {
          content: "";
          position: absolute;
          bottom: 4px;
          left: 0;
          width: 0;
          height: 1px;
          background: rgba(255,255,255,0.5);
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hoo-nav-links li a:hover {
          color: #fff;
        }
        .hoo-nav-links li a:hover::after {
          width: 100%;
        }

        /* ── Newsletter column ───────────────────────────────────── */
        .hoo-newsletter-heading {
          font-size: clamp(22px, 3vw, 30px);
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }
        .hoo-newsletter-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          margin-bottom: 28px;
          line-height: 1.6;
          font-weight: 300;
        }

        .hoo-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .hoo-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 0 16px;
          transition: border-color 0.2s, background 0.2s;
        }
        .hoo-input-wrap:focus-within {
          border-color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.07);
        }
        .hoo-input-wrap svg {
          color: rgba(255,255,255,0.25);
          flex-shrink: 0;
          margin-right: 10px;
        }
        .hoo-input-wrap input {
          background: transparent;
          border: none;
          outline: none;
          font-size: 13px;
          color: #fff;
          width: 100%;
          padding: 14px 0;
          font-family: inherit;
        }
        .hoo-input-wrap input::placeholder {
          color: rgba(255,255,255,0.25);
        }

        .hoo-subscribe-btn {
          padding: 14px 24px;
          border-radius: 10px;
          border: none;
          background: #fff;
          color: #0a0a0a;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
        }
        .hoo-subscribe-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.12) 100%);
          transition: opacity 0.25s;
          opacity: 0;
        }
        .hoo-subscribe-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 32px rgba(255,255,255,0.15);
        }
        .hoo-subscribe-btn:hover::before {
          opacity: 1;
        }
        .hoo-subscribe-btn:active {
          transform: translateY(0);
        }

        .hoo-subscribed-msg {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          padding: 8px 0;
        }
        .hoo-subscribed-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          flex-shrink: 0;
        }

        /* Store hours pill */
        .hoo-hours-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 999px;
          padding: 4px 12px;
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 24px;
          letter-spacing: 0.04em;
        }
        .hoo-hours-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #4ade80;
          animation: hoo-pulse 2s infinite;
        }
        @keyframes hoo-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* ── Bottom bar ──────────────────────────────────────────── */
        .hoo-footer-bottom {
          position: relative;
          z-index: 1;
          max-width: 1340px;
          margin: 0 auto;
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .hoo-footer-bottom p {
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.04em;
          margin: 0;
        }

        .hoo-footer-bottom-links {
          display: flex;
          gap: 20px;
        }
        .hoo-footer-bottom-links a {
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: color 0.2s;
        }
        .hoo-footer-bottom-links a:hover {
          color: rgba(255,255,255,0.6);
        }

        /* ── Responsive ──────────────────────────────────────────── */
        @media (max-width: 1024px) {
          .hoo-footer-grid {
            grid-template-columns: 1fr 1fr;
          }
          .hoo-footer-col:nth-child(4) {
            padding-left: 0;
          }
        }

        @media (max-width: 640px) {
          .hoo-footer-grid {
            grid-template-columns: 1fr;
            padding: 0 24px;
          }
          .hoo-footer-wordmark-strip {
            padding: 40px 24px 0;
          }
          .hoo-footer-col {
            padding: 32px 0;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .hoo-footer-bottom {
            padding: 20px 24px;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .hoo-footer-wordmark {
            font-size: clamp(40px, 14vw, 80px);
          }
        }
      `}</style>

      <footer className="hoo-footer">

        {/* Brand logo — right aligned */}
        <div className="hoo-footer-wordmark-strip">
          <Logo className="hoo-footer-logo" />
        </div>

        {/* Main grid */}
        <div className="hoo-footer-grid">

          {/* Col 1 — Store */}
          <div className="hoo-footer-col">
            <p className="hoo-col-label">Our Store</p>

            <div className="hoo-hours-pill">
              <span className="hoo-hours-dot" />
              Mon – Fri &nbsp;·&nbsp; 10 AM – 6 PM IST
            </div>

            <p className="hoo-store-tagline">
              Premium oversized streetwear crafted for those who define their own rules.
            </p>

            <div className="hoo-contact-row">
              <a href="tel:+917304406772" className="hoo-contact-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 12 19.79 19.79 0 0 1 1.06 3.38 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                +91 73044 06772
              </a>
              <a href="mailto:support@houseofoutliers.com" className="hoo-contact-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                support@houseofoutliers.com
              </a>
            </div>

            <div className="hoo-socials">
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hoo-social-btn" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              {/* WhatsApp */}
              <a href="https://wa.me/917304406772" target="_blank" rel="noopener noreferrer" className="hoo-social-btn" aria-label="WhatsApp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
              </a>
              {/* Twitter/X */}
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hoo-social-btn" aria-label="X (Twitter)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hoo-social-btn" aria-label="YouTube">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2 — Useful Links */}
          <div className="hoo-footer-col">
            <p className="hoo-col-label">Useful Links</p>
            <ul className="hoo-nav-links">
              <li><Link href="/policies/refund-policy">Return / Exchange</Link></li>
              <li><Link href="/policies/shipping-policy">Shipping Policy</Link></li>
              <li><Link href="#">Rewards Program</Link></li>
              <li><Link href="#">Track Order</Link></li>
              <li><Link href="/policies/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/policies/terms-of-service">Terms of Service</Link></li>
              <li><Link href="/pages/contact">Contact Us</Link></li>
              <li><Link href="#">Blog</Link></li>
            </ul>
          </div>

          {/* Col 3 — Trending */}
          <div className="hoo-footer-col">
            <p className="hoo-col-label">Trending</p>
            <ul className="hoo-nav-links">
              <li><Link href="/collections/cargo-trousers-for-men">Baggy Cargo Trousers</Link></li>
              <li><Link href="/collections/shirts">Shirts</Link></li>
              <li><Link href="/collections/co-ord-sets">Co-ord Sets</Link></li>
              <li><Link href="/collections/oversized-t-shirts">Oversized Tees</Link></li>
              <li><Link href="/collections/all">All Products</Link></li>
            </ul>
          </div>

          {/* Col 4 — Newsletter */}
          <div className="hoo-footer-col">
            <p className="hoo-col-label">Newsletter</p>
            <h3 className="hoo-newsletter-heading">
              Join the<br />Outliers Club
            </h3>
            <p className="hoo-newsletter-sub">
              Early drops, exclusive deals, and style edits. No spam, ever.
            </p>

            {subscribed ? (
              <div className="hoo-subscribed-msg">
                <span className="hoo-subscribed-dot" />
                You&apos;re in — welcome to the club!
              </div>
            ) : (
              <form className="hoo-form" onSubmit={handleSubscribe}>
                <div className="hoo-input-wrap">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="hoo-subscribe-btn">
                  Subscribe Now →
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="hoo-footer-bottom">
            <p>©2026 House of Outliers Fashion Private Limited</p>
            <div className="hoo-footer-bottom-links">
              <Link href="/policies/privacy-policy">Privacy</Link>
              <Link href="/policies/terms-of-service">Terms</Link>
              <a href="https://syscodes.in" target="_blank" rel="noopener noreferrer">Developed by Syscodes</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
