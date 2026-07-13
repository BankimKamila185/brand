"use client";

import React from "react";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import productsData from "@/data/products.json";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const allProducts = productsData.products || [];
  const wishlistProducts = allProducts.filter((p) => wishlist.includes(p.id));

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Header />
      <main className="flex-grow">
        {/* Hero */}
        <div className="collection-hero">
          <h1 className="collection-hero-title">My Wishlist</h1>
          <p className="collection-hero-count">
            {wishlistProducts.length} Saved Items
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

          {wishlistProducts.length === 0 ? (
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
                      addToCart(p, p.options[0]?.values[0] || "M"),
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
