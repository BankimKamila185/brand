"use strict";
"use client";

import React from "react";
import Link from "next/link";

const CATEGORIES = [
  {
    name: "Co-ord Sets",
    link: "/collections/co-ord-sets",
    image:
      "https://cdn.shopify.com/s/files/1/0612/8254/9805/files/coord.png?v=1700977608&width=600",
  },
  {
    name: "Gurkha Trousers",
    link: "/collections/gurkhatrousers",
    image:
      "https://cdn.shopify.com/s/files/1/0612/8254/9805/files/Gurkha_new_banner_600_x_480_px.png?v=1775648537&width=600",
  },
  {
    name: "Denim Parachutes",
    link: "/collections/denim",
    image:
      "https://cdn.shopify.com/s/files/1/0612/8254/9805/files/Denim_600_x_480_px_1_79b96018-cd11-43ff-9a75-42f5ed75d3a9.png?v=1781530633&width=600",
  },
  {
    name: "Resort Shirts",
    link: "/collections/shirts",
    image:
      "https://cdn.shopify.com/s/files/1/0612/8254/9805/files/shirt.png?v=1700977451&width=600",
  },
];

const CategoryGrid = () => {
  return (
    <section className="container-fluid my-16">
      <h2 className="section-title">Shop by Category</h2>
      <div className="category-grid">
        {CATEGORIES.map((cat, idx) => (
          <Link href={cat.link} key={idx} className="category-card">
            <img
              src={cat.image}
              alt={cat.name}
              className="category-card-img"
              loading="lazy"
            />

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
