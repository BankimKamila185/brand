"use client";

import React, { useState, useMemo, useEffect, use } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { productsApi } from "@/lib/api";
import Link from "next/link";
import { ChevronDown, ChevronUp, SlidersHorizontal, Grid, X } from "lucide-react";

const COLLECTION_LABELS = {
  all: "All Products",
  bestsellers: "Bestsellers",
  "co-ord-sets": "Co-ord Sets",
  "cargo-trousers-for-men": "Cargo Trousers",
  "korean-pants": "Korean Pants",
  "parachute-cargos": "Parachute Cargos",
  gurkhatrousers: "Gurkha Trousers",
  denim: "Denim Parachutes",
  shirts: "Casual Shirts",
  "crochet-shirts": "Crochet Shirts",
  "cuban-shirts": "Cuban Shirts",
  "linen-shirts": "Linen Shirts",
  "oversized-t-shirts": "Oversized T-Shirts",
  "linen-co-ord-sets": "Linen Co-ords",
  "textured-co-ord-sets": "Textured Co-ords",
  "printed-co-ord-sets": "Printed Co-ords",
  "retro-clothing": "Retro Clothing",
  "outliers-k-aracter": "Outliers K-aracter",
  "outliers-recommends": "Outliers Recommends",
  winterwear: "Winterwear",
  outerwear: "Outerwear",
  "whats-new": "New Arrivals",
};

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "discount", label: "Best Discount" },
];

