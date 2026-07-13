import { Request, Response } from 'express';
import { authService } from './auth.service';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess, sendCreated, sendError } from '../../utils/response';
import {
  REFRESH_COOKIE_OPTIONS,
  ACCESS_COOKIE_OPTIONS,
} from '../../utils/tokens';

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.register(req.body);
    sendCreated(res, user, 'Account created. Please check your email to verify your account.');
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { accessToken, refreshToken, user } = await authService.login(req.body);

    // Set tokens as HTTP-only cookies
    res.cookie('access_token', accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);

    sendSuccess(res, { user, accessToken }, 'Login successful');
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.refresh_token as string | undefined;

    if (!token) {
      sendError(res, 'Refresh token missing', 401);
      return;
    }

    const { accessToken, refreshToken } = await authService.refreshToken(token);

    res.cookie('access_token', accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);

    sendSuccess(res, { accessToken }, 'Token refreshed');
  }),

  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const result = await authService.verifyEmail(token);
    sendSuccess(res, result, 'Email verified successfully');
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body);
    // Always return success (prevent email enumeration)
    sendSuccess(res, null, 'If an account with that email exists, a reset link has been sent.');
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body);
    sendSuccess(res, null, 'Password reset successfully. Please log in with your new password.');
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.changePassword(req.user!.sub, req.body);
    sendSuccess(res, null, 'Password changed successfully. All sessions have been revoked.');
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    if (req.user) {
      await authService.logout(req.user.sub);
    }
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/api/auth' });
    sendSuccess(res, null, 'Logged out successfully');
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, req.user, 'User info retrieved');
  }),
};
