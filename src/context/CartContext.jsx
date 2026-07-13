"use strict";
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { cartApi, wishlistApi } from "../lib/api";

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart/wishlist
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated) {
        try {
          // Load cart from backend
          const backendCartRes = await cartApi.get();
          if (backendCartRes.success && backendCartRes.data) {
            const backendItems = backendCartRes.data.items || [];
            const formattedCart = backendItems.map((item) => ({
              product: {
                id: item.variant.product.id,
                title: item.variant.product.title,
                handle: item.variant.product.handle,
                body_html: "",
                published_at: "",
                created_at: "",
                updated_at: "",
                vendor: "",
                product_type: "",
                tags: [],
                variants: [
                  {
                    id: item.variant.id,
                    title: item.variant.title,
                    price: item.variant.price,
                    compare_at_price: item.variant.comparePrice,
                    option1: item.variant.option1,
                    option2: item.variant.option2,
                    option3: null,
                    sku: null,
                    requires_shipping: true,
                    taxable: true,
                    featured_image: null,
                    available: true,
                    grams: 0,
                    position: 1,
                    product_id: item.variant.product.id,
                    created_at: "",
                    updated_at: "",
                  },
                ],
                images:
                  item.variant.product.images?.map((img) => ({
                    id: img.id || "",
                    src: img.src,
                    width: img.width || 0,
                    height: img.height || 0,
                    position: img.position || 1,
                    product_id: item.variant.product.id,
                    created_at: "",
                    updated_at: "",
                    variant_ids: [],
                  })) || [],
                options: [],
              },
              variantId: item.variant.id,
              quantity: item.quantity,
              selectedSize: item.variant.option1 || "M",
            }));
            setCart(formattedCart);
          }

          // Load wishlist from backend
          const backendWishlistRes = await wishlistApi.get();
          if (backendWishlistRes.success && backendWishlistRes.data) {
            const formattedWishlist = backendWishlistRes.data.map(
              (item) => item.product.id,
            );
            setWishlist(formattedWishlist);
          }
        } catch (e) {
          console.error("Error loading cart/wishlist from backend:", e);
        }
      } else {
        // Guest: Load from localStorage
        try {
          const storedCart = localStorage.getItem("hok_cart");
          if (storedCart) setCart(JSON.parse(storedCart));

          const storedWishlist = localStorage.getItem("hok_wishlist");
          if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
        } catch (e) {
          console.error(
            "Error loading cart/wishlist state from localStorage:",
            e,
          );
        }
      }
      setIsLoaded(true);
    };

    loadData();
  }, [isAuthenticated, user]);

  // Sync to localStorage only for guest users
  useEffect(() => {
    if (!isLoaded || isAuthenticated) return;
    try {
      localStorage.setItem("hok_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Error saving cart state:", e);
    }
  }, [cart, isLoaded, isAuthenticated]);

  useEffect(() => {
    if (!isLoaded || isAuthenticated) return;
    try {
      localStorage.setItem("hok_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.error("Error saving wishlist state:", e);
    }
  }, [wishlist, isLoaded, isAuthenticated]);

  const addToCart = async (product, size, qty = 1) => {
    const variant =
      product.variants.find((v) => v.title === size || v.option1 === size) ||
      product.variants[0];
    const variantId = variant.id;

    if (isAuthenticated) {
      try {
        await cartApi.addItem(String(variantId), qty);
        // Refresh cart from backend to get fresh server state
        const backendCartRes = await cartApi.get();
        if (backendCartRes.success && backendCartRes.data) {
          const backendItems = backendCartRes.data.items || [];
          const formattedCart = backendItems.map((item) => ({
            product: {
              id: item.variant.product.id,
              title: item.variant.product.title,
              handle: item.variant.product.handle,
              body_html: "",
              published_at: "",
              created_at: "",
              updated_at: "",
              vendor: "",
              product_type: "",
              tags: [],
              variants: [
                {
                  id: item.variant.id,
                  title: item.variant.title,
                  price: item.variant.price,
                  compare_at_price: item.variant.comparePrice,
                  option1: item.variant.option1,
                  option2: item.variant.option2,
                  option3: null,
                  sku: null,
                  requires_shipping: true,
                  taxable: true,
                  featured_image: null,
                  available: true,
                  grams: 0,
                  position: 1,
                  product_id: item.variant.product.id,
                  created_at: "",
                  updated_at: "",
                },
              ],
              images:
                item.variant.product.images?.map((img) => ({
                  id: img.id || "",
                  src: img.src,
                  width: img.width || 0,
                  height: img.height || 0,
                  position: img.position || 1,
                  product_id: item.variant.product.id,
                  created_at: "",
                  updated_at: "",
                  variant_ids: [],
                })) || [],
              options: [],
            },
            variantId: item.variant.id,
            quantity: item.quantity,
            selectedSize: item.variant.option1 || "M",
          }));
          setCart(formattedCart);
        }
      } catch (e) {
        console.error("Error adding to backend cart:", e);
      }
    } else {
      setCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex(
          (item) => item.variantId === variantId,
        );

        if (existingItemIndex > -1) {
          const newCart = [...prevCart];
          newCart[existingItemIndex].quantity += qty;
          return newCart;
        } else {
          return [
            ...prevCart,
            { product, variantId, quantity: qty, selectedSize: size },
          ];
        }
      });
    }

    setCartOpen(true);
  };

  const removeFromCart = async (variantId) => {
    if (isAuthenticated) {
      try {
        const backendCartRes = await cartApi.get();
        if (backendCartRes.success && backendCartRes.data) {
          const backendItems = backendCartRes.data.items || [];
          const matchedBackendItem = backendItems.find(
            (bi) => bi.variant.id === variantId,
          );
          if (matchedBackendItem) {
            await cartApi.removeItem(matchedBackendItem.id);
          }
        }
        setCart((prevCart) =>
          prevCart.filter((item) => item.variantId !== variantId),
        );
      } catch (e) {
        console.error("Error removing from backend cart:", e);
      }
    } else {
      setCart((prevCart) =>
        prevCart.filter((item) => item.variantId !== variantId),
      );
    }
  };

  const updateQuantity = async (variantId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }

    if (isAuthenticated) {
      try {
        const backendCartRes = await cartApi.get();
        if (backendCartRes.success && backendCartRes.data) {
          const backendItems = backendCartRes.data.items || [];
          const matchedBackendItem = backendItems.find(
            (bi) => bi.variant.id === variantId,
          );
          if (matchedBackendItem) {
            await cartApi.updateItem(matchedBackendItem.id, quantity);
          }
        }
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.variantId === variantId ? { ...item, quantity } : item,
          ),
        );
      } catch (e) {
        console.error("Error updating backend cart quantity:", e);
      }
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.variantId === variantId ? { ...item, quantity } : item,
        ),
      );
    }
  };

  const toggleWishlist = async (productId) => {
    if (isAuthenticated) {
      try {
        const res = await wishlistApi.toggle(String(productId));
        if (res.success) {
          setWishlist((prevWishlist) =>
            prevWishlist.includes(productId)
              ? prevWishlist.filter((id) => id !== productId)
              : [...prevWishlist, productId],
          );
        }
      } catch (e) {
        console.error("Error toggling backend wishlist:", e);
      }
    } else {
      setWishlist((prevWishlist) =>
        prevWishlist.includes(productId)
          ? prevWishlist.filter((id) => id !== productId)
          : [...prevWishlist, productId],
      );
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartApi.clear();
      } catch (e) {
        console.error("Error clearing backend cart:", e);
      }
    }
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce((total, item) => {
    const variant =
      item.product.variants.find((v) => v.id === item.variantId) ||
      item.product.variants[0];
    const priceNum = parseFloat(variant.price);
    return total + (isNaN(priceNum) ? 0 : priceNum) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        cartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist,
        isInWishlist,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
