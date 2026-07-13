'use client';

import React, { useState, useMemo } from 'react';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import ProductCard from '@/components/ProductCard';
import productsData from '@/data/products.json';
import { Product } from '@/types';
import Link from 'next/link';

interface PageProps {
  params: { handle: string };
}

const COLLECTION_LABELS: Record<string, string> = {
  all: 'All Products',
  bestsellers: 'Bestsellers',
  'co-ord-sets': 'Co-ord Sets',
  'cargo-trousers-for-men': 'Cargo Trousers',
  'korean-pants': 'Korean Pants',
  'parachute-cargos': 'Parachute Cargos',
  'gurkhatrousers': 'Gurkha Trousers',
  'denim': 'Denim Parachutes',
  shirts: 'Casual Shirts',
  'crochet-shirts': 'Crochet Shirts',
  'cuban-shirts': 'Cuban Shirts',
  'linen-shirts': 'Linen Shirts',
  'oversized-t-shirts': 'Oversized T-Shirts',
  'linen-co-ord-sets': 'Linen Co-ords',
  'textured-co-ord-sets': 'Textured Co-ords',
  'printed-co-ord-sets': 'Printed Co-ords',
  'retro-clothing': 'Retro Clothing',
  'outliers-k-aracter': 'Outliers K-aracter',
  'outliers-recommends': 'Outliers Recommends',
  winterwear: 'Winterwear',
  outerwear: 'Outerwear',
  'whats-new': 'New Arrivals',
};

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'discount', label: 'Best Discount' },
];

export default function CollectionPage({ params }: PageProps) {
  const handle = params.handle;
  const label = COLLECTION_LABELS[handle] || handle.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const allProducts = (productsData.products as unknown as Product[]) || [];

  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under1000' | '1000-2000' | 'above2000'>('all');

  const filteredProducts = useMemo(() => {
    let products = allProducts;

    // Collection filter
    if (handle !== 'all') {
      products = products.filter((p) => {
        const typeSlug = p.product_type.toLowerCase().replace(/ /g, '-');
        const tags = p.tags.map((t) => t.toLowerCase().replace(/ /g, '-'));
        return typeSlug === handle || tags.includes(handle) || p.handle.includes(handle);
      });

      // Fallback: if no strict match, show similar types
      if (products.length === 0) {
        products = allProducts.slice(0, 12);
      }
    }

    // Search filter
    if (searchQuery) {
      products = products.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.product_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      products = products.filter((p) => {
        const price = parseFloat(p.variants[0].price);
        if (priceFilter === 'under1000') return price < 1000;
        if (priceFilter === '1000-2000') return price >= 1000 && price <= 2000;
        if (priceFilter === 'above2000') return price > 2000;
        return true;
      });
    }

    // Sort
    const sorted = [...products];
    if (sortBy === 'price-asc') sorted.sort((a, b) => parseFloat(a.variants[0].price) - parseFloat(b.variants[0].price));
    if (sortBy === 'price-desc') sorted.sort((a, b) => parseFloat(b.variants[0].price) - parseFloat(a.variants[0].price));
    if (sortBy === 'newest') sorted.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    if (sortBy === 'discount') {
      sorted.sort((a, b) => {
        const discA = a.variants[0].compare_at_price
          ? (parseFloat(a.variants[0].compare_at_price) - parseFloat(a.variants[0].price)) / parseFloat(a.variants[0].compare_at_price)
          : 0;
        const discB = b.variants[0].compare_at_price
          ? (parseFloat(b.variants[0].compare_at_price) - parseFloat(b.variants[0].price)) / parseFloat(b.variants[0].compare_at_price)
          : 0;
        return discB - discA;
      });
    }

    return sorted;
  }, [handle, searchQuery, sortBy, priceFilter, allProducts]);

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Header onSearch={setSearchQuery} />

      <main className="flex-grow">
        {/* Collection Hero Banner */}
        <div className="collection-hero">
          <h1 className="collection-hero-title">{label}</h1>
          <p className="collection-hero-count">{filteredProducts.length} Products</p>
        </div>

        <div className="container-fluid py-10">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 flex flex-wrap items-center gap-y-1 gap-x-2 mb-6">
            <Link href="/" className="hover:text-black whitespace-nowrap">Home</Link>
            <span className="text-neutral-300">/</span>
            <span className="text-black font-semibold whitespace-nowrap">{label}</span>
          </nav>

          {/* Filters bar */}
          <div className="collection-filter-bar">
            {/* Price filter chips */}
            <div className="filter-group">
              <span className="filter-label">Price:</span>
              {(['all', 'under1000', '1000-2000', 'above2000'] as const).map((p) => (
                <button
                  key={p}
                  className={`filter-chip ${priceFilter === p ? 'active' : ''}`}
                  onClick={() => setPriceFilter(p)}
                >
                  {p === 'all' ? 'All' : p === 'under1000' ? 'Under ₹1000' : p === '1000-2000' ? '₹1000 – ₹2000' : 'Above ₹2000'}
                </button>
              ))}
            </div>

            {/* Sort dropdown */}
            <div className="flex items-center gap-3 ml-auto">
              <span className="filter-label">Sort by:</span>
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">🧸</p>
              <h3 className="text-2xl font-bold uppercase mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or browse all products.</p>
              <Link href="/collections/all" className="bg-black text-white px-8 py-3 inline-block font-bold uppercase tracking-widest text-sm rounded">
                View All Products
              </Link>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
