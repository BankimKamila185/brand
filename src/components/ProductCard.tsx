'use strict';
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDetails?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('');

  const firstImg = product.images[0]?.src || '';
  const secondImg = product.images[1]?.src || firstImg;

  // Calculate discount percentage
  const variant = product.variants[0];
  const priceNum = parseFloat(variant.price);
  const comparePriceNum = variant.compare_at_price ? parseFloat(variant.compare_at_price) : 0;
  
  const discountPercent = (comparePriceNum > priceNum) 
    ? Math.round(((comparePriceNum - priceNum) / comparePriceNum) * 100) 
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Default to first variant's size if none selected
    const size = selectedSize || variant.title || 'M';
    addToCart(product, size);
  };

  const selectSize = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize(size);
  };

  const handleCardClick = () => {
    if (onOpenDetails) {
      onOpenDetails(product);
    }
  };

  return (
    <div className="product-card cursor-pointer" onClick={handleCardClick}>
      <div className="product-card-media">
        {discountPercent > 0 && (
          <span className="product-badge">-{discountPercent}% OFF</span>
        )}

        <img 
          src={firstImg} 
          alt={product.title} 
          className="product-card-img" 
          loading="lazy" 
        />
        {secondImg && (
          <img 
            src={secondImg} 
            alt={product.title} 
            className="product-card-img secondary" 
            loading="lazy" 
          />
        )}

        {/* Hover size and action panel */}
        <div className="product-card-actions">
          <div className="quick-sizes">
            {product.options[0]?.values.map((size) => (
              <button
                key={size}
                className={`quick-size-btn ${selectedSize === size ? 'bg-black text-white border-black' : ''}`}
                onClick={(e) => selectSize(e, size)}
              >
                {size}
              </button>
            ))}
          </div>
          <button className="quick-add-btn" onClick={handleQuickAdd}>
            Quick Add
          </button>
        </div>
      </div>

      <div className="product-card-info">
        <span className="product-card-type">{product.product_type}</span>
        <h3 className="product-card-title">{product.title}</h3>
        <div className="product-card-price-row">
          {comparePriceNum > priceNum ? (
            <>
              <span className="price-sale">₹{priceNum}</span>
              <span className="price-compare">₹{comparePriceNum}</span>
            </>
          ) : (
            <span className="price-regular">₹{priceNum}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
