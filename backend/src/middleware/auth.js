import { verifyAccessToken } from "../utils/tokens";
import { AppError } from "./errorHandler";
import { db } from "../config/database";

// Extend Express Request type

/**
 * Verifies the JWT access token from:
 * 1. HTTP-only cookie (`access_token`)
 * 2. Authorization header (`Bearer <token>`)
 */
export const authenticate = async (req, _res, next) => {
  try {
    let token;

    // Prefer cookie over header
    if (req.cookies?.access_token) {
      token = req.cookies.access_token;
    } else {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    const payload = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await db.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, isActive: true, role: true },
    });

    if (!user || !user.isActive) {
      throw new AppError("Account not found or deactivated", 401);
    }

    req.user = { ...payload, dbRole: user.role };
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Optional auth — attaches user if token present, but doesn't block
 */
export const optionalAuth = async (req, _res, next) => {
  try {
    let token;

    if (req.cookies?.access_token) {
      token = req.cookies.access_token;
    } else {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    if (token) {
      const payload = verifyAccessToken(token);
      req.user = payload;
    }
  } catch {
    // Ignore auth errors for optional routes
  }
  next();
};

/**
 * Role-based access control — must come after `authenticate`
 */
export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) {
      next(new AppError("Authentication required", 401));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError("Insufficient permissions", 403));
      return;
    }
    next();
  };

export const requireAdmin = authorize("ADMIN", "SUPER_ADMIN");
export const requireSuperAdmin = authorize("SUPER_ADMIN");
