"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { Search, Home, ShoppingBag, ArrowRight, Compass, Heart } from "lucide-react";

export default function StorefrontNotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/collections/all?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const POPULAR_LINKS = [
    { title: "Bestsellers", desc: "Top trending apparel", link: "/collections/bestsellers", icon: ShoppingBag },
    { title: "Cargo Trousers", desc: "Baggy & tactical pants", link: "/collections/cargo-trousers-for-men", icon: Compass },
    { title: "Co-Ord Sets", desc: "Matching luxury outfits", link: "/collections/co-ord-sets", icon: ArrowRight },
    { title: "Saved Wishlist", desc: "View your saved items", link: "/pages/wishlist", icon: Heart },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-neutral-900">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-16 md:py-24 relative overflow-hidden">
        {/* Decorative background grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />

        <div className="max-w-3xl w-full text-center relative z-10 mx-auto px-4">
          
          {/* 404 Giant Badge */}
          <div className="inline-flex items-center justify-center mb-6">
            <span className="text-8xl md:text-9xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-500 select-none">
              404
            </span>
          </div>

          {/* Subtitle Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600 text-[11px] font-bold uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Page Not Found
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-neutral-900 mb-4 leading-tight">
            Looks like you&apos;ve stepped out of bounds.
          </h1>

          {/* Subtext */}
          <p className="text-base md:text-lg text-neutral-600 max-w-xl mx-auto mb-8 font-normal leading-relaxed">
            The page you are looking for might have been moved, renamed, or no longer exists in our catalog.
          </p>

          {/* Inline Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="max-w-md mx-auto mb-10 relative flex items-center shadow-sm rounded-full overflow-hidden border border-neutral-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all bg-white"
          >
            <input
              type="text"
              placeholder="Search products, styles, collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-5 pr-12 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 bg-transparent outline-none"
            />
            <button
              type="submit"
              className="absolute right-2 p-2 rounded-full bg-black text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-black text-white font-bold text-xs uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-md active:scale-95"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>

            <Link
              href="/collections/all"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-white border border-neutral-300 text-neutral-900 font-bold text-xs uppercase tracking-widest hover:bg-neutral-50 hover:border-black transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop All Products
            </Link>
          </div>

          {/* Popular Categories Grid */}
          <div className="border-t border-neutral-200 pt-10 text-left">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-6 text-center">
              Or Explore Popular Destinations
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {POPULAR_LINKS.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <Link
                    key={idx}
                    href={item.link}
                    className="group p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-white hover:border-black hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 group-hover:bg-black group-hover:text-white flex items-center justify-center text-neutral-700 transition-colors mb-3">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-neutral-900 group-hover:text-black mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-neutral-500">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
