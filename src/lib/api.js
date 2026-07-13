/**
 * Central API client for Tevar backend.
 * All fetch calls go through this so base URL, credentials,
 * and error normalization are handled in one place.
 */

const API_BASE_URL =
  typeof window === "undefined"
    ? process.env["BACKEND_URL"] || "http://localhost:4000"
    : "";

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.message = message;
    this.status = status;
    this.errors = errors;
    this.name = "ApiError";
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Always send cookies (for HTTP-only JWT)
    ...options,
  };

  try {
    const res = await fetch(url, config);

    let data;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = {
        success: false,
        message: res.statusText || "Server error",
        errors: { server: [text.slice(0, 100)] },
      };
    }

    if (!res.ok) {
      throw new ApiError(
        data.message || "Request failed",
        res.status,
        data.errors,
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network error",
      503,
    );
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { method: "GET", ...options }),

  post: (endpoint, body, options) =>
    request(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  patch: (endpoint, body, options) =>
    request(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: (endpoint, options) =>
    request(endpoint, { method: "DELETE", ...options }),
};

// ─── Typed API helpers ────────────────────────────────────────────────────────

export const authApi = {
  register: (data) => api.post("/api/auth/register", data),

  login: (data) => api.post("/api/auth/login", data),

  logout: () => api.post("/api/auth/logout"),

  me: () => api.get("/api/auth/me"),

  refresh: () => api.post("/api/auth/refresh"),

  forgotPassword: (email) => api.post("/api/auth/forgot-password", { email }),

  resetPassword: (token, password) =>
    api.post("/api/auth/reset-password", { token, password }),
};

export const productsApi = {
  list: (params) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return api.get(`/api/products${qs}`);
  },

  getByHandle: (handle) => api.get(`/api/products/${handle}`),

  search: (q) => api.get(`/api/products/search?q=${encodeURIComponent(q)}`),
};

export const collectionsApi = {
  list: () => api.get("/api/collections"),
  getByHandle: (handle, page = 1, limit = 24) =>
    api.get(`/api/collections/${handle}?page=${page}&limit=${limit}`),
};

export const cartApi = {
  get: () => api.get("/api/cart"),
  addItem: (variantId, quantity = 1) =>
    api.post("/api/cart/items", { variantId, quantity }),
  updateItem: (itemId, quantity) =>
    api.patch(`/api/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/api/cart/items/${itemId}`),
  clear: () => api.delete("/api/cart"),
};

export const wishlistApi = {
  get: () => api.get("/api/wishlist"),
  toggle: (productId) => api.post(`/api/wishlist/${productId}`),
  remove: (productId) => api.delete(`/api/wishlist/${productId}`),
};

export const ordersApi = {
  create: (data) => api.post("/api/orders", data),
  list: (page = 1) => api.get(`/api/orders?page=${page}`),
  get: (id) => api.get(`/api/orders/${id}`),
};

export const paymentsApi = {
  createOrder: (orderId) => api.post("/api/payments/create-order", { orderId }),
  verify: (data) => api.post("/api/payments/verify", data),
};

export const couponsApi = {
  validate: (code, orderTotal) =>
    api.post("/api/coupons/validate", { code, orderTotal }),
};

export const reviewsApi = {
  list: (productId, page = 1) =>
    api.get(`/api/reviews?productId=${productId}&page=${page}`),
  create: (data) => api.post("/api/reviews", data),
};
