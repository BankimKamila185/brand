'use strict';
'use client';

import React from 'react';
import Link from 'next/link';

interface ImageBannerProps {
  desktopImg?: string;
  mobileImg?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  link?: string;
}

const ImageBanner: React.FC<ImageBannerProps> = ({
  desktopImg = "https://___HOUSEOFOUTLIERS_DOM___/cdn/shop/files/Linen_Desktop.png?v=1776691749&width=2048",
  mobileImg = "https://___HOUSEOFOUTLIERS_DOM___/cdn/shop/files/Linen_Desktop.png?v=1776691749&width=750",
  title = "LINEN COTTON WEAVES",
  subtitle = "Elevate your summer wardrobe with premium coordinates and shirts.",
  buttonText = "SHOP THE COLLECTION",
  link = "/collections/all"
}) => {
  return (
    <section className="container-fluid my-16">
      <div className="relative w-full overflow-hidden rounded-lg group aspect-[21/9] max-md:aspect-[4/3] bg-neutral-900 shadow-md">
        <Link href={link} className="block w-full h-full relative">
          <picture className="block w-full h-full">
            <source media="(max-width: 768px)" srcSet={mobileImg} />
            <img 
              src={desktopImg} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
            />
          </picture>
          
          {/* Elegant Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-16" />
          
          {/* Content Overlay */}
          <div className="absolute bottom-8 left-8 md:bottom-16 md:left-16 max-w-xl text-white z-10 space-y-3 md:space-y-4">
            <span className="text-[10px] md:text-xs uppercase tracking-widest text-neutral-300 font-semibold block">New Season</span>
            <h2 className="text-2xl md:text-5xl font-bold tracking-tight text-white leading-tight">{title}</h2>
            <p className="text-xs md:text-lg text-neutral-200 font-light max-w-md">{subtitle}</p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 bg-white text-black font-semibold text-xs md:text-sm px-5 py-2.5 md:px-6 md:py-3 rounded-full hover:bg-neutral-200 transition-all shadow-lg">
                {buttonText}
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default ImageBanner;
