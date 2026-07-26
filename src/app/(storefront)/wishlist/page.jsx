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
        <div className="container-fluid pt-16 md:pt-20 pb-4">
          <div className="text-center mb-8">
            <h1 className="text-[32px] md:text-[38px] font-bold text-neutral-900 mb-3 tracking-tight">
              Wishlist
            </h1>
            <nav className="text-sm text-neutral-500 flex items-center justify-center gap-1.5" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-black transition-colors">
                Home
              </Link>
              <span className="text-neutral-400 select-none">›</span>
              <span className="text-neutral-900 font-medium">Wishlist</span>
            </nav>
          </div>
        </div>

        <div className="container-fluid pb-20">
          {loading ? (
            <div className="text-center py-24">
              <div style={{ width: 36, height: 36, border: "3px solid #e0e0e0", borderTopColor: "#222", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
              <p className="text-gray-500">Loading wishlist items...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : wishlistProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-6 shadow-sm mx-auto">
                <Heart className="w-7 h-7 text-neutral-400 stroke-[1.5]" />
              </div>
              <h2 className="text-xl font-black uppercase text-neutral-900 mb-3 tracking-wider mx-auto">
                Your wishlist is empty
              </h2>
              <p className="text-neutral-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                Save your favourite items while you browse our collections.
              </p>
              <div className="flex justify-center w-full mx-auto">
                <Link
                  href="/collections/all"
                  className="btn"
                >
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

              <div className="text-center mt-12">
                <button
                  className="btn"
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
