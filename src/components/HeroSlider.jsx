"use strict";
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const HERO_SLIDES = [
  {
    id: "outliers",
    type: "editorial",
    title: "BUILT DIFFERENT.\nWORN BY FEW.",
    subtitle: "ROOTED IN STRENGTH • DESIGNED TO STAND OUT\nPREMIUM STREETWEAR CRAFTED FOR OUTLIERS",
    ctaText: "SHOP COLLECTION",
    link: "/collections/all",
    desktopImg: "/outliers-hero-banner.jpg",
    mobileImg: "/outliers-hero-banner-mobile.jpg",
    bgColour: "#0a0a0a",
  },
  {
    id: "oni-immortal",
    type: "editorial",
    title: "BUILT DIFFERENT.\nMADE TO OUTLIVE.",
    subtitle: "STREETWEAR FOR THE FEW\nIMMORTAL • GRIND • RISE • FALL",
    ctaText: "EXPLORE DROP",
    link: "/collections/all",
    desktopImg: "/oni-immortal-hero-banner.png",
    mobileImg: "/oni-immortal-hero-banner-mobile.png",
    bgColour: "#0d0d0d",
  },
  {
    id: "tendencias",
    type: "editorial",
    title: "TENDENCIAS —\nOUR T-SHIRTS",
    subtitle: "CUTE DESIGNS • PREMIUM COMFORT\nMADE FOR YOU",
    ctaText: "VIEW COLLECTION",
    link: "/collections/all",
    desktopImg: "/tendencias-hero-banner.jpg",
    mobileImg: "/tendencias-hero-banner-mobile.png",
    bgColour: "#1a1512",
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (HERO_SLIDES.length < 2) return undefined;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section
      className="luxe-hero-section"
      style={{
        width: "100%",
        maxWidth: "1480px",
        marginLeft: "auto",
        marginRight: "auto",
        paddingTop: "24px",
        paddingBottom: "28px",
        paddingLeft: "clamp(18px, 4.5vw, 52px)",
        paddingRight: "clamp(18px, 4.5vw, 52px)",
        boxSizing: "border-box",
      }}
    >
      <div
        className="luxe-hero-card"
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "28px",
          backgroundColor: "#0a0a0a",
          boxShadow: "0 16px 40px -12px rgba(0, 0, 0, 0.45)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {HERO_SLIDES.map((s, idx) => {
          const isActive = idx === currentSlide;

          return (
            <div
              key={s.id}
              className={`luxe-hero-slide transition-opacity duration-700 ease-in-out ${isActive ? "opacity-100 block" : "opacity-0 hidden"}`}
              style={{ display: isActive ? "block" : "none", backgroundColor: s.bgColour || "#0a0a0a" }}
            >
              <Link href={s.link} className="block w-full h-full relative aspect-[9/16] md:aspect-[16/9]">
                <picture className="block w-full h-full">
                  <source media="(max-width: 768px)" srcSet={s.mobileImg} />
                  <img
                    src={s.desktopImg}
                    alt={s.title.replace("\n", " ") || "The Outliers Studio Brand Banner"}
                    className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out hover:scale-[1.01]"
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                </picture>
              </Link>
            </div>
          );
        })}

        {/* Minimalist Pagination Dots */}
        {HERO_SLIDES.length > 1 && (
          <div className="absolute bottom-4 right-6 sm:bottom-6 sm:right-8 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide
                    ? "w-7 bg-white shadow-sm"
                    : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSlider;

