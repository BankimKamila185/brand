import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { v4 as uuidv4 } from "uuid";

export const generateAccessToken = (userId, email, role) => {
  const payload = { sub: userId, email, role };
  const options = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const generateRefreshToken = (userId) => {
  const jti = uuidv4();
  const payload = { sub: userId, jti };
  const options = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  };
  const token = jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
  return { token, jti };
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};

// Cookie configuration for refresh token
export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/api/auth",
};

export const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: "/",
};
