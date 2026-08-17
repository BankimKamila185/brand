"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { cartApi, wishlistApi } from "../lib/api";

const CartContext = createContext(undefined);

export const MAX_QTY_PER_ITEM = 5;

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [appliedCoupon, setAppliedCouponState] = useState(null);

  // Load persisted coupon from sessionStorage/localStorage
  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" && (sessionStorage.getItem("hok_applied_coupon") || localStorage.getItem("hok_applied_coupon"));
      if (stored) {
        setAppliedCouponState(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading stored coupon:", e);
    }
  }, []);

  const setAppliedCoupon = (coupon) => {
    setAppliedCouponState(coupon);
    try {
      if (typeof window !== "undefined") {
        if (coupon) {
          sessionStorage.setItem("hok_applied_coupon", JSON.stringify(coupon));
          localStorage.setItem("hok_applied_coupon", JSON.stringify(coupon));
        } else {
          sessionStorage.removeItem("hok_applied_coupon");
          localStorage.removeItem("hok_applied_coupon");
        }
      }
    } catch (e) {
      console.error("Error saving applied coupon:", e);
    }
  };

  const [cartOpen, setCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart/wishlist
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated) {
        try {
          // Sync any guest cart items from localStorage to backend
          const storedCart = localStorage.getItem("hok_cart");
          if (storedCart) {
            try {
              const guestItems = JSON.parse(storedCart);
              if (Array.isArray(guestItems) && guestItems.length > 0) {
                for (const item of guestItems) {
                  if (item.variantId) {
                    try {
                      await cartApi.addItem(String(item.variantId), item.quantity || 1);
                    } catch (err) {
                      console.error("Error syncing guest cart item to backend:", err);
                    }
                  }
                }
              }
            } catch (err) {
              console.error("Error parsing guest cart:", err);
            }
            localStorage.removeItem("hok_cart");
          }

          // Sync any guest wishlist items from localStorage to backend
          const storedWishlist = localStorage.getItem("hok_wishlist");
          if (storedWishlist) {
            try {
              const guestWishlist = JSON.parse(storedWishlist);
              if (Array.isArray(guestWishlist) && guestWishlist.length > 0) {
                for (const productId of guestWishlist) {
                  try {
                    await wishlistApi.toggle(String(productId));
                  } catch (err) {
                    console.error("Error syncing guest wishlist item to backend:", err);
                  }
                }
              }
            } catch (err) {
              console.error("Error parsing guest wishlist:", err);
            }
            localStorage.removeItem("hok_wishlist");
          }

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
    if (!product) return;
    const variants = product.variants || [];
    const variant =
      variants.find((v) => v.title === size || v.option1 === size) ||
      variants[0] ||
      { id: `${product.id}-${size || "M"}`, title: size || "M", option1: size || "M", price: product.price || 0 };
    const variantId = variant.id || `${product.id}-${size || "M"}`;

    // Always update local cart state first so UI responds immediately
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.variantId === variantId,
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity = Math.min(
          newCart[existingItemIndex].quantity + qty,
          MAX_QTY_PER_ITEM,
        );
        return newCart;
      } else {
        return [
          ...prevCart,
          { product, variantId, quantity: Math.min(qty, MAX_QTY_PER_ITEM), selectedSize: size || variant.option1 || "M" },
        ];
      }
    });

    setCartOpen(true);

    if (isAuthenticated && variant.id && !variant.id.includes("-")) {
      try {
        await cartApi.addItem(String(variant.id), qty);
      } catch (e) {
        console.error("Error syncing to backend cart:", e);
      }
    }
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

    const cappedQuantity = Math.min(quantity, MAX_QTY_PER_ITEM);

    if (isAuthenticated) {
      try {
        const backendCartRes = await cartApi.get();
        if (backendCartRes.success && backendCartRes.data) {
          const backendItems = backendCartRes.data.items || [];
          const matchedBackendItem = backendItems.find(
            (bi) => bi.variant.id === variantId,
          );
          if (matchedBackendItem) {
            await cartApi.updateItem(matchedBackendItem.id, cappedQuantity);
          }
        }
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.variantId === variantId ? { ...item, quantity: cappedQuantity } : item,
          ),
        );
      } catch (e) {
        console.error("Error updating backend cart quantity:", e);
      }
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.variantId === variantId ? { ...item, quantity: cappedQuantity } : item,
        ),
      );
    }
  };

  const updateItemSize = async (oldVariantId, newSize, product) => {
    if (!newSize) return;
    const normalizedSize = String(newSize).toUpperCase();
    const variants = product?.variants || [];
    const matchedVariant = variants.find(
      (v) => (v.option1 || v.size || v.title || "").toString().toUpperCase() === normalizedSize
    );

    const newVariantId = matchedVariant
      ? matchedVariant.id
      : product?.id
        ? `${product.id}-${normalizedSize}`
        : `${oldVariantId}-${normalizedSize}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => String(item.variantId) === String(oldVariantId)
      );
      if (existingIndex === -1) return prevCart;

      const currentItem = prevCart[existingIndex];
      const targetQty = currentItem.quantity;

      const sameVariantIndex = prevCart.findIndex(
        (item, idx) =>
          String(item.variantId) === String(newVariantId) && idx !== existingIndex
      );

      if (sameVariantIndex > -1 && String(newVariantId) !== String(oldVariantId)) {
        const updated = prevCart.filter((_, idx) => idx !== existingIndex);
        return updated.map((item) =>
          String(item.variantId) === String(newVariantId)
            ? {
                ...item,
                selectedSize: normalizedSize,
                quantity: Math.min(item.quantity + targetQty, MAX_QTY_PER_ITEM),
              }
            : item
        );
      } else {
        return prevCart.map((item, idx) =>
          idx === existingIndex
            ? {
                ...item,
                variantId: newVariantId,
                selectedSize: normalizedSize,
                ...(matchedVariant ? { variant: matchedVariant } : {}),
              }
            : item
        );
      }
    });

    if (isAuthenticated && String(newVariantId) !== String(oldVariantId)) {
      try {
        const backendCartRes = await cartApi.get();
        if (backendCartRes.success && backendCartRes.data) {
          const backendItems = backendCartRes.data.items || [];
          const matchedBackendItem = backendItems.find(
            (bi) => String(bi.variant.id) === String(oldVariantId)
          );
          if (matchedBackendItem) {
            await cartApi.removeItem(matchedBackendItem.id);
          }
          if (matchedVariant?.id) {
            await cartApi.addItem(String(matchedVariant.id), 1);
          }
        }
      } catch (e) {
        console.error("Error updating size in backend cart:", e);
      }
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
    setAppliedCoupon(null);
  };

  const cartCount = cart.reduce((total, item) => total + (item?.quantity || 0), 0);

  const cartTotal = cart.reduce((total, item) => {
    if (!item) return total;
    const variants = item.product?.variants || [];
    const variant =
      variants.find((v) => v.id === item.variantId) ||
      variants[0];
    const priceNum = parseFloat(variant?.price || item.price || 0);
    return total + (isNaN(priceNum) ? 0 : priceNum) * (item.quantity || 1);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        cartOpen,
        setCartOpen,
        appliedCoupon,
        setAppliedCoupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemSize,
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
