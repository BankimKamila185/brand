'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, CheckCircle, Eye, EyeOff, X, Check } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, isAuthenticated } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const [activeTab, setActiveTab] = useState('register');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Validation Criteria Checks
  const isMinLength = registerPassword.length >= 8;
  const hasAlphaNum = /[a-zA-Z]/.test(registerPassword) && /[0-9]/.test(registerPassword);

  // Status state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect home
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await login(loginEmail, loginPassword);
      setSuccess('Logged in successfully! Redirecting...');
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!isMinLength || !hasAlphaNum) {
      setError('Password does not meet the complexity requirements.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await register({
        name: registerEmail.split('@')[0], // Fallback name
        email: registerEmail,
        password: registerPassword
      });
      setSuccess('Account created successfully! Redirecting to homepage...');
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tevar-login-container relative overflow-x-hidden">
      
      {/* Close button in top right of the viewport */}
      <button 
        onClick={() => router.push('/')}
        className="absolute top-8 right-8 w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:border-neutral-300 transition-all cursor-pointer z-20"
      >
        <X className="w-4.5 h-4.5" />
      </button>

      {/* Left Column: Media Card with Rounded Corners & Overlays */}
      <div className="tevar-login-left">
        <img 
          src="/login-showcase.png" 
          alt="Tevar Streetwear Showcase" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Subtle overlay gradient */}
        <div className="absolute inset-0 bg-black/15 z-0" />

        {/* Progress Indicators (Carousel indicators) */}
        <div className="absolute top-6 left-6 right-6 flex gap-2.5 z-10">
          <span className="flex-grow h-0.75 bg-white rounded-full"></span>
          <span className="flex-grow h-0.75 bg-white/30 rounded-full"></span>
          <span className="flex-grow h-0.75 bg-white/30 rounded-full"></span>
        </div>

        {/* Slogan Description Overlay at the bottom */}
        <div className="absolute bottom-6 left-6 right-6 z-10 text-white text-[11px] md:text-xs leading-relaxed font-medium bg-black/35 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg">
          Tevar is an online fashion store that provides a variety of clothes, shoes, bags, and accessories for men and women.
        </div>
      </div>

      {/* Right Column: Form Panel */}
      <div className="tevar-login-right">
        
        {/* Header Branding */}
        <div className="mb-4">
          <span className="text-sm font-bold tracking-tight text-neutral-900 font-sans">Tevar</span>
        </div>

        {/* Form and Status notification */}
        <div className="flex-1 flex flex-col justify-center gap-6 my-auto">
          
          {/* Section Heading */}
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900">
              {activeTab === 'register' ? 'Create Your Account!' : 'Welcome Back!'}
            </h2>
          </div>

          {/* Animate Alert Messages */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-red-50 text-red-600 p-3 rounded-2xl flex items-start gap-2 text-xs font-semibold border border-red-100"
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
                  className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl flex items-start gap-2 text-xs font-semibold border border-emerald-100"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Form Actions */}
          <AnimatePresence mode="wait">
            {activeTab === 'register' ? (
              <motion.form 
                key="register-form-split"
                onSubmit={handleRegisterSubmit}
                initial={shouldReduceMotion ? {} : { opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-4"
              >
                {/* Email Input */}
                <div className="flex flex-col">
                  <label className="tevar-login-label">Email</label>
                  <input 
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    disabled={loading}
                    className="tevar-login-input"
                  />
                </div>

                {/* Password Input */}
                <div className="flex flex-col">
                  <label className="tevar-login-label">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      disabled={loading}
                      className="tevar-login-input pl-5 pr-12"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password validation requirements checklist */}
                <div className="tevar-login-checklist">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">Password must contains :</span>
                  
                  <div className="flex items-center gap-2">
                    <Check className={`w-3.5 h-3.5 ${isMinLength ? 'text-emerald-500' : 'text-neutral-300'}`} />
                    <span>Minimum 8 character</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Check className={`w-3.5 h-3.5 ${hasAlphaNum ? 'text-emerald-500' : 'text-neutral-300'}`} />
                    <span>Must have alphabetic & numeric character</span>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="flex flex-col">
                  <label className="tevar-login-label">Confirm Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Type your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      className="tevar-login-input pl-5 pr-12"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="tevar-login-submit"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="login-form-split"
                onSubmit={handleLoginSubmit}
                initial={shouldReduceMotion ? {} : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-4"
              >
                {/* Email Input */}
                <div className="flex flex-col">
                  <label className="tevar-login-label">Email</label>
                  <input 
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={loading}
                    className="tevar-login-input"
                  />
                </div>

                {/* Password Input */}
                <div className="flex flex-col">
                  <label className="tevar-login-label">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={loading}
                      className="tevar-login-input pl-5 pr-12"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Options Row */}
                <div className="flex items-center justify-between px-1 text-xs select-none">
                  <label className="flex items-center gap-2 text-neutral-500 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded-full border-neutral-300 text-black focus:ring-black focus:ring-offset-0 transition-all cursor-pointer"
                      defaultChecked
                    />
                    Remember me
                  </label>
                  <Link 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); alert('Reset password feature coming soon!'); }} 
                    className="text-neutral-900 font-bold hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="tevar-login-submit"
                >
                  {loading ? 'Signing in...' : 'Login'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Social Sign up separators */}
          <div className="flex flex-col gap-4 mt-2">
            <div className="relative flex items-center select-none">
              <div className="flex-grow border-t border-neutral-100"></div>
              <span className="flex-shrink mx-3 text-neutral-400 text-[10px] font-semibold tracking-wider">
                or sign up with
              </span>
              <div className="flex-grow border-t border-neutral-100"></div>
            </div>

            {/* Google / Apple Pill Buttons */}
            <div className="tevar-login-social-row">
              <button 
                type="button"
                onClick={() => alert('Google authentication coming soon!')}
                className="tevar-login-social-btn"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button 
                type="button"
                onClick={() => alert('Apple ID authentication coming soon!')}
                className="tevar-login-social-btn"
              >
                <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.74-1.2 1.88-1.05 3 .98.08 2.14-.54 2.8-.29" />
                </svg>
                Apple ID
              </button>
            </div>
          </div>

        </div>

        {/* Already have an account footer toggle link */}
        <div className="text-center mt-6 select-none">
          <p className="text-xs text-neutral-400 font-medium">
            {activeTab === 'register' ? (
              <>
                Already have an account?{' '}
                <button 
                  onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
                  className="text-neutral-900 hover:underline font-bold cursor-pointer ml-1"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button 
                  onClick={() => { setActiveTab('register'); setError(''); setSuccess(''); }}
                  className="text-neutral-900 hover:underline font-bold cursor-pointer ml-1"
                >
                  Sign up
                </button>
              </>
            )}
          </p>
        </div>

      </div>

    </div>
  );
}