export default function CollectionPage({ params }) {
  const resolvedParams = use(params);
  const handle = resolvedParams?.handle || "";
  const label =
    COLLECTION_LABELS[handle] ||
    (handle ? handle.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Collection");

  const [dbProducts, setDbProducts] = useState([]);
  const [isFallback, setIsFallback] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [gridCols, setGridCols] = useState(4); // Default 4-column layout as requested
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [priceMaxLimit, setPriceMaxLimit] = useState(5000);
  const [priceRange, setPriceRange] = useState(5000);
  const [minPriceInput, setMinPriceInput] = useState(0);
  const [maxPriceInput, setMaxPriceInput] = useState(5000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [outOfStockOnly, setOutOfStockOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Accordion Section States
  const [openSections, setOpenSections] = useState({
    size: true,
    price: true,
    availability: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productsApi.list({ collection: handle, limit: "100" });
        let productsList = [];
        let isFb = false;
        if (res.success && res.data && res.data.length > 0) {
          productsList = res.data;
        } else {
          const fallbackRes = await productsApi.list({ limit: "100" });
          if (fallbackRes.success && fallbackRes.data) {
            productsList = fallbackRes.data;
            isFb = true;
          }
        }
        setIsFallback(isFb);

        const formatted = productsList.map((p) => ({
          id: p.id,
          title: p.title,
          handle: p.handle,
          product_type: p.productType || "",
          vendor: p.vendor || "",
          tags: p.tags || [],
          published_at: p.publishedAt,
          created_at: p.createdAt,
          updated_at: p.updatedAt,
          variants: (p.variants || []).map((v) => ({
            id: v.id,
            title: v.title,
            price: String(v.price || "0"),
            compare_at_price: v.comparePrice ? String(v.comparePrice) : null,
            option1: v.option1,
            option2: v.option2,
            available: v.inventory ? v.inventory.quantity > 0 : true,
          })),
          images: (p.images || []).map((img) => ({
            src: img.src,
            alt: img.altText || p.title,
          })),
          options: p.options || [{ name: "Size", values: (p.variants || []).map((v) => v.option1).filter(Boolean) }],
        }));

        setDbProducts(formatted);

        // Find max price for slider
        let maxP = 3000;
        formatted.forEach((item) => {
          const p = parseFloat(item.variants[0]?.price || 0);
          if (p > maxP) maxP = Math.ceil(p / 500) * 500;
        });
        setPriceMaxLimit(maxP);
        setPriceRange(maxP);
        setMaxPriceInput(maxP);

      } catch (err) {
        console.error("Failed to load products from DB:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [handle]);

  const allProducts = dbProducts;

  // Extract available sizes dynamically
  const availableSizes = useMemo(() => {
    const set = new Set();
    allProducts.forEach((p) => {
      const opts = p.options?.[0]?.values || p.variants?.map((v) => v.option1).filter(Boolean) || [];
      opts.forEach((s) => set.add(s));
    });
    return Array.from(set).sort();
  }, [allProducts]);

  // Counts for stock
  const inStockCount = useMemo(
    () => allProducts.filter((p) => p.variants.some((v) => v.available)).length,
    [allProducts]
  );
  const outOfStockCount = useMemo(
    () => allProducts.filter((p) => p.variants.every((v) => !v.available)).length,
    [allProducts]
  );

  const toggleSizeFilter = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const clearAllFilters = () => {
    setSelectedSizes([]);
    setMinPriceInput(0);
    setMaxPriceInput(priceMaxLimit);
    setPriceRange(priceMaxLimit);
    setInStockOnly(false);
    setOutOfStockOnly(false);
    setSearchQuery("");
  };

  const isFilterActive =
    selectedSizes.length > 0 ||
    minPriceInput > 0 ||
    maxPriceInput < priceMaxLimit ||
    inStockOnly ||
    outOfStockOnly;

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    let products = allProducts;

    if (handle !== "all" && isFallback) {
      products = products.filter((p) => {
        const typeSlug = p.product_type.toLowerCase().replace(/ /g, "-");
        const tags = p.tags.map((t) => t.toLowerCase().replace(/ /g, "-"));
        return (
          typeSlug === handle ||
          tags.includes(handle) ||
          p.handle.includes(handle)
        );
      });

      if (products.length === 0) {
        products = allProducts.slice(0, 12);
      }
    }

    // Search filter
    if (searchQuery) {
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.product_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Size Filter
    if (selectedSizes.length > 0) {
      products = products.filter((p) => {
        const pSizes = p.options?.[0]?.values || p.variants?.map((v) => v.option1).filter(Boolean) || [];
        return selectedSizes.some((s) => pSizes.includes(s));
      });
    }

    // Price Filter
    products = products.filter((p) => {
      const price = parseFloat(p.variants[0]?.price || 0);
      return price >= minPriceInput && price <= maxPriceInput && price <= priceRange;
    });

    // Stock Availability Filter
    if (inStockOnly && !outOfStockOnly) {
      products = products.filter((p) => p.variants.some((v) => v.available));
    } else if (outOfStockOnly && !inStockOnly) {
      products = products.filter((p) => p.variants.every((v) => !v.available));
    }

    // Sort
    const sorted = [...products];
    if (sortBy === "price-asc")
      sorted.sort(
        (a, b) =>
          parseFloat(a.variants[0]?.price || 0) - parseFloat(b.variants[0]?.price || 0)
      );
    if (sortBy === "price-desc")
      sorted.sort(
        (a, b) =>
          parseFloat(b.variants[0]?.price || 0) - parseFloat(a.variants[0]?.price || 0)
      );
    if (sortBy === "newest")
      sorted.sort(
        (a, b) =>
          new Date(b.published_at || b.created_at).getTime() -
          new Date(a.published_at || a.created_at).getTime()
      );
    if (sortBy === "discount") {
      sorted.sort((a, b) => {
        const discA = a.variants[0]?.compare_at_price
          ? (parseFloat(a.variants[0].compare_at_price) - parseFloat(a.variants[0].price)) /
            parseFloat(a.variants[0].compare_at_price)
          : 0;
        const discB = b.variants[0]?.compare_at_price
          ? (parseFloat(b.variants[0].compare_at_price) - parseFloat(b.variants[0].price)) /
            parseFloat(b.variants[0].compare_at_price)
          : 0;
        return discB - discA;
      });
    }

    return sorted;
  }, [
    handle,
    searchQuery,
    sortBy,
    selectedSizes,
    minPriceInput,
    maxPriceInput,
    priceRange,
    inStockOnly,
    outOfStockOnly,
    allProducts,
    isFallback,
  ]);

  // Dynamic grid column class
  const getGridClass = () => {
    if (gridCols === 1) return "grid-cols-1";
    if (gridCols === 2) return "grid-cols-1 sm:grid-cols-2";
    if (gridCols === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    if (gridCols === 5) return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
    return "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"; // 4-col default
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-neutral-900">
      <AnnouncementBar />
      <Header onSearch={setSearchQuery} />

      <main className="flex-grow pb-16">
        {/* Sleek Dark Header Banner */}
        <div className="bg-black text-white py-12 md:py-16 text-center select-none shadow-sm">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-wide uppercase">
            {label}
          </h1>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-8">
          
          {/* Main 2-Column Grid Layout: Left Sidebar + Right Catalog */}
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            
            {/* ── LEFT SIDEBAR: FILTERS ── */}
            <aside className="w-full md:w-64 flex-shrink-0 hidden md:block">
              <div className="sticky top-24 flex flex-col gap-6 pr-2">
                
                {/* Filter Header */}
                <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                  <h2 className="text-xl font-extrabold tracking-tight text-neutral-900">
                    Filters
                  </h2>
                  {isFilterActive && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-neutral-500 hover:text-black font-semibold underline transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* 1. Size Accordion */}
                <div className="border-b border-neutral-200 pb-5">
                  <button
                    onClick={() => toggleSection("size")}
                    className="w-full flex items-center justify-between font-bold text-sm text-neutral-900 py-1"
                  >
                    <span>Size</span>
                    {openSections.size ? (
                      <ChevronUp className="w-4 h-4 text-neutral-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-500" />
                    )}
                  </button>

                  {openSections.size && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {availableSizes.length > 0
                        ? availableSizes.map((size) => {
                            const isSelected = selectedSizes.includes(size);
                            return (
                              <button
                                key={size}
                                onClick={() => toggleSizeFilter(size)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded border transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-neutral-700 border-neutral-300 hover:border-black"
                                }`}
                              >
                                {size}
                              </button>
                            );
                          })
                        : ["S", "M", "L", "XL", "XXL"].map((size) => {
                            const isSelected = selectedSizes.includes(size);
                            return (
                              <button
                                key={size}
                                onClick={() => toggleSizeFilter(size)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded border transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-neutral-700 border-neutral-300 hover:border-black"
                                }`}
                              >
                                {size}
                              </button>
                            );
                          })}
                    </div>
                  )}
                </div>

                {/* 2. Price Accordion */}
                <div className="border-b border-neutral-200 pb-5">
                  <button
                    onClick={() => toggleSection("price")}
                    className="w-full flex items-center justify-between font-bold text-sm text-neutral-900 py-1"
                  >
                    <span>Price</span>
                    {openSections.price ? (
                      <ChevronUp className="w-4 h-4 text-neutral-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-500" />
                    )}
                  </button>

                  {openSections.price && (
                    <div className="mt-4 flex flex-col gap-4">
                      {/* Price Range Slider */}
                      <input
                        type="range"
                        min="0"
                        max={priceMaxLimit}
                        step="50"
                        value={priceRange}
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="w-full accent-black cursor-pointer"
                      />

                      {/* Numeric Inputs: Min to Max */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 relative flex items-center">
                          <span className="absolute left-3 text-xs text-neutral-400 font-semibold">₹</span>
                          <input
                            type="number"
                            min="0"
                            max={maxPriceInput}
                            value={minPriceInput}
                            onChange={(e) => setMinPriceInput(Number(e.target.value))}
                            className="w-full pl-7 pr-2 py-2 text-xs font-medium border border-neutral-300 rounded outline-none focus:border-black"
                          />
                        </div>

                        <span className="text-xs text-neutral-400 font-medium">To</span>

                        <div className="flex-1 relative flex items-center">
                          <span className="absolute left-3 text-xs text-neutral-400 font-semibold">₹</span>
                          <input
                            type="number"
                            min={minPriceInput}
                            max={priceMaxLimit}
                            value={maxPriceInput}
                            onChange={(e) => setMaxPriceInput(Number(e.target.value))}
                            className="w-full pl-7 pr-2 py-2 text-xs font-medium border border-neutral-300 rounded outline-none focus:border-black"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Availability Accordion */}
                <div className="border-b border-neutral-200 pb-5">
                  <button
                    onClick={() => toggleSection("availability")}
                    className="w-full flex items-center justify-between font-bold text-sm text-neutral-900 py-1"
                  >
                    <span>Availability</span>
                    {openSections.availability ? (
                      <ChevronUp className="w-4 h-4 text-neutral-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-500" />
                    )}
                  </button>

                  {openSections.availability && (
                    <div className="mt-3 flex flex-col gap-2.5">
                      <label className="flex items-center gap-2.5 text-xs font-medium text-neutral-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={inStockOnly}
                          onChange={(e) => setInStockOnly(e.target.checked)}
                          className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                        />
                        <span>In stock ({inStockCount})</span>
                      </label>

                      <label className="flex items-center gap-2.5 text-xs font-medium text-neutral-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={outOfStockOnly}
                          onChange={(e) => setOutOfStockOnly(e.target.checked)}
                          className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                        />
                        <span>Out of stock ({outOfStockCount})</span>
                      </label>
                    </div>
                  )}
                </div>

              </div>
            </aside>

            {/* ── RIGHT MAIN AREA: CATALOG ── */}
            <section className="flex-1 flex flex-col min-w-0">
              
              {/* Top Controls Bar: Sort Dropdown Left | Grid Switcher Right */}
              <div className="flex items-center justify-between pb-6 border-b border-neutral-200 mb-6 gap-4">
                
                {/* Left: Mobile Filter Button & Sort Dropdown */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="md:hidden inline-flex items-center gap-2 px-3.5 py-2 border border-neutral-300 rounded text-xs font-bold text-neutral-800 hover:border-black"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Filters
                  </button>

                  {/* Sort Select */}
                  <div className="relative flex items-center">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-neutral-300 rounded px-3.5 py-2 pr-8 text-xs font-semibold text-neutral-800 outline-none focus:border-black cursor-pointer shadow-none"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 text-neutral-500 pointer-events-none" />
                  </div>
                </div>

                {/* Right: Grid Column Switchers (1-col, 2-col, 3-col, 4-col, 5-col) */}
                <div className="hidden sm:flex items-center gap-1 bg-neutral-100 p-1 rounded-md">
                  
                  {/* 1 Column (List) */}
                  <button
                    onClick={() => setGridCols(1)}
                    title="1 Column"
                    className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      gridCols === 1 ? "bg-black text-white" : "text-neutral-500 hover:text-black"
                    }`}
                  >
                    ≡
                  </button>

                  {/* 2 Columns */}
                  <button
                    onClick={() => setGridCols(2)}
                    title="2 Columns"
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      gridCols === 2 ? "bg-black text-white" : "text-neutral-500 hover:text-black"
                    }`}
                  >
                    ║
                  </button>

                  {/* 3 Columns */}
                  <button
                    onClick={() => setGridCols(3)}
                    title="3 Columns"
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      gridCols === 3 ? "bg-black text-white" : "text-neutral-500 hover:text-black"
                    }`}
                  >
                    ║║
                  </button>

                  {/* 4 Columns (Active Default) */}
                  <button
                    onClick={() => setGridCols(4)}
                    title="4 Columns"
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      gridCols === 4 ? "bg-black text-white" : "text-neutral-500 hover:text-black"
                    }`}
                  >
                    ║║║
                  </button>

                  {/* 5 Columns */}
                  <button
                    onClick={() => setGridCols(5)}
                    title="5 Columns"
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      gridCols === 5 ? "bg-black text-white" : "text-neutral-500 hover:text-black"
                    }`}
                  >
                    ║║║║
                  </button>

                </div>

              </div>

              {/* Product Grid Area */}
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-3">
                      <div className="aspect-[3/4] bg-neutral-200 rounded" />
                      <div className="h-4 bg-neutral-200 rounded w-3/4" />
                      <div className="h-3 bg-neutral-200 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-neutral-50 rounded-xl border border-neutral-200 px-4">
                  <p className="text-4xl mb-3">🔍</p>
                  <h3 className="text-lg font-bold text-neutral-900 mb-1">
                    No matching products found
                  </h3>
                  <p className="text-xs text-neutral-500 mb-6">
                    Try adjusting your filters or price range to find what you&apos;re looking for.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="bg-black text-white px-6 py-2.5 rounded font-bold text-xs uppercase tracking-wider hover:bg-neutral-800"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className={`grid ${getGridClass()} gap-x-5 gap-y-8`}>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

            </section>

          </div>

        </div>

      </main>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[999] flex justify-end bg-black/50 md:hidden">
          <div className="w-80 bg-white h-full p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
                <h3 className="font-extrabold text-base text-neutral-900">Filters &amp; Refine</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 text-neutral-500 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Size Filter */}
              <div className="mb-6">
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-700 mb-3">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSizeFilter(size)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded border ${
                        selectedSizes.includes(size)
                          ? "bg-black text-white border-black"
                          : "bg-white border-neutral-300 text-neutral-700"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Price Range */}
              <div className="mb-6">
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-700 mb-3">Max Price: ₹{priceRange}</h4>
                <input
                  type="range"
                  min="0"
                  max={priceMaxLimit}
                  step="50"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-black"
                />
              </div>

              {/* Mobile Availability */}
              <div className="mb-6">
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-700 mb-3">Availability</h4>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded"
                    />
                    <span>In stock ({inStockCount})</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-3 border border-neutral-300 font-bold text-xs uppercase rounded"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-3 bg-black text-white font-bold text-xs uppercase rounded"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <CartDrawer />
    </div>
  );
}
