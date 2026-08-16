"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";

// ─── CONFIG ────────────────────────────────────────────────────────────────────
// Change this to your actual launch date/time (ISO 8601 with timezone).
// Once this date passes, the storefront renders normally.
const LAUNCH_DATE = "2026-08-19T06:00:00+05:30";

// Secret preview key: visit ?preview=outliers to bypass the countdown.
// Visit ?preview=exit to go back to the countdown view.
const PREVIEW_SECRET = "outliers";
const PREVIEW_COOKIE = "os_preview";

// ─── Helper ────────────────────────────────────────────────────────────────────
function getTimeLeft(target) {
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return null; // launch has passed

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

// ─── Digit Box ─────────────────────────────────────────────────────────────────
function DigitBox({ value, label }) {
  const display = String(value).padStart(2, "0");
  return (
    <div className="cd-digit-box">
      <span className="cd-digit-value" key={display}>
        {display}
      </span>
      <span className="cd-digit-label">{label}</span>
    </div>
  );
}

// ─── Separator ─────────────────────────────────────────────────────────────────
function Separator() {
  return <span className="cd-separator">:</span>;
}

// ─── CountdownGate ─────────────────────────────────────────────────────────────
export default function CountdownGate({ children }) {
  const target = useMemo(() => new Date(LAUNCH_DATE).getTime(), []);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(target));
  const [mounted, setMounted] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    setMounted(true);

    // ── Preview bypass ──────────────────────────────────────
    // Visit any page with ?preview=outliers to skip the gate.
    // Visit ?preview=exit to go back to the countdown view.
    const params = new URLSearchParams(window.location.search);
    const previewParam = params.get("preview");

    if (previewParam === PREVIEW_SECRET) {
      // Set a cookie so you don't need the param on every page
      document.cookie = `${PREVIEW_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
      setPreviewMode(true);
      // Clean the URL (remove ?preview=... from address bar)
      params.delete("preview");
      const cleanUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
      return;
    }

    if (previewParam === "exit") {
      // Clear the preview cookie
      document.cookie = `${PREVIEW_COOKIE}=; path=/; max-age=0`;
      setPreviewMode(false);
      params.delete("preview");
      const cleanUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    }

    // Check if preview cookie already exists
    if (document.cookie.split(";").some((c) => c.trim().startsWith(`${PREVIEW_COOKIE}=`))) {
      setPreviewMode(true);
      return;
    }

    // ── Countdown interval ──────────────────────────────────
    const id = setInterval(() => {
      const tl = getTimeLeft(target);
      if (!tl) {
        clearInterval(id);
        setTimeLeft(null);
      } else {
        setTimeLeft(tl);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  // Preview mode or post-launch → show the real storefront
  if ((timeLeft === null || previewMode) && mounted) {
    return <>{children}</>;
  }

  // Before mount or during countdown → show the gate
  return (
    <div className="countdown-gate">
      {/* Ambient background glow */}
      <div className="cd-ambient-glow" aria-hidden="true" />

      {/* Logo */}
      <div className="cd-logo-wrap">
        <Image
          src="/logo.svg"
          alt="The Outliers Studio"
          width={180}
          height={60}
          priority
          className="cd-logo"
        />
      </div>

      {/* Headline */}
      <h1 className="cd-headline">
        <span className="cd-headline-top">We&rsquo;re</span>
        <span className="cd-headline-big">Launching Soon</span>
      </h1>

      {/* Countdown */}
      <div className="cd-timer" aria-label="Countdown to launch">
        {mounted && timeLeft ? (
          <>
            <DigitBox value={timeLeft.days} label="Days" />
            <Separator />
            <DigitBox value={timeLeft.hours} label="Hours" />
            <Separator />
            <DigitBox value={timeLeft.minutes} label="Minutes" />
            <Separator />
            <DigitBox value={timeLeft.seconds} label="Seconds" />
          </>
        ) : (
          <>
            <DigitBox value={0} label="Days" />
            <Separator />
            <DigitBox value={0} label="Hours" />
            <Separator />
            <DigitBox value={0} label="Minutes" />
            <Separator />
            <DigitBox value={0} label="Seconds" />
          </>
        )}
      </div>

      {/* Tagline */}
      <p className="cd-tagline">
        Premium streetwear for those who refuse to blend in.
      </p>

      {/* Social */}
      <div className="cd-social">
        <a
          href="https://www.instagram.com/theoutliersstudio"
          target="_blank"
          rel="noopener noreferrer"
          className="cd-social-link"
          aria-label="Follow us on Instagram"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
          </svg>
          <span>@theoutliersstudio</span>
        </a>
      </div>

      {/* Footer line */}
      <p className="cd-footer-note">
        © {new Date().getFullYear()} The Outliers Studio. All rights reserved.
      </p>
    </div>
  );
}
