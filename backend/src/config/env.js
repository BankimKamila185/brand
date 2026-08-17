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
  JWT_SECRET: z
    .string()
    .default("tevar_production_default_jwt_secret_key_32_characters_long_min")
    .transform((val) => val || "tevar_production_default_jwt_secret_key_32_characters_long_min"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("365d").transform((val) => val || "365d"),
  JWT_REFRESH_SECRET: z
    .string()
    .default("tevar_production_default_jwt_refresh_key_32_characters_long_min")
    .transform((val) => val || "tevar_production_default_jwt_refresh_key_32_characters_long_min"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("365d").transform((val) => val || "365d"),

  // Email (Brevo API Key or SMTP)
  BREVO_API_KEY: z.string().optional(),
  ADMIN_EMAIL: z.string().default("support@theoutliersstudio.com"),
  SMTP_HOST: z.string().default("smtp-relay.brevo.com"),
  SMTP_PORT: z.string().default("587").transform(Number),
  SMTP_USER: z.string().default("b3eb4b001@smtp-brevo.com"),
  SMTP_PASS: z.string().default(""),
  SMTP_FROM: z
    .string()
    .default("The Outliers Studio <hello@theoutliersstudio.com>"),

  // Velocity Shipping API
  VELOCITY_BASE_URL: z.string().default("https://shazam.velocity.in"),
  VELOCITY_USERNAME: z.string().default("+917304406772"),
  VELOCITY_PASSWORD: z.string().default(""),
  VELOCITY_WAREHOUSE_ID: z.string().default(""),
  VELOCITY_PICKUP_LOCATION: z.string().default("Tevar Warehouse"),
  VELOCITY_PICKUP_PINCODE: z.string().default("400097"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().default(""),
  CLOUDINARY_API_KEY: z.string().default(""),
  CLOUDINARY_API_SECRET: z.string().default(""),

  // Razorpay
  RAZORPAY_KEY_ID: z
    .string()
    .default("rzp_test_TQaQrXu8OGLWjA")
    .transform((val) => val || "rzp_test_TQaQrXu8OGLWjA"),
  RAZORPAY_KEY_SECRET: z
    .string()
    .default("iuMKmMcJA4OpF8yZYiwleRRk")
    .transform((val) => val || "iuMKmMcJA4OpF8yZYiwleRRk"),

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

  // Cloudflare R2
  R2_ACCOUNT_ID: z.string().default(""),
  R2_ACCESS_KEY_ID: z.string().default(""),
  R2_SECRET_ACCESS_KEY: z.string().default(""),
  R2_BUCKET_NAME: z.string().default(""),
  R2_PUBLIC_URL: z.string().default(""),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:");
  console.error(_env.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = _env.data;
