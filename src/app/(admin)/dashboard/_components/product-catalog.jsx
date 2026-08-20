"use client";

import { useEffect, useState } from "react";
import { PackagePlus, Plus, Printer, QrCode, Search, X, AlertCircle } from "lucide-react";
import { adminApi } from "@/lib/api";
import { ProductBuilder } from "./product-builder";
import { BarcodePrintModal } from "./barcode-print-modal";

export function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [adding, setAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [printProduct, setPrintProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("new") === "true") {
        setAdding(true);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [productResult, categoryResult] = await Promise.all([
        adminApi.products.list(),
        adminApi.categories.list(),
      ]);
      setProducts(productResult.data || []);
      setCategories(categoryResult.data || []);
    } catch (err) {
      console.error("Failed to load catalog products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const visible = products.filter((product) => {
    // 1. Category filter
    if (selectedCategory !== "all") {
      const matchCat =
        product.categoryId === selectedCategory ||
        product.category?.id === selectedCategory ||
        product.category?.name?.toLowerCase() === selectedCategory.toLowerCase() ||
        product.category?.slug?.toLowerCase() === selectedCategory.toLowerCase();
      if (!matchCat) return false;
    }

    // 2. Status filter
    if (statusFilter === "active" && product.isActive === false) return false;
    if (statusFilter === "inactive" && product.isActive !== false) return false;
    if (statusFilter === "out_of_stock") {
      const totalUnits =
        product.variants?.reduce(
          (sum, v) => sum + Number(v.inventory?.quantity || 0),
          0
        ) || 0;
      if (totalUnits > 0) return false;
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (product.title || "").toLowerCase().includes(q);
      const matchHandle = (product.handle || "").toLowerCase().includes(q);
      const matchType = (product.productType || "").toLowerCase().includes(q);
      const matchSku = product.variants?.some((v) =>
        (v.sku || "").toLowerCase().includes(q)
      );
      if (!matchTitle && !matchHandle && !matchType && !matchSku) return false;
    }

    return true;
  });

  if (adding) {
    return (
      <ProductBuilder
        onClose={() => setAdding(false)}
        onCreated={() => {
          setAdding(false);
          void load();
        }}
      />
    );
  }

  if (editingProduct) {
    return (
      <ProductBuilder
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onCreated={() => {
          setEditingProduct(null);
          void load();
        }}
      />
    );
  }

  return (
    <div className="product-catalog">
      <header className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">Catalog studio</p>
          <h1>Products</h1>
          <p>Manage your product catalog by category, imagery, size, and stock.</p>
        </div>
        <button className="admin-primary-button" onClick={() => setAdding(true)}>
          <Plus /> Add product
        </button>
      </header>

      {/* Search & Filter Controls */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between", margin: "16px 0" }}>
        {/* Search Bar */}
        <div style={{ position: "relative", flex: "1 1 300px", maxWidth: "420px" }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#9ca3af" }} />
          <input
            type="text"
            placeholder="Search products by title, SKU, handle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px 10px 36px", borderRadius: 10,
              border: "1px solid #e5e7eb", background: "#fff", fontSize: 13,
              outline: "none", boxSizing: "border-box"
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <button
            onClick={() => setStatusFilter("all")}
            style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: "pointer", border: "none",
              background: statusFilter === "all" ? "#18181b" : "#f3f4f6",
              color: statusFilter === "all" ? "#fff" : "#4b5563"
            }}
          >
            All Status
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: "pointer", border: "none",
              background: statusFilter === "active" ? "#10b981" : "#f3f4f6",
              color: statusFilter === "active" ? "#fff" : "#4b5563"
            }}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter("out_of_stock")}
            style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: "pointer", border: "none",
              background: statusFilter === "out_of_stock" ? "#f59e0b" : "#f3f4f6",
              color: statusFilter === "out_of_stock" ? "#fff" : "#4b5563"
            }}
          >
            0 Stock
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: "pointer", border: "none",
              background: statusFilter === "inactive" ? "#374151" : "#f3f4f6",
              color: statusFilter === "inactive" ? "#fff" : "#4b5563"
            }}
          >
            Draft / Inactive
          </button>
        </div>
      </div>

      <div className="product-catalog-toolbar">
        <div>
          {["all", ...categories.map((category) => category.id)].map((categoryId) => {
            const category = categories.find((item) => item.id === categoryId);
            return (
              <button
                className={selectedCategory === categoryId ? "active" : ""}
                key={categoryId}
                onClick={() => setSelectedCategory(categoryId)}
              >
                {categoryId === "all" ? "All products" : category?.name || categoryId}
              </button>
            );
          })}
        </div>
        <span>{loading ? "Loading…" : `${visible.length} products`}</span>
      </div>

      <section className="product-catalog-grid">
        {loading ? (
          [1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <article key={n} className="product-catalog-card flex flex-col justify-between" style={{ minHeight: 280 }}>
              <div>
                <div className="product-catalog-image skeleton-box" style={{ height: 220, borderRadius: "18px 18px 0 0" }} />
                <div className="p-3.5 flex flex-col gap-2">
                  <div className="skeleton-box" style={{ width: "70%", height: 16 }} />
                  <div className="skeleton-box" style={{ width: "40%", height: 12 }} />
                </div>
              </div>
              <div className="px-3.5 pb-3.5 pt-2 flex items-center justify-between border-t border-neutral-100">
                <div className="skeleton-box" style={{ width: 60, height: 18 }} />
                <div className="skeleton-box" style={{ width: 70, height: 28, borderRadius: 8 }} />
              </div>
            </article>
          ))
        ) : (
          visible.map((product) => (
            <article
              key={product.id}
              className="product-catalog-card relative group hover:border-black transition-all flex flex-col justify-between"
            >
              <div onClick={() => setEditingProduct(product)} className="cursor-pointer">
                <div className="product-catalog-image">
                  {product.images?.[0]?.src ? (
                    <img src={product.images[0].src} alt={product.title} />
                  ) : (
                    <PackagePlus />
                  )}
                  <span>{product.category?.name || "Uncategorized"}</span>
                  {product.isActive === false && (
                    <span style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.75)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Inactive
                    </span>
                  )}
                </div>
                <div className="p-3.5">
                  <h2>{product.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p>
                      {product.variants?.length || 0} sizes ·{" "}
                      {product.variants?.reduce(
                        (total, variant) => total + Number(variant.inventory?.quantity || 0),
                        0
                      ) || 0}{" "}
                      units
                    </p>
                    {(product.variants?.reduce((t, v) => t + Number(v.inventory?.quantity || 0), 0) || 0) <= 0 && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                        0 Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-3.5 pb-3.5 pt-1 flex items-center justify-between border-t border-neutral-100">
                <strong className="text-[#df5c35] font-extrabold text-base">
                  ₹{Number(product.variants?.[0]?.price || 0).toLocaleString("en-IN")}
                </strong>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPrintProduct(product);
                  }}
                  className="px-2.5 py-1.5 bg-neutral-100 hover:bg-[#fff0ea] hover:text-[#df5c35] text-neutral-700 text-xs font-bold rounded-lg border border-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Generate & Print Barcode Labels"
                >
                  <Printer className="w-3.5 h-3.5" /> Barcode
                </button>
              </div>
            </article>
          ))
        )}

        {!loading && !visible.length && (
          <div className="product-catalog-empty">
            <PackagePlus />
            <h2>No products here yet</h2>
            <p>Create a product to start filling this category.</p>
            <button className="admin-primary-button" onClick={() => setAdding(true)}>
              <Plus /> Add product
            </button>
          </div>
        )}
      </section>

      {printProduct && (
        <BarcodePrintModal
          product={printProduct}
          onClose={() => setPrintProduct(null)}
        />
      )}
    </div>
  );
}
