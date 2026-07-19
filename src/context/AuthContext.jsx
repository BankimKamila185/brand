"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authApi, ApiError } from "../lib/api";
import { auth } from "../lib/firebase";
import { signInWithPopup, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try to restore session from cookie on mount
  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.me();
      if (res.data) setUser(res.data);
    } catch {
      // No valid session — user is a guest
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUser().finally(() => { setIsLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data?.user) {
      setUser(res.data.user);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
    }
  }, []);

  const register = useCallback(async (data) => {
    await authApi.register(data);
    // Don't auto-login — user must verify email first
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    const res = await authApi.socialLogin(idToken);
    if (res.data?.user) {
      setUser(res.data.user);
    }
  }, []);

  const loginWithApple = useCallback(async () => {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    const res = await authApi.socialLogin(idToken);
    if (res.data?.user) {
      setUser(res.data.user);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        refreshUser,
        loginWithGoogle,
        loginWithApple,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export { ApiError };
