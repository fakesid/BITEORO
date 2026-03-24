import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { FiUser, FiBriefcase, FiMail, FiLock, FiArrowRight, FiArrowLeft } from "react-icons/fi";

function SignUp({ onSignUp }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = () => {
    setError("");
    if (!name.trim() || !businessName.trim()) {
      setError("Name and Business Name are required.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        name,
        businessName,
        role: "owner",
        createdAt: serverTimestamp()
      });
      if (onSignUp) onSignUp();
    } catch (err) {
      setError(err.message?.includes("auth/email-already-in-use") ? "This email is already registered." : (err.message || "Failed to sign up."));
    }
    setLoading(false);
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
              Start managing<br />your business today.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed max-w-md">
              Set up in 30 seconds. No credit card required.
            </p>
          </div>
          <p className="text-white/40 text-sm">&copy; 2026 BiteORO. All rights reserved.</p>
        </div>
      </div>

      {/* Right: SignUp form */}
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

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? "bg-brand-500" : "bg-border"}`} />
            <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? "bg-brand-500" : "bg-border"}`} />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {step === 1 ? "Create your account" : "Set up your login"}
            </h1>
            <p className="text-text-muted text-sm mt-1">
              {step === 1 ? "Tell us about you and your business" : "Choose your email and password"}
            </p>
          </div>

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" className="input pl-10" />
                  </div>
                </div>
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-text-secondary mb-1.5">Business Name</label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input id="businessName" type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} required placeholder="Cafe Delight" className="input pl-10" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@business.com" className="input pl-10" />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min 6 characters" className="input pl-10" />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Repeat your password" className="input pl-10" />
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-danger-50 border border-danger-100 text-danger-600 text-sm animate-fade-in">
                <span className="shrink-0">&#9888;</span>
                {error}
              </div>
            )}

            <div className="flex gap-3">
              {step === 2 && (
                  <button type="button" onClick={() => { setStep(1); setError(""); }} className="btn-secondary btn-lg shrink-0">
                  <FiArrowLeft />
                </button>
              )}
              <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {step === 1 ? "Continue" : "Create account"} <FiArrowRight />
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <span className="text-sm text-text-muted">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  window.setAuthView?.("login");
                  window.dispatchEvent(new CustomEvent('navigateToLogin'));
                }}
                className="text-brand-500 hover:text-brand-600 font-semibold transition-colors"
              >
                Sign in
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
