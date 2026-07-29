"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { Heart } from "lucide-react";
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

        {/* ── Page Title + Breadcrumb ── */}
        <div className="container-fluid" style={{ paddingTop: "64px", paddingBottom: "32px" }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "34px", fontWeight: 700, color: "#111", marginBottom: "12px", letterSpacing: "-0.02em" }}>
              Wishlist
            </h1>
            <nav style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "13px", color: "#999" }} aria-label="Breadcrumb">
              <Link href="/" style={{ color: "#999", textDecoration: "none" }} className="hover:text-black transition-colors">
                Home
              </Link>
              <span style={{ color: "#ccc" }}>›</span>
              <span style={{ color: "#111", fontWeight: 500 }}>Wishlist</span>
            </nav>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="container-fluid" style={{ paddingBottom: "112px" }}>
          {loading ? (
            <div style={{ textAlign: "center", paddingTop: "80px", paddingBottom: "80px" }}>
              <div style={{ width: 36, height: 36, border: "3px solid #e0e0e0", borderTopColor: "#222", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
              <p className="text-gray-500">Loading wishlist items...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : wishlistProducts.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", paddingTop: "56px", paddingBottom: "56px", maxWidth: "380px", margin: "0 auto" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#fafafa", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <Heart className="w-8 h-8 text-neutral-400 stroke-[1.5]" />
              </div>
              <h2 style={{ fontSize: "16px", fontWeight: 800, textTransform: "uppercase", color: "#111", marginBottom: "14px", letterSpacing: "0.08em" }}>
                Your wishlist is empty
              </h2>
              <p style={{ color: "#999", fontSize: "14px", lineHeight: 1.7, marginBottom: "36px" }}>
                Save your favourite items while you browse our collections.
              </p>
              <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <Link href="/collections/all" className="btn">
                  Start Shopping
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {wishlistProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div style={{ textAlign: "center", marginTop: "56px" }}>
                <button
                  className="btn"
                  onClick={() =>
                    wishlistProducts.forEach((p) =>
                      addToCart(p, p.options?.[0]?.values?.[0] || p.variants?.[0]?.option1 || "M")
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
