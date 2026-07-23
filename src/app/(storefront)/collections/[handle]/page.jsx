"use client";

import React, { useState, useMemo, useEffect, use } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { productsApi } from "@/lib/api";
import Link from "next/link";
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";

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
  const [gridCols, setGridCols] = useState(4); // Default 4 columns
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [priceMaxLimit, setPriceMaxLimit] = useState(5000);
  const [priceRange, setPriceRange] = useState(5000);
  const [minPriceInput, setMinPriceInput] = useState(0);
  const [maxPriceInput, setMaxPriceInput] = useState(5000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [outOfStockOnly, setOutOfStockOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Accordion States
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

        // Calculate max price
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

  // Sizes available
  const availableSizes = useMemo(() => {
    const set = new Set();
    allProducts.forEach((p) => {
      const opts = p.options?.[0]?.values || p.variants?.map((v) => v.option1).filter(Boolean) || [];
      opts.forEach((s) => set.add(s));
    });
    return Array.from(set).sort();
  }, [allProducts]);

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

  // Filtered list
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

    if (searchQuery) {
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.product_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSizes.length > 0) {
      products = products.filter((p) => {
        const pSizes = p.options?.[0]?.values || p.variants?.map((v) => v.option1).filter(Boolean) || [];
        return selectedSizes.some((s) => pSizes.includes(s));
      });
    }

    products = products.filter((p) => {
      const price = parseFloat(p.variants[0]?.price || 0);
      return price >= minPriceInput && price <= maxPriceInput && price <= priceRange;
    });

    if (inStockOnly && !outOfStockOnly) {
      products = products.filter((p) => p.variants.some((v) => v.available));
    } else if (outOfStockOnly && !inStockOnly) {
      products = products.filter((p) => p.variants.every((v) => !v.available));
    }

    const sorted = [...products];
    if (sortBy === "price-asc")
      sorted.sort(
        (a, b) => parseFloat(a.variants[0]?.price || 0) - parseFloat(b.variants[0]?.price || 0)
      );
    if (sortBy === "price-desc")
      sorted.sort(
        (a, b) => parseFloat(b.variants[0]?.price || 0) - parseFloat(a.variants[0]?.price || 0)
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

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-neutral-900">
      <AnnouncementBar />
      <Header onSearch={setSearchQuery} />

      <main className="flex-grow">
        {/* Sleek Black Collection Banner */}
        <div className="collection-hero-banner">
          <h1>{label}</h1>
        </div>

        <div className="collection-main-wrapper">
          
          {/* Main 2-Column Flex Layout: Left Sidebar + Right Catalog */}
          <div className="collection-flex-layout">
            
            {/* ── LEFT SIDEBAR: FILTERS ── */}
            <aside className="collection-sidebar-panel">
              
              {/* Header */}
              <div className="collection-sidebar-header">
                <h2 className="collection-sidebar-title">Filters</h2>
                {isFilterActive && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-neutral-500 hover:text-black font-semibold underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* 1. Size Section */}
              <div className="collection-filter-section">
                <button
                  onClick={() => toggleSection("size")}
                  className="filter-section-trigger"
                >
                  <span>Size</span>
                  {openSections.size ? (
                    <ChevronUp className="w-4 h-4 text-neutral-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                  )}
                </button>

                {openSections.size && (
                  <div className="filter-size-grid">
                    {(availableSizes.length > 0 ? availableSizes : ["S", "M", "L", "XL", "XXL"]).map((size) => {
                      const isSelected = selectedSizes.includes(size);
                      return (
                        <button
                          key={size}
                          onClick={() => toggleSizeFilter(size)}
                          className={`filter-size-btn ${isSelected ? "active" : ""}`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. Price Section */}
              <div className="collection-filter-section">
                <button
                  onClick={() => toggleSection("price")}
                  className="filter-section-trigger"
                >
                  <span>Price</span>
                  {openSections.price ? (
                    <ChevronUp className="w-4 h-4 text-neutral-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                  )}
                </button>

                {openSections.price && (
                  <div className="filter-price-slider-wrap">
                    <input
                      type="range"
                      min="0"
                      max={priceMaxLimit}
                      step="50"
                      value={priceRange}
                      onChange={(e) => setPriceRange(Number(e.target.value))}
                      className="w-full accent-black cursor-pointer"
                    />

                    <div className="filter-price-inputs">
                      <div className="filter-price-field">
                        <span>₹</span>
                        <input
                          type="number"
                          min="0"
                          max={maxPriceInput}
                          value={minPriceInput}
                          onChange={(e) => setMinPriceInput(Number(e.target.value))}
                        />
                      </div>

                      <span className="text-xs text-neutral-400 font-medium">To</span>

                      <div className="filter-price-field">
                        <span>₹</span>
                        <input
                          type="number"
                          min={minPriceInput}
                          max={priceMaxLimit}
                          value={maxPriceInput}
                          onChange={(e) => setMaxPriceInput(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Availability Section */}
              <div className="collection-filter-section">
                <button
                  onClick={() => toggleSection("availability")}
                  className="filter-section-trigger"
                >
                  <span>Availability</span>
                  {openSections.availability ? (
                    <ChevronUp className="w-4 h-4 text-neutral-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                  )}
                </button>

                {openSections.availability && (
                  <div className="filter-stock-list">
                    <label className="filter-stock-label">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="filter-stock-checkbox"
                      />
                      <span>In stock ({inStockCount})</span>
                    </label>

                    <label className="filter-stock-label">
                      <input
                        type="checkbox"
                        checked={outOfStockOnly}
                        onChange={(e) => setOutOfStockOnly(e.target.checked)}
                        className="filter-stock-checkbox"
                      />
                      <span>Out of stock ({outOfStockCount})</span>
                    </label>
                  </div>
                )}
              </div>

            </aside>

            {/* ── RIGHT MAIN AREA: CATALOG ── */}
            <section className="collection-catalog-area">
              
              {/* Toolbar: Sort Left | Grid Buttons Right */}
              <div className="collection-top-toolbar">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="md:hidden inline-flex items-center gap-2 px-3.5 py-2 border border-neutral-300 rounded text-xs font-bold text-neutral-800"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Filters
                  </button>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select-custom"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grid Column Switcher (1, 2, 3, 4, 5) */}
                <div className="hidden sm:flex grid-switcher-bar">
                  <button
                    onClick={() => setGridCols(1)}
                    className={`grid-switcher-btn ${gridCols === 1 ? "active" : ""}`}
                    title="1 Column List"
                  >
                    ≡
                  </button>
                  <button
                    onClick={() => setGridCols(2)}
                    className={`grid-switcher-btn ${gridCols === 2 ? "active" : ""}`}
                    title="2 Columns"
                  >
                    ||
                  </button>
                  <button
                    onClick={() => setGridCols(3)}
                    className={`grid-switcher-btn ${gridCols === 3 ? "active" : ""}`}
                    title="3 Columns"
                  >
                    |||
                  </button>
                  <button
                    onClick={() => setGridCols(4)}
                    className={`grid-switcher-btn ${gridCols === 4 ? "active" : ""}`}
                    title="4 Columns"
                  >
                    ||||
                  </button>
                  <button
                    onClick={() => setGridCols(5)}
                    className={`grid-switcher-btn ${gridCols === 5 ? "active" : ""}`}
                    title="5 Columns"
                  >
                    |||||
                  </button>
                </div>
              </div>

              {/* Product Grid Area */}
              {loading ? (
                <div className="dynamic-catalog-grid cols-4 animate-pulse">
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
                    className="bg-black text-white px-6 py-2.5 rounded font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className={`dynamic-catalog-grid cols-${gridCols}`}>
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
                <div className="filter-size-grid">
                  {(availableSizes.length > 0 ? availableSizes : ["S", "M", "L", "XL", "XXL"]).map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSizeFilter(size)}
                      className={`filter-size-btn ${selectedSizes.includes(size) ? "active" : ""}`}
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
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              {/* Mobile Availability */}
              <div className="mb-6">
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-700 mb-3">Availability</h4>
                <div className="flex flex-col gap-2">
                  <label className="filter-stock-label">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="filter-stock-checkbox"
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
