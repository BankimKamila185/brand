"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { AlertTriangle, RefreshCw, Home, ShoppingBag } from "lucide-react";

export default function StorefrontError({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service if desired
    console.error("Storefront Error Boundary caught an exception:", error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-neutral-900">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-16 md:py-24 relative overflow-hidden">
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />

        <div className="max-w-xl w-full text-center relative z-10 mx-auto px-4">
          
          {/* Icon Badge */}
          <div className="w-20 h-20 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto mb-6 border border-neutral-200 shadow-sm">
            <AlertTriangle className="w-9 h-9" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600 text-[11px] font-bold uppercase tracking-widest mb-4">
            Something went wrong
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 mb-3">
            Unable to load this page
          </h1>

          {/* Description */}
          <p className="text-sm md:text-base text-neutral-600 mb-8 max-w-md mx-auto leading-relaxed">
            We encountered an unexpected issue while loading this page. Please try refreshing or return to the main catalog.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-black text-white font-bold text-xs uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-white border border-neutral-300 text-neutral-900 font-bold text-xs uppercase tracking-widest hover:bg-neutral-50 hover:border-black transition-all active:scale-95"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </Link>

            <Link
              href="/collections/all"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-white border border-neutral-300 text-neutral-900 font-bold text-xs uppercase tracking-widest hover:bg-neutral-50 hover:border-black transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop All
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
