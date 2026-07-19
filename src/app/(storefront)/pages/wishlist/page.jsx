"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { productsApi } from "@/lib/api";

function normalizeProduct(p) {
  if (!p) return null;
  const variants = (p.variants || []).map((v) => ({
    ...v,
    id: v.id,
    title: v.title || v.option1 || "Default",
    option1: v.option1,
    option2: v.option2,
    price: String(v.price || "0"),
    compare_at_price: v.comparePrice ? String(v.comparePrice) : null,
    comparePrice: v.comparePrice ? String(v.comparePrice) : null,
    inventory: v.inventory,
  }));

  const images = (p.images || []).map((img) => ({
    ...img,
    src: img.src || img.url || img.imageSrc || "",
  }));

  return {
    ...p,
    id: p.id,
    title: p.title,
    handle: p.handle,
    product_type: p.productType || p.product_type || "",
    body_html: p.description || p.body_html || "",
    tags: p.tags || [],
    vendor: p.vendor || "",
    variants: variants.length > 0 ? variants : [{ id: "default", title: "Default", price: "0", compare_at_price: null }],
    images: images,
    options: p.options || [{ name: "Size", values: variants.map((v) => v.option1).filter(Boolean) }],
  };
}

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productsApi.list({ limit: "100" });
        if (res.success && res.data) {
          const raw = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.products)
            ? res.data.products
            : [];
          setDbProducts(raw.map(normalizeProduct));
        }
      } catch (err) {
        console.error("Failed to fetch products for wishlist:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const wishlistProducts = dbProducts.filter((p) => wishlist.includes(p.id));

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Header />
      <main className="flex-grow">
        {/* Hero */}
        <div className="collection-hero">
          <h1 className="collection-hero-title">My Wishlist</h1>
          <p className="collection-hero-count">
            {loading ? "..." : wishlistProducts.length} Saved Items
          </p>
        </div>

        <div className="container-fluid py-12">
          <nav className="text-sm text-gray-500 flex gap-2 mb-8">
            <Link href="/" className="hover:text-black">
              Home
            </Link>
            <span>/</span>
            <span className="text-black font-semibold">Wishlist</span>
          </nav>

          {loading ? (
            <div className="text-center py-24">
              <div style={{ width: 36, height: 36, border: "3px solid #e0e0e0", borderTopColor: "#222", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
              <p className="text-gray-500">Loading wishlist items...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : wishlistProducts.length === 0 ? (
            <div className="text-center py-24">
              <span className="text-8xl block mb-6">♡</span>
              <h2 className="text-2xl font-black uppercase mb-3">
                Your wishlist is empty
              </h2>
              <p className="text-gray-500 mb-8">
                Save your favourite items while you browse our collections.
              </p>
              <Link
                href="/collections/all"
                className="bg-black text-white px-10 py-4 inline-block font-bold uppercase tracking-widest text-sm rounded"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {wishlistProducts.map((product) => (
                  <div key={product.id} className="relative">
                    <ProductCard product={product} />
                    <button
                      className="absolute top-3 right-3 z-20 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow text-red-500 text-lg"
                      onClick={() => toggleWishlist(product.id)}
                      title="Remove from wishlist"
                    >
                      ♥
                    </button>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <button
                  className="bg-black text-white px-10 py-4 font-bold uppercase tracking-widest text-sm rounded"
                  onClick={() =>
                    wishlistProducts.forEach((p) =>
                      addToCart(p, p.options[0]?.values[0] || "M")
                    )
                  }
                >
                  Add All to Cart
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
