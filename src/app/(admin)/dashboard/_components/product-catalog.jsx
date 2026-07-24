"use client";

import { useEffect, useState } from "react";
import { PackagePlus, Plus, Printer, QrCode } from "lucide-react";
import { adminApi } from "@/lib/api";
import { ProductBuilder } from "./product-builder";
import { BarcodePrintModal } from "./barcode-print-modal";

export function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
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

  const visible =
    selectedCategory === "all"
      ? products
      : products.filter(
          (product) =>
            product.categoryId === selectedCategory ||
            product.category?.id === selectedCategory
        );

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
                {categoryId === "all" ? "All products" : category.name}
              </button>
            );
          })}
        </div>
        <span>{loading ? "Loading…" : `${visible.length} products`}</span>
      </div>

      <section className="product-catalog-grid">
        {visible.map((product) => (
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
              </div>
              <div className="p-3.5">
                <h2>{product.title}</h2>
                <p>
                  {product.variants?.length || 0} sizes ·{" "}
                  {product.variants?.reduce(
                    (total, variant) => total + Number(variant.inventory?.quantity || 0),
                    0
                  ) || 0}{" "}
                  units
                </p>
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
        ))}

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
