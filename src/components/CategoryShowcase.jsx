"use strict";
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const CATEGORIES = [
  {
    id: "topwear",
    title: "TOPWEAR",
    link: "/collections/topwear",
    image: "/cat-topwear.jpg",
    alt: "Crafted Topwear Collection",
  },
  {
    id: "bottomwear",
    title: "BOTTOMWEAR",
    link: "/collections/bottomwear",
    image: "/cat-bottomwear.jpg",
    alt: "Refined Bottomwear Collection",
  },
  {
    id: "outerwear",
    title: "OUTWEAR",
    link: "/collections/outerwear",
    image: "/cat-outerwear.jpg",
    alt: "Elevated Outwear Layers",
  },
  {
    id: "fragrance",
    title: "FRAGRANCE",
    link: "/collections/fragrance",
    image: "/cat-fragrance.jpg",
    alt: "Signature Luxury Fragrance",
  },
];

const CategoryShowcase = () => {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <section className="w-full max-w-[1480px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-10 sm:py-14 md:py-20">
      {/* ── Section Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-sans font-normal tracking-[0.02em] uppercase text-[#0e0d0b] dark:text-white leading-tight">
          CRAFTED FOR THE MODERN WOMAN
        </h2>
        <p className="text-[11px] sm:text-xs tracking-[0.14em] uppercase text-[#4a4845] dark:text-[#9B9895] md:text-right leading-relaxed font-normal select-none">
          REFINED BASICS, ELEVATED TEXTURES, AND VERSATILE
          <br className="hidden sm:inline" /> LAYERS FOR A WARDROBE THAT NEVER GOES OUT OF STYLE.
        </p>
      </div>

      {/* ── 4 Category Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-7">
        {CATEGORIES.map((cat) => {
          const isHovered = hoveredId === cat.id;

          return (
            <div
              key={cat.id}
              onMouseEnter={() => setHoveredId(cat.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setHoveredId((prev) => (prev === cat.id ? null : cat.id))}
              className="group flex flex-col space-y-4 cursor-pointer"
            >
              {/* Image Card */}
              <Link
                href={cat.link}
                className="block relative w-full aspect-[3/4] overflow-hidden rounded-[26px] sm:rounded-[32px] bg-[#f0eee9] shadow-sm transition-all duration-500 group-hover:shadow-xl"
              >
                <img
                  src={cat.image}
                  alt={cat.alt}
                  className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
              </Link>

              {/* Action Buttons Below Image */}
              <div className="flex items-center gap-2 pt-1 w-full">
                {/* ── Left Action Button (Expands from Circle to Pill on Hover) ── */}
                <Link
                  href="/collections"
                  className={`relative flex items-center h-10 sm:h-11 rounded-full bg-[#f50514] hover:bg-[#d6000e] text-white shadow-sm transition-all duration-300 ease-out overflow-hidden shrink-0 group-hover:flex-1 group-hover:px-3 sm:group-hover:px-4 group-hover:justify-between ${
                    isHovered
                      ? "flex-1 px-3 sm:px-4 justify-between"
                      : "w-10 sm:w-11 px-0 justify-center"
                  }`}
                  aria-label={`View all ${cat.title}`}
                >
                  {/* "VIEW ALL" text */}
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold tracking-wider uppercase whitespace-nowrap transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 ${
                      isHovered
                        ? "opacity-100 translate-x-0 inline-block"
                        : "opacity-0 -translate-x-3 hidden group-hover:inline-block"
                    }`}
                  >
                    VIEW ALL
                  </span>

                  {/* Icon Container */}
                  <span
                    className={`flex items-center justify-center transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:rounded-full group-hover:bg-white group-hover:text-[#f50514] group-hover:shadow-sm group-hover:ml-1.5 group-hover:shrink-0 ${
                      isHovered
                        ? "w-6 h-6 rounded-full bg-white text-[#f50514] shadow-sm ml-1.5 shrink-0"
                        : "w-full h-full text-white"
                    }`}
                  >
                    <ArrowRight
                      className={`w-3.5 h-3.5 stroke-[2.5] transition-all duration-200 ${
                        isHovered ? "block" : "hidden group-hover:block"
                      }`}
                    />
                    <ArrowUpRight
                      className={`w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[2.4] transition-all duration-200 ${
                        isHovered ? "hidden" : "block group-hover:hidden"
                      }`}
                    />
                  </span>
                </Link>

                {/* ── Right Category Name Pill Button ── */}
                <Link
                  href={cat.link}
                  className="flex-1 min-w-0 flex items-center justify-center h-10 sm:h-11 px-3 sm:px-4 bg-white text-[#111111] border border-[#d5d2cb] group-hover:border-[#111111] rounded-full text-[10px] sm:text-[11px] md:text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-sm"
                >
                  <span className="truncate">{cat.title}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryShowcase;


