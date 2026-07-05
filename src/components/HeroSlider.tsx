'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface SlideData {
  title: string;
  subtitle: string;
  link: string;
  desktopImg: string;
  mobileImg: string;
}

const HERO_SLIDES: SlideData[] = [
  {
    title: "",
    subtitle: "",
    link: "/collections/all",
    desktopImg: "/hero-light.jpg",
    mobileImg: "/hero-light.jpg"
  },
  {
    title: "",
    subtitle: "",
    link: "/collections/all",
    desktopImg: "/hero-dark.png",
    mobileImg: "/hero-dark.png"
  },
  {
    title: "GURKHA TROUSERS",
    subtitle: "Premium double pleated gurkha trousers in relaxed fits",
    link: "/collections/all",
    desktopImg: "https://houseofkoala.com/cdn/shop/files/Gurkha_new_banner_Desktop.png?v=1775648537&width=2048",
    mobileImg: "https://houseofkoala.com/cdn/shop/files/Gurkha_new_banner_600_x_480_px.png?v=1775648537&width=750"
  },
  {
    title: "LINEN COTTON WEAVES",
    subtitle: "Stay airy with our premium linen coordinate sets and shirts",
    link: "/collections/all",
    desktopImg: "https://houseofkoala.com/cdn/shop/files/Linen_Desktop.png?v=1776691749&width=2048",
    mobileImg: "https://houseofkoala.com/cdn/shop/files/Linen_Desktop.png?v=1776691749&width=750"
  }
];

const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto transition every 6 seconds (resets when currentSlide changes)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
    <div className="hero-slider">
      {HERO_SLIDES.map((slide, idx) => (
        <div 
          key={idx} 
          className={`hero-slide ${idx === currentSlide ? 'active' : ''}`}
        >
          <Link href={slide.link} className="block w-full h-full relative">
            <picture className="block w-full h-full">
              <source media="(max-width: 768px)" srcSet={slide.mobileImg} />
              <img 
                src={slide.desktopImg} 
                alt={slide.title || "House of Koala Brand Banner"} 
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
            className={`slider-dot-btn ${idx === currentSlide ? 'active' : ''}`}
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
