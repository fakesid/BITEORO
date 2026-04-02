import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { FiMail, FiLock, FiArrowRight, FiArrowLeft } from "react-icons/fi";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Logic: Sign In
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message?.includes("auth/") ? "Invalid email or password." : err.message);
    }
    setLoading(false);
  };

  // Logic: Forgot Password
  const handleForgotPassword = async () => {
    setError("");
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err) {
      setError("Failed to send reset email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-surface-secondary dark:bg-gray-900">
      {/* Back Button (Floating) */}
      <button
        onClick={() => window.setAuthView?.("landing")}
        className="fixed top-5 left-5 z-50 flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <FiArrowLeft /> Back
      </button>

      {/* Main Login Card */}
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-border-light dark:border-gray-700 animate-fade-in-up">
        
        {/* Card Header (Branding) */}
        <div className="p-6 sm:p-8 text-center border-b border-border-light dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-brand-500/20">
            <span className="text-white text-2xl font-bold">B</span>
          </div>
          <h2 className="text-2xl font-bold text-text-primary dark:text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="text-sm text-text-muted dark:text-gray-400 mt-1">
            Sign in to your bite<span className="text-brand-500 font-semibold">ORO</span> account
          </p>
        </div>

        {/* Card Body (Form) */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-border-light dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none dark:text-white transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary dark:text-gray-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400 transition-colors"
                >
                  {resetSent ? "Check your inbox!" : "Forgot password?"}
                </button>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-border-light dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none dark:text-white transition-all"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-danger-50 dark:bg-danger-900/20 border border-danger-100 dark:border-danger-900/30 text-danger-600 dark:text-danger-400 text-xs animate-fade-in">
                <span className="mt-0.5">⚠️</span>
                <span className="flex-1">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 group font-semibold shadow-lg shadow-brand-500/10 active:scale-[0.98] transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-text-muted dark:text-gray-400">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  window.setAuthView?.("signup");
                  window.dispatchEvent(new CustomEvent('navigateToSignUp'));
                }}
                className="text-brand-600 dark:text-brand-400 font-bold hover:underline transition-all"
              >
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}