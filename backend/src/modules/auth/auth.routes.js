import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/auth.js";
import { authLimiter } from "../../middleware/rateLimit.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  socialLoginSchema,
} from "./auth.schema.js";

const router = Router();

// Public routes (with strict rate limiting)
router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  authController.register,
);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/social-login", authLimiter, validate(socialLoginSchema), authController.socialLogin);
router.post("/refresh", authController.refresh);
router.get("/verify-email/:token", authController.verifyEmail);
router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword,
);

// Protected routes
router.get("/me", authenticate, authController.me);
router.post("/logout", authenticate, authController.logout);
router.patch(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);

export default router;
