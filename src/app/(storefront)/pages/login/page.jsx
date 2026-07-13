"use strict";
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  X,
  Check,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, isAuthenticated } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password Validation Criteria Checks
  const isMinLength = registerPassword.length >= 8;
  const hasAlphaNum =
    /[a-zA-Z]/.test(registerPassword) && /[0-9]/.test(registerPassword);

  // Status state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect home
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await login(loginEmail, loginPassword);
      setSuccess("Logged in successfully! Redirecting...");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err) {
      setError(err?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!isMinLength || !hasAlphaNum) {
      setError("Password does not meet the complexity requirements.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await register({
        name: registerEmail.split("@")[0], // Fallback name
        email: registerEmail,
        password: registerPassword,
      });
      setSuccess("Account created successfully! Redirecting to homepage...");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen relative bg-gradient-to-tr from-[#f1f5f9] via-[#e2e8f0] to-[#cbd5e1] flex items-center justify-center p-4 overflow-x-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0)_100%)] pointer-events-none" />

      {/* Close button in top right */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/70 hover:bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all shadow-sm backdrop-blur-sm cursor-pointer z-20"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Card Container */}
      <div className="w-full max-w-[450px] bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-white/60 p-8 md:p-10 flex flex-col items-center gap-6 relative z-10">
        {/* Logo and Brand Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md">
            <svg
              className="w-5.5 h-5.5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
            Tevar
          </span>
        </div>

        {/* Welcome Messages */}
        <div className="text-center space-y-1.5 w-full">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 transition-all duration-300">
            {activeTab === "register"
              ? "Create Your Account!"
              : "Welcome Back Creative!"}
          </h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            {activeTab === "register"
              ? "We are happy to have you join us"
              : "We Are Happy To See You Again"}
          </p>
        </div>

        {/* Tab Switcher (Sign in / Sign Up) */}
        <div className="w-full bg-[#f1f5f9] border border-slate-100 rounded-full p-1 flex relative">
          <button
            onClick={() => {
              setActiveTab("login");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 text-center py-2.5 rounded-full text-xs font-semibold transition-all duration-300 relative z-10 ${
              activeTab === "login"
                ? "text-white"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => {
              setActiveTab("register");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 text-center py-2.5 rounded-full text-xs font-semibold transition-all duration-300 relative z-10 ${
              activeTab === "register"
                ? "text-white"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sign Up
          </button>

          {/* Sliding Blue Pill Background */}
          <div
            className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-blue-600 rounded-full transition-all duration-300 ease-out z-0 ${
              activeTab === "register" ? "translate-x-[100%]" : "translate-x-0"
            }`}
          />
        </div>

        {/* Alerts for Status */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="bg-red-50 text-red-600 p-3 rounded-2xl flex items-start gap-2.5 text-xs font-semibold border border-red-100"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl flex items-start gap-2.5 text-xs font-semibold border border-emerald-100"
              >
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Forms Panel */}
        <div className="w-full relative min-h-[220px]">
          <AnimatePresence mode="wait">
            {activeTab === "login" ? (
              <motion.form
                key="login-form-gradiator"
                onSubmit={handleLoginSubmit}
                initial={shouldReduceMotion ? {} : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4 w-full"
              >
                {/* Email Input */}
                <div className="relative w-full">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={loading}
                    className="w-full bg-[#f8fafc] border border-slate-200/60 rounded-full px-5 py-3.5 pr-12 text-xs placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-slate-800"
                  />

                  <Mail className="absolute right-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                </div>

                {/* Password Input */}
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={loading}
                    className="w-full bg-[#f8fafc] border border-slate-200/60 rounded-full px-5 py-3.5 pr-12 text-xs placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-slate-800"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>

                {/* Remember / Forgot password */}
                <div className="flex items-center justify-between px-1 text-xs select-none">
                  <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded-full border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 transition-all cursor-pointer"
                      defaultChecked
                    />
                    Remember me
                  </label>
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Reset password feature coming soon!");
                    }}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-full text-xs transition-all duration-200 disabled:opacity-50 active:scale-[0.98] mt-2 cursor-pointer shadow-md shadow-blue-500/10"
                >
                  {loading ? "Signing in..." : "Login"}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="register-form-gradiator"
                onSubmit={handleRegisterSubmit}
                initial={shouldReduceMotion ? {} : { opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4 w-full"
              >
                {/* Email Input */}
                <div className="relative w-full">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    disabled={loading}
                    className="w-full bg-[#f8fafc] border border-slate-200/60 rounded-full px-5 py-3.5 pr-12 text-xs placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-slate-800"
                  />

                  <Mail className="absolute right-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                </div>

                {/* Password Input */}
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    disabled={loading}
                    className="w-full bg-[#f8fafc] border border-slate-200/60 rounded-full px-5 py-3.5 pr-12 text-xs placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-slate-800"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>

                {/* Password Validation Requirements */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[10px] text-slate-500 flex flex-col gap-2 font-medium">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Password must contain:
                  </span>

                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${isMinLength ? "bg-emerald-500 text-white shadow-sm" : "bg-slate-200 text-slate-400"}`}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>Minimum 8 characters</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${hasAlphaNum ? "bg-emerald-500 text-white shadow-sm" : "bg-slate-200 text-slate-400"}`}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>Must have alphabetic & numeric characters</span>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="relative w-full">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="w-full bg-[#f8fafc] border border-slate-200/60 rounded-full px-5 py-3.5 pr-12 text-xs placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-slate-800"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-full text-xs transition-all duration-200 disabled:opacity-50 active:scale-[0.98] mt-2 cursor-pointer shadow-md shadow-blue-500/10"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Separator */}
        <div className="w-full relative flex items-center py-2 select-none">
          <div className="flex-grow border-t border-slate-200/80"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold tracking-wider uppercase font-mono">
            OR
          </span>
          <div className="flex-grow border-t border-slate-200/80"></div>
        </div>

        {/* Social logins */}
        <div className="w-full flex flex-col gap-3">
          {/* Apple ID login */}
          <button
            type="button"
            onClick={() => alert("Apple authentication coming soon!")}
            className="w-full flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full py-3.5 px-5 text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.74-1.2 1.88-1.05 3 .98.08 2.14-.54 2.8-.29" />
            </svg>
            Log in with Apple
          </button>

          {/* Google login */}
          <button
            type="button"
            onClick={() => alert("Google authentication coming soon!")}
            className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-full py-3.5 px-5 text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Log in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
