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

  const handleForgotPassword = async () => {
    setError("");
    if (!email) {
      setError("Enter your email above first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 4000);
    } catch (err) {
      setError("Failed to send reset email.");
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-secondary">
      {/* Back to landing */}
      <button
        onClick={() => window.setAuthView?.("landing")}
        className="fixed top-3 left-3 sm:top-5 sm:left-5 z-50 flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-lg bg-surface/80 backdrop-blur text-text-muted hover:text-text-primary transition-colors lg:bg-transparent lg:px-0 lg:py-0 lg:text-white/70 lg:hover:text-white"
      >
        <FiArrowLeft /> Back
      </button>

      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-brand-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 -left-10 w-72 h-72 rounded-full bg-white/20" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white/10" />
          <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-white/15" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-lg font-bold font-display">B</span>
              </div>
              <span className="text-2xl font-extrabold tracking-tight font-display">biteORO</span>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Manage your restaurant,<br />effortlessly.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed max-w-md">
              Orders, menu, inventory, customers — everything in one beautiful dashboard.
            </p>
          </div>
          <p className="text-white/40 text-sm">&copy; 2026 BiteORO. All rights reserved.</p>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 pt-16 sm:pt-8">
        <div className="w-full max-w-[400px] animate-fade-in-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-brand-gradient flex items-center justify-center">
              <span className="text-white text-sm font-bold font-display">B</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight font-display">
              bite<span className="text-brand-500">ORO</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Welcome back</h1>
            <p className="text-text-muted text-sm mt-1">Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@business.com"
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary">Password</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors"
                >
                  {resetSent ? "Check your email!" : "Forgot password?"}
                </button>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="input pl-10"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-danger-50 border border-danger-100 text-danger-600 text-sm animate-fade-in">
                <span className="shrink-0">&#9888;</span>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in <FiArrowRight />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-sm text-text-muted">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  window.setAuthView?.("signup");
                  window.dispatchEvent(new CustomEvent('navigateToSignUp'));
                }}
                className="text-brand-500 hover:text-brand-600 font-semibold transition-colors"
              >
                Create one
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
