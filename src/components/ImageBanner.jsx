"use strict";
"use client";

import React from "react";
import Link from "next/link";

const ImageBanner = ({
  desktopImg = "/linen-banner.png",
  mobileImg = "/linen-banner.png",
  title = "LINEN COTTON WEAVES",
  subtitle = "Elevate your summer wardrobe with premium coordinates and shirts.",
  buttonText = "SHOP THE COLLECTION",
  link = "/collections/all",
}) => {
  return (
    <section className="home-section hidden md:block" style={{ width: "100%" }}>
      {/* Container: full-width on mobile, max-width centered on desktop */}
      <div className="md:container-fluid">
        <div className="relative w-full overflow-hidden md:rounded-lg group aspect-[4/3] md:aspect-[21/9] bg-neutral-900">
          <Link href={link} className="block w-full h-full relative">
            <picture className="block w-full h-full">
              <source media="(max-width: 768px)" srcSet={mobileImg} />
              <img
                src={desktopImg}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </picture>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-7 left-5 right-5 md:bottom-16 md:left-16 md:right-auto md:max-w-xl text-white z-10">
              <span className="text-[10px] md:text-xs uppercase tracking-widest text-neutral-300 font-semibold block mb-2">
                New Season
              </span>
              <h2 className="text-[26px] md:text-5xl font-bold tracking-tight text-white leading-tight mb-2 md:mb-3">
                {title}
              </h2>
              <p className="text-[13px] md:text-lg text-neutral-200 font-light mb-5 md:mb-6 leading-relaxed" style={{ maxWidth: "280px" }}>
                {subtitle}
              </p>
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#fff", color: "#000", fontWeight: 600, fontSize: "11px", padding: "10px 20px", borderRadius: "999px", whiteSpace: "nowrap", boxShadow: "0 2px 12px rgba(0,0,0,0.2)", letterSpacing: "0.04em" }}
              >
                {buttonText}
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ImageBanner;
