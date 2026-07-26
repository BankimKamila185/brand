"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { categoriesApi } from "@/lib/api";
import { ArrowRight, Layers } from "lucide-react";

const DEFAULT_CATEGORIES = [
  {
    id: "cat-1",
    name: "Cargo Trousers",
    slug: "cargo-trousers-for-men",
    description: "Baggy, tactical, and relaxed utility cargo trousers crafted for modern silhouettes.",
    imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cat-2",
    name: "Co-Ord Sets",
    slug: "co-ord-sets",
    description: "Effortlessly matched upper and lower sets for elevated, relaxed everyday style.",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cat-3",
    name: "Korean Pants",
    slug: "korean-pants",
    description: "Pleated, wide-leg, and tapered trousers inspired by contemporary East Asian streetwear.",
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cat-4",
    name: "Linen Shirts",
    slug: "linen-shirts",
    description: "Lightweight, breathable pure linen shirts designed for warm climate luxury.",
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cat-5",
    name: "Cuban Shirts",
    slug: "cuban-shirts",
    description: "Camp-collar boxy vacation shirts featuring distinct collar tailoring and rich textures.",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cat-6",
    name: "Crochet Shirts",
    slug: "crochet-shirts",
    description: "Artisanal open-knit and textured crochet shirts for a refined resort look.",
    imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cat-7",
    name: "Oversized T-Shirts",
    slug: "oversized-t-shirts",
    description: "Heavyweight cotton dropped-shoulder graphic and minimal oversized tees.",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cat-8",
    name: "Parachute Cargo Trousers",
    slug: "parachute-cargos",
    description: "Ultra-lightweight nylon parachute trousers with adjustable toggle hem details.",
    imageUrl: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?q=80&w=800&auto=format&fit=crop",
  },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoriesApi.list();
        if (res.success && res.data && res.data.length > 0) {
          setCategories(res.data);
        }
      } catch (_) {
        // Fallback to default categories
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow">
        {/* Hero Header */}
        <section className="bg-[#121212] text-white py-16 md:py-24 text-center px-4">
          <div className="max-w-4xl mx-auto">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#b9ff57] uppercase mb-3 block">
              Tevar Taxonomy
            </span>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
              All Categories
            </h1>
            <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Explore our curated garment taxonomy — designed for comfort, modern cut, and effortless streetwear versatility.
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="container-fluid py-12 md:py-20">
          {loading ? (
            <div className="text-center py-20">
              <div style={{ width: 36, height: 36, border: "3px solid #e0e0e0", borderTopColor: "#222", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
              <p className="text-neutral-500 text-sm">Loading categories...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id || cat.slug}
                  href={`/collections/${cat.slug}`}
                  className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="aspect-[4/5] relative w-full overflow-hidden bg-neutral-100">
                    <img
                      src={cat.imageUrl || cat.image_url || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800"}
                      alt={cat.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white flex flex-col justify-end">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#b9ff57] mb-1">
                        Category
                      </span>
                      <h3 className="text-xl font-black uppercase tracking-tight mb-2 group-hover:text-white transition-colors flex items-center justify-between">
                        {cat.name}
                        <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                      </h3>
                      {cat.description && (
                        <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed opacity-90">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
