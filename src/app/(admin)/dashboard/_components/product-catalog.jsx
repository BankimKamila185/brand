"use client";

import { useEffect, useState } from "react";
import { PackagePlus, Plus } from "lucide-react";
import { adminApi } from "@/lib/api";
import { ProductBuilder } from "./product-builder";

export function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [adding, setAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
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
            className="product-catalog-card cursor-pointer hover:border-black transition-all"
            onClick={() => setEditingProduct(product)}
          >
            <div className="product-catalog-image">
              {product.images?.[0]?.src ? (
                <img src={product.images[0].src} alt={product.title} />
              ) : (
                <PackagePlus />
              )}
              <span>{product.category?.name || "Uncategorized"}</span>
            </div>
            <div>
              <h2>{product.title}</h2>
              <p>
                {product.variants?.length || 0} sizes ·{" "}
                {product.variants?.reduce(
                  (total, variant) => total + Number(variant.inventory?.quantity || 0),
                  0
                ) || 0}{" "}
                units
              </p>
              <strong>
                ₹{Number(product.variants?.[0]?.price || 0).toLocaleString("en-IN")}
              </strong>
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
    </div>
  );
}
