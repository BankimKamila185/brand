import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import { v4 as uuidv4 } from 'uuid';

export interface AccessTokenPayload {
  sub: string;      // user id
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;      // user id
  jti: string;      // unique token id for revocation
  iat?: number;
  exp?: number;
}

export const generateAccessToken = (
  userId: string,
  email: string,
  role: string,
): string => {
  const payload: AccessTokenPayload = { sub: userId, email, role };
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const generateRefreshToken = (userId: string): { token: string; jti: string } => {
  const jti = uuidv4();
  const payload: RefreshTokenPayload = { sub: userId, jti };
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  };
  const token = jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
  return { token, jti };
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
};

export const decodeToken = (token: string): JwtPayload | null => {
  return jwt.decode(token) as JwtPayload | null;
};

// Cookie configuration for refresh token
export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth',
};

export const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: '/',
};
