import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

// General API rate limit: 100 req / 15 min
export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  skip: (req) => env.NODE_ENV === 'test' || req.ip === '127.0.0.1',
});

// Strict limit for auth endpoints: 10 req / 15 min
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
  },
  skip: () => env.NODE_ENV === 'test',
});

// Payment endpoints: 20 req / 15 min
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many payment requests, please try again later',
  },
  skip: () => env.NODE_ENV === 'test',
});
