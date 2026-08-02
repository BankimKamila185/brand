'use strict';
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, CheckCircle, Eye, EyeOff, Check, KeyRound } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { resetPassword, isAuthenticated } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Complexity validation indicators
  const isMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const doPasswordsMatch = password.length > 0 && password === confirmPassword;

  // Redirect logged-in users to home
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing or invalid. Please request a new password reset link.');
      return;
    }

    if (!isMinLength || !hasUppercase || !hasNumber) {
      setError('Password does not meet complexity requirements.');
      return;
    }

    if (!doPasswordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err?.message || 'Failed to reset password. The reset link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-100 flex flex-col gap-6">
        
        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center mb-1">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
            Set New Password
          </h1>
          <p className="text-xs text-neutral-500 font-medium">
            Please enter and confirm your new password below.
          </p>
        </div>

        {/* Missing Token Alert */}
        {!token && (
          <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl flex items-start gap-2.5 text-xs font-medium border border-amber-200/60">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span>No reset token provided. If you requested a reset link, please click the link in your email.</span>
              <div className="mt-2">
                <Link href="/login?mode=forgot" className="font-bold underline hover:text-amber-900">
                  Request new reset link &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="bg-red-50 text-red-600 p-3.5 rounded-2xl flex items-start gap-2 text-xs font-semibold border border-red-100"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success View */}
        {success ? (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-5 py-4"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-lg font-bold text-neutral-900">Password Reset Successful!</h2>
              <p className="text-xs text-neutral-500 font-medium">
                Your password has been updated and all previous sessions have been revoked. You can now log in with your new password.
              </p>
            </div>
            <Link
              href="/login"
              className="w-full py-3.5 px-6 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider text-center transition-all shadow-md mt-2"
            >
              Proceed to Login
            </Link>
          </motion.div>
        ) : (
          /* Reset Password Form */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* New Password Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || !token}
                  className="w-full h-11 px-4 pr-11 rounded-2xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:bg-white focus:border-neutral-900 focus:outline-none transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Validation Checklist */}
            <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100 flex flex-col gap-1.5 text-xs text-neutral-600 font-medium">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Requirements:</span>
              <div className="flex items-center gap-2">
                <Check className={`w-3.5 h-3.5 ${isMinLength ? 'text-emerald-500' : 'text-neutral-300'}`} />
                <span className={isMinLength ? 'text-neutral-900 font-semibold' : ''}>At least 8 characters</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className={`w-3.5 h-3.5 ${hasUppercase ? 'text-emerald-500' : 'text-neutral-300'}`} />
                <span className={hasUppercase ? 'text-neutral-900 font-semibold' : ''}>Contains an uppercase letter</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-500' : 'text-neutral-300'}`} />
                <span className={hasNumber ? 'text-neutral-900 font-semibold' : ''}>Contains a number</span>
              </div>
            </div>

            {/* Confirm New Password Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading || !token}
                  className="w-full h-11 px-4 pr-11 rounded-2xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:bg-white focus:border-neutral-900 focus:outline-none transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <span className={`text-[11px] font-semibold ${doPasswordsMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                  {doPasswordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full h-12 rounded-2xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md mt-2 cursor-pointer"
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="text-center pt-2 select-none border-t border-neutral-100">
          <Link href="/login" className="text-xs text-neutral-500 hover:text-neutral-900 font-bold">
            &larr; Return to Login
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#F8F7F5] font-display uppercase tracking-wider text-sm font-bold text-neutral-600">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
