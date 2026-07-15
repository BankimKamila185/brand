// ─── Environment variable validation & loading ─────────────────────────────
// All env vars are validated at startup. Missing required vars crash the app
// immediately rather than failing silently at runtime.

import { z } from "zod";

const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("4000").transform(Number),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Redis
  REDIS_URL: z.string().default("redis://localhost:6379"),

  // JWT
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // Email
  SMTP_HOST: z.string().default("smtp.ethereal.email"),
  SMTP_PORT: z.string().default("587").transform(Number),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  SMTP_FROM: z.string().default("Tevar <noreply@tevar.in>"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().default(""),
  CLOUDINARY_API_KEY: z.string().default(""),
  CLOUDINARY_API_SECRET: z.string().default(""),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().default(""),
  RAZORPAY_KEY_SECRET: z.string().default(""),

  // Frontend
  FRONTEND_URL: z.string().default("http://localhost:3000"),

  // Security
  BCRYPT_ROUNDS: z.string().default("12").transform(Number),
  RATE_LIMIT_WINDOW_MS: z.string().default("900000").transform(Number),
  RATE_LIMIT_MAX: z.string().default("100").transform(Number),

  // Firebase Admin
  FIREBASE_DATABASE_URL: z.string().optional(),
  FIREBASE_SERVICE_ACCOUNT_KEY: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:");
  console.error(_env.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = _env.data;
