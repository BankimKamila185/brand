"use strict";
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const HERO_SLIDES = [
  {
    title: "",
    subtitle: "",
    link: "/collections/all",
    desktopImg: "/hero-light.jpg",
    mobileImg: "/hero-light.jpg",
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
