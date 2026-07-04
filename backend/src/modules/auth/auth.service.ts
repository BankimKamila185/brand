import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/tokens';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../../utils/email';
import { logger } from '../../utils/logger';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from './auth.schema';

export const authService = {
  async register(data: RegisterInput) {
    const existingUser = await db.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        emailVerifyToken: verifyToken,
        emailVerifyExpires: verifyExpires,
      },
      select: { id: true, name: true, email: true, role: true, emailVerified: true },
    });

    // Create empty cart for user
    await db.cart.create({ data: { userId: user.id } });

    // Send verification email (non-blocking)
    sendVerificationEmail(user.email, user.name, verifyToken).catch((e) =>
      logger.error('Failed to send verification email:', e),
    );

    return user;
  },

  async login(data: LoginInput) {
    const user = await db.user.findUnique({ where: { email: data.email } });
    if (!user || !user.isActive) {
      throw new AppError('Invalid email or password', 401);
    }

    const passwordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!passwordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const { token: refreshToken } = generateRefreshToken(user.id);

    // Store hashed refresh token
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await db.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash: refreshHash,
        lastLoginAt: new Date(),
      },
    });

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      avatar: user.avatar,
    };

    return { accessToken, refreshToken, user: userPayload };
  },

  async refreshToken(token: string) {
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await db.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive || !user.refreshTokenHash) {
      throw new AppError('Invalid refresh token', 401);
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    if (tokenHash !== user.refreshTokenHash) {
      // Token reuse detected — revoke all tokens
      await db.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: null },
      });
      throw new AppError('Refresh token reuse detected. Please log in again.', 401);
    }

    // Rotate tokens
    const newAccessToken = generateAccessToken(user.id, user.email, user.role);
    const { token: newRefreshToken } = generateRefreshToken(user.id);
    const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    await db.user.update({ where: { id: user.id }, data: { refreshTokenHash: newHash } });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async verifyEmail(token: string) {
    const user = await db.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpires: { gt: new Date() },
        emailVerified: false,
      },
    });

    if (!user) {
      throw new AppError('Invalid or expired verification link', 400);
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });

    return { message: 'Email verified successfully' };
  },

  async forgotPassword(data: ForgotPasswordInput) {
    const user = await db.user.findUnique({ where: { email: data.email } });
    // Always return success to prevent email enumeration
    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.user.update({
      where: { id: user.id },
      data: { passwordResetToken: resetToken, passwordResetExpires: resetExpires },
    });

    sendPasswordResetEmail(user.email, user.name, resetToken).catch((e) =>
      logger.error('Failed to send password reset email:', e),
    );
  },

  async resetPassword(data: ResetPasswordInput) {
    const user = await db.user.findFirst({
      where: {
        passwordResetToken: data.token,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new AppError('Invalid or expired password reset link', 400);
    }

    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        refreshTokenHash: null, // Revoke all sessions
      },
    });
  },

  async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const currentValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!currentValid) throw new AppError('Current password is incorrect', 400);

    const newHash = await bcrypt.hash(data.newPassword, env.BCRYPT_ROUNDS);
    await db.user.update({
      where: { id: userId },
      data: { passwordHash: newHash, refreshTokenHash: null },
    });
  },

  async logout(userId: string) {
    await db.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  },
};
