"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { categoriesApi } from "../lib/api";

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoriesApi.list();
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (_) {}
    };
    loadCategories();
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="container-fluid my-16">
      <h2 className="section-title">Shop by Category</h2>
      <div className="category-grid">
        {categories.map((cat) => (
          <Link href={`/collections/${cat.slug}`} key={cat.id || cat.slug} className="category-card">
            {cat.imageUrl && (
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="category-card-img"
                loading="lazy"
              />
            )}
            <div className="category-card-info">
              <h3 className="category-card-name">{cat.name}</h3>
              <span className="category-card-link">Explore Now</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
