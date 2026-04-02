import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { FiMail, FiLock, FiUser, FiArrowRight, FiArrowLeft } from "react-icons/fi";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update Auth Profile with Name
      await updateProfile(user, { displayName: name });

      // 3. Create User Document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        createdAt: new Date(),
        role: "owner" // Default role
      });

      // Navigate window view if necessary
      window.setAuthView?.("login"); 
    } catch (err) {
      setError(err.message?.includes("auth/email-already-in-use") 
        ? "This email is already registered." 
        : err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-surface-secondary dark:bg-gray-900">
      {/* Floating Back Button */}
      <button
        onClick={() => window.setAuthView?.("landing")}
        className="fixed top-5 left-5 z-50 flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <FiArrowLeft /> Back
      </button>

      {/* Main SignUp Card */}
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-border-light dark:border-gray-700 animate-fade-in-up">
        
        {/* Header Section */}
        <div className="p-6 sm:p-8 text-center border-b border-border-light dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-brand-500/20">
            <span className="text-white text-2xl font-bold">B</span>
          </div>
          <h2 className="text-2xl font-bold text-text-primary dark:text-white tracking-tight">
            Create Account
          </h2>
          <p className="text-sm text-text-muted dark:text-gray-400 mt-1">
            Start managing your restaurant with bite<span className="text-brand-500 font-semibold">ORO</span>
          </p>
        </div>

        {/* Form Section */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name Input */}
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-border-light dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none dark:text-white transition-all"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500" />
                <input
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
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500" />
                <input
                  type="password"
                  required
                  minLength={6}
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
                <span>⚠️</span>
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-text-muted dark:text-gray-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => window.setAuthView?.("login")}
                className="text-brand-600 dark:text-brand-400 font-bold hover:underline transition-all"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}