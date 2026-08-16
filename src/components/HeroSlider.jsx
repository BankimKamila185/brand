"use strict";
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const HERO_SLIDES = [
  {
    title: "BUILT DIFFERENT. WORN BY FEW.",
    subtitle: "Rooted in Strength. Designed to Stand Out.",
    link: "/collections/all",
    desktopImg: "/outliers-hero-banner.jpg",
    mobileImg: "/outliers-hero-banner-mobile.jpg",
  },
  {
    title: "TENDENCIAS — OUR T-SHIRTS",
    subtitle: "Cute designs. Premium comfort. Made for you.",
    link: "/collections/all",
    desktopImg: "/tendencias-hero-banner.jpg",
    mobileImg: "/tendencias-hero-banner-mobile.png",
  },
  {
    title: "THE OUTLIERS STUDIO",
    subtitle: "Premium Streetwear & Oversized Apparel",
    link: "/collections/all",
    desktopImg: "/hero-light.jpg",
    mobileImg: "/outliers-hero-banner-mobile.jpg",
  },
  {
    title: "LIMITED EDITION DROPS",
    subtitle: "For Those Who Refuse to Blend In",
    link: "/collections/all",
    desktopImg: "/hero-dark.png",
    mobileImg: "/hero-dark.png",
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (HERO_SLIDES.length < 2) return undefined;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-slider">
      {HERO_SLIDES.map((slide, idx) => (
        <div
          key={idx}
          className={`hero-slide ${idx === currentSlide ? "active" : ""}`}
        >
          <Link href={slide.link} className="block w-full h-full relative">
            <picture className="block w-full h-full">
              <source media="(max-width: 768px)" srcSet={slide.mobileImg} />
              <img
                src={slide.desktopImg}
                alt={slide.title || "House of Outliers Brand Banner"}
                className="hero-slide-img"
              />
            </picture>
          </Link>
        </div>
      ))}

      {/* Pagination Dots with Progress Bar Animation */}
      <div className="slider-dots">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            className={`slider-dot-btn ${idx === currentSlide ? "active" : ""}`}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          >
            <span className="dot-progress-track">
              <span className="dot-progress-bar" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
