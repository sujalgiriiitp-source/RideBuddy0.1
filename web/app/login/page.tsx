'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement login logic
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* LEFT SIDE - Dark Blue Gradient */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary via-primary-dark to-primary-light p-12 flex-col justify-between">
        <div>
          <h1 className="text-5xl font-bold text-white mb-4">RideBuddy</h1>
          <p className="text-xl text-white/90">Share rides, save money, make friends</p>
        </div>
        
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="w-96 h-96 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="text-9xl">🚗</div>
            </div>
            <p className="text-white/80 mt-8 text-lg">
              Join thousands of students sharing rides daily
            </p>
          </div>
        </div>
        
        <div className="text-white/60 text-sm">
          © 2026 RideBuddy. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE - White Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="md:hidden mb-8 text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">RideBuddy</h1>
            <p className="text-gray-text">Share rides, save money</p>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-text mb-8">Sign in to continue your journey</p>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field peer"
                placeholder=" "
                required
              />
              <label
                htmlFor="email"
                className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-text peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-primary"
              >
                Email Address
              </label>
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field peer"
                placeholder=" "
                required
              />
              <label
                htmlFor="password"
                className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-text peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-primary"
              >
                Password
              </label>
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-text">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-input hover:border-gray-300">
                <span className="text-2xl">G</span>
                <span className="text-sm font-medium">Google</span>
              </button>
              
              <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-input hover:border-gray-300">
                <span className="text-2xl">f</span>
                <span className="text-sm font-medium">Facebook</span>
              </button>
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-text mb-4">
                Don't have an account?
              </p>
              <Link href="/signup" className="btn-secondary inline-block px-8 py-2">
                Create Account
              </Link>
            </div>
          </form>

          <p className="text-xs text-gray-text text-center mt-8">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
