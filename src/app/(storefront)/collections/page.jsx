"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { collectionsApi } from "@/lib/api";
import { ArrowUpRight, Compass, Sparkles } from "lucide-react";

const FEATURED_COLLECTIONS = [
  {
    id: "col-1",
    name: "All Products",
    handle: "all",
    description: "Browse the complete catalogue — from cargo trousers to oversized tees from The Outliers Studio.",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
    highlight: "Complete Archive",
  },
  {
    id: "col-2",
    name: "Bestsellers",
    handle: "bestsellers",
    description: "Our most requested fits, high-demand restocks, and fan-favourite staples.",
    imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1200&auto=format&fit=crop",
    highlight: "Popular Demand",
  },
  {
    id: "col-3",
    name: "Retro Clothing",
    handle: "retro-clothing",
    description: "Vintage-inspired cuts, retro washes, and nostalgic silhouette detailing.",
    imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop",
    highlight: "Vintage Aesthetic",
  },
  {
    id: "col-4",
    name: "Outliers K-aracter",
    handle: "outliers-k-aracter",
    description: "Statement pieces crafted for bold individuality and distinct streetwear expression.",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
    highlight: "Signature Line",
  },
  {
    id: "col-5",
    name: "Outliers Recommends",
    handle: "outliers-recommends",
    description: "Hand-picked editorial recommendations chosen by our studio design team.",
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop",
    highlight: "Editor's Choice",
  },
  {
    id: "col-6",
    name: "New Arrivals",
    handle: "whats-new",
    description: "The latest seasonal drop fresh off the production floor.",
    imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop",
    highlight: "Fresh Drop",
  },
];

export default function MasterCollectionsPage() {
  const [collections, setCollections] = useState(FEATURED_COLLECTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const res = await collectionsApi.list();
        if (res.success && res.data && res.data.length > 0) {
          const apiCols = res.data.map((c) => ({
            id: c.id,
            name: c.name,
            handle: c.handle,
            description: c.description || "Curated seasonal collection.",
            imageUrl: c.imageUrl || c.image_url || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200",
            highlight: "Curated Line",
          }));
          setCollections(apiCols);
        }
      } catch (_) {
        // Keep default collections
      } finally {
        setLoading(false);
      }
    };
    loadCollections();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow">
        {/* Header Hero */}
        <section className="bg-black text-white py-16 md:py-24 text-center px-4 relative overflow-hidden">
          <div className="max-w-4xl mx-auto relative z-10">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#b9ff57] uppercase mb-3 inline-flex items-center gap-1.5">
              <Sparkles size={13} /> Curated Drops & Lookbooks
            </span>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
              All Collections
            </h1>
            <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Explore themed drops, signature capsule releases, and curated styling edits from The Outliers Studio.
            </p>
          </div>
        </section>

        {/* Collections Listing Grid */}
        <section className="container-fluid py-12 md:py-20">
          {loading ? (
            <div className="text-center py-20">
              <div style={{ width: 36, height: 36, border: "3px solid #e0e0e0", borderTopColor: "#222", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
              <p className="text-neutral-500 text-sm">Loading collections...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collections.map((col) => (
                <Link
                  key={col.id || col.handle}
                  href={`/collections/${col.handle}`}
                  className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="aspect-[16/10] relative w-full overflow-hidden bg-neutral-100">
                    <img
                      src={col.imageUrl}
                      alt={col.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    
                    {col.highlight && (
                      <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/10">
                        {col.highlight}
                      </span>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-black uppercase tracking-tight group-hover:text-[#b9ff57] transition-colors">
                          {col.name}
                        </h2>
                        <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#b9ff57] group-hover:text-black transition-all">
                          <ArrowUpRight size={18} />
                        </div>
                      </div>
                      <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                        {col.description}
                      </p>
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
