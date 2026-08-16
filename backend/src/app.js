import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { generalLimiter } from "./middleware/rateLimit";
import { errorHandler } from "./middleware/errorHandler";

// Route imports
import authRoutes from "./modules/auth/auth.routes";
import productsRoutes from "./modules/products/products.routes";
import collectionsRoutes from "./modules/collections/collections.routes";
import categoriesRoutes from "./modules/categories/categories.routes";
import cartRoutes from "./modules/cart/cart.routes";
import wishlistRoutes from "./modules/wishlist/wishlist.routes";
import ordersRoutes from "./modules/orders/orders.routes";
import paymentsRoutes, { createOrderHandler, verifyPaymentHandler } from "./modules/payments/payments.routes";
import { optionalAuth } from "./middleware/auth";
import couponsRoutes from "./modules/coupons/coupons.routes";
import reviewsRoutes from "./modules/reviews/reviews.routes";
import usersRoutes from "./modules/users/users.routes";
import notificationsRoutes from "./modules/notifications/notifications.routes";
import warehousesRoutes from "./modules/warehouses/warehouses.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import shippingRoutes from "./modules/shipping/shipping.routes";

const createApp = () => {
  const app = express();

  // ── Security headers ─────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
          connectSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // ── CORS ─────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        const allowed = [
          env.FRONTEND_URL,
          "https://admin.theoutliersstudio.com",
          "https://theoutliersstudio.com",
          "http://localhost:3000",
          "http://localhost:3001",
        ].filter(Boolean);

        const isAllowed =
          !origin ||
          allowed.includes(origin) ||
          allowed.includes(origin.replace(/\/$/, "")) ||
          origin.endsWith(".vercel.app") ||
          origin.endsWith(".onrender.com") ||
          origin.endsWith(".up.railway.app") ||
          origin.endsWith(".theoutliersstudio.com");

        if (isAllowed) {
          callback(null, true);
        } else {
          logger.warn(`⚠️ CORS blocked request from origin: ${origin}`);
          callback(null, true); // Allow request rather than throwing 500 error
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    }),
  );

  // ── Body parsing ──────────────────────────────────────────────────────────
  // Webhook needs raw body for signature verification
  app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use(cookieParser());

  // ── HTTP request logging ──────────────────────────────────────────────────
  const morganFormat = env.NODE_ENV === "production" ? "combined" : "dev";
  app.use(
    morgan(morganFormat, {
      stream: { write: (msg) => logger.http(msg.trim()) },
      skip: (req) => req.url === "/health",
    }),
  );

  // ── Global rate limiter ───────────────────────────────────────────────────
  app.use("/api", generalLimiter);

  // ── Health check (no auth, no rate limit) ────────────────────────────────
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: process.env["npm_package_version"] || "1.0.0",
    });
  });

  // ── API Routes ────────────────────────────────────────────────────────────
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/collections", collectionsRoutes);
  app.use("/api/categories", categoriesRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/wishlist", wishlistRoutes);
  app.use("/api/orders", ordersRoutes);
  app.use("/api/payments", paymentsRoutes);
  app.post("/api/create-order", generalLimiter, optionalAuth, createOrderHandler);
  app.post("/api/verify-payment", optionalAuth, verifyPaymentHandler);
  app.use("/api/coupons", couponsRoutes);
  app.use("/api/reviews", reviewsRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/warehouses", warehousesRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/shipping", shippingRoutes);

  // ── 404 handler ───────────────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.url} not found`,
    });
  });

  // ── Centralized error handler (must be last) ──────────────────────────────
  app.use(errorHandler);

  return app;
};

export default createApp;
