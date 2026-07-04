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
    title: "GURKHA TROUSERS",
    subtitle: "Premium double pleated gurkha trousers in relaxed fits",
    link: "/collections/gurkhatrousers",
    desktopImg: "https://houseofkoala.com/cdn/shop/files/Gurkha_new_banner_Desktop.png?v=1775648537&width=2048",
    mobileImg: "https://houseofkoala.com/cdn/shop/files/Gurkha_new_banner_600_x_480_px.png?v=1775648537&width=750"
  },
  {
    title: "LINEN COTTON WEAVES",
    subtitle: "Stay airy with our premium linen coordinate sets and shirts",
    link: "/collections/linen",
    desktopImg: "https://houseofkoala.com/cdn/shop/files/Linen_Desktop.png?v=1776691749&width=2048",
    mobileImg: "https://houseofkoala.com/cdn/shop/files/Linen_Desktop.png?v=1776691749&width=750" // Fallback to resized desktop
  },
  {
    title: "UP TO 80% OFF",
    subtitle: "Season clearance sale is live. Get premium streetwear for less",
    link: "/collections/saletee",
    desktopImg: "https://houseofkoala.com/cdn/shop/files/Upto_80_off_-_June_-_Desktop_1.png?v=1781530633&width=2048",
    mobileImg: "https://houseofkoala.com/cdn/shop/files/Upto_80_off_-_June_-_Mobile_3.png?v=1781530633&width=750"
  },
  {
    title: "STREETWEAR UNDER 599",
    subtitle: "Top-selling graphic tees and coordinates at budget pricing",
    link: "/collections/under599",
    desktopImg: "https://houseofkoala.com/cdn/shop/files/under_599_Desktop.png?v=1779902849&width=2048",
    mobileImg: "https://houseofkoala.com/cdn/shop/files/ALL_UNDER_599_Mobile.png?v=1779902849&width=750"
  }
];

const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto transition every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNext = () => {
    setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <div className="hero-slider">
      {HERO_SLIDES.map((slide, idx) => (
        <div 
          key={idx} 
          className={`hero-slide ${idx === currentSlide ? 'active' : ''}`}
        >
          {/* Responsive Banners */}
          <picture>
            <source media="(max-width: 768px)" srcSet={slide.mobileImg} />
            <img 
              src={slide.desktopImg} 
              alt={slide.title} 
              className="hero-slide-img" 
            />
          </picture>
          <div className="hero-slide-overlay">
            <div className="hero-slide-content">
              <h2 className="hero-title">{slide.title}</h2>
              <p className="hero-subtitle">{slide.subtitle}</p>
              <Link href={slide.link} className="hero-btn">
                Shop Collection
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Controls */}
      <div className="slider-controls">
        <button className="slider-arrow" onClick={handlePrev} aria-label="Previous slide">
          ‹
        </button>
        <button className="slider-arrow" onClick={handleNext} aria-label="Next slide">
          ›
        </button>
      </div>
    </div>
  );
};

export default HeroSlider;
