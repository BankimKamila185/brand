/**
 * Central API client for Tevar backend.
 * All fetch calls go through this so base URL, credentials,
 * and error normalization are handled in one place.
 */

const API_BASE_URL =
  process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:4000';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Always send cookies (for HTTP-only JWT)
    ...options,
  };

  const res = await fetch(url, config);
  const data = (await res.json()) as ApiResponse<T>;

  if (!res.ok) {
    throw new ApiError(
      data.message || 'Request failed',
      res.status,
      data.errors,
    );
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
};

// ─── Typed API helpers ────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  emailVerified: boolean;
  avatar?: string;
}

export interface BackendProduct {
  id: string;
  title: string;
  handle: string;
  description?: string;
  productType: string;
  vendor: string;
  tags: string[];
  isActive: boolean;
  category?: { id: string; name: string; slug: string };
  variants: BackendVariant[];
  images: BackendImage[];
  _count?: { reviews: number };
}

export interface BackendVariant {
  id: string;
  title: string;
  option1?: string;
  option2?: string;
  price: string;
  comparePrice?: string;
  position: number;
  inventory?: { quantity: number; reserved?: number };
}

export interface BackendImage {
  id: string;
  src: string;
  altText?: string;
  width: number;
  height: number;
  position: number;
}

export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post<User>('/api/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ user: User; accessToken: string }>('/api/auth/login', data),

  logout: () => api.post('/api/auth/logout'),

  me: () => api.get<User>('/api/auth/me'),

  refresh: () => api.post<{ accessToken: string }>('/api/auth/refresh'),

  forgotPassword: (email: string) =>
    api.post('/api/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/api/auth/reset-password', { token, password }),
};

export const productsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get<BackendProduct[]>(`/api/products${qs}`);
  },

  getByHandle: (handle: string) =>
    api.get<BackendProduct>(`/api/products/${handle}`),

  search: (q: string) =>
    api.get<BackendProduct[]>(`/api/products/search?q=${encodeURIComponent(q)}`),
};

export const collectionsApi = {
  list: () => api.get('/api/collections'),
  getByHandle: (handle: string, page = 1, limit = 24) =>
    api.get(`/api/collections/${handle}?page=${page}&limit=${limit}`),
};

export const cartApi = {
  get: () => api.get('/api/cart'),
  addItem: (variantId: string, quantity = 1) =>
    api.post('/api/cart/items', { variantId, quantity }),
  updateItem: (itemId: string, quantity: number) =>
    api.patch(`/api/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => api.delete(`/api/cart/items/${itemId}`),
  clear: () => api.delete('/api/cart'),
};

export const wishlistApi = {
  get: () => api.get('/api/wishlist'),
  toggle: (productId: string) => api.post(`/api/wishlist/${productId}`),
  remove: (productId: string) => api.delete(`/api/wishlist/${productId}`),
};

export const ordersApi = {
  create: (data: { addressId: string; couponCode?: string; notes?: string }) =>
    api.post('/api/orders', data),
  list: (page = 1) => api.get(`/api/orders?page=${page}`),
  get: (id: string) => api.get(`/api/orders/${id}`),
};

export const paymentsApi = {
  createOrder: (orderId: string) =>
    api.post('/api/payments/create-order', { orderId }),
  verify: (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    orderId: string;
  }) => api.post('/api/payments/verify', data),
};

export const couponsApi = {
  validate: (code: string, orderTotal: number) =>
    api.post('/api/coupons/validate', { code, orderTotal }),
};

export const reviewsApi = {
  list: (productId: string, page = 1) =>
    api.get(`/api/reviews?productId=${productId}&page=${page}`),
  create: (data: { productId: string; rating: number; title?: string; body?: string }) =>
    api.post('/api/reviews', data),
};
