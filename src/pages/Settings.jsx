import React, { useState, useEffect, useCallback } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import {
  FiUser,
  FiSave,
  FiLock,
  FiDollarSign,
  FiFileText,
  FiCheck,
  FiAlertTriangle,
  FiInfo,
} from "react-icons/fi";

const CURRENCY_OPTIONS = ["₹", "$", "€", "£", "¥"];

export default function Settings() {
  const { user } = useAuth();

  // ─── Restaurant Profile ──────────────────────────────
  const [profile, setProfile] = useState({
    restaurantName: "",
    phone: "",
    address: "",
    gst: "",
  });

  // ─── Billing / Tax ──────────────────────────────────
  const [billing, setBilling] = useState({
    currency: "₹",
    taxRate: 0,
    taxLabel: "GST",
    showTaxOnBill: true,
    footerNote: "Thank you for visiting!",
  });

  // ─── Password change ───────────────────────────────
  const [pw, setPw] = useState({ current: "", newPw: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // ─── General state ──────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  // ─── Load settings from Firestore ───────────────────
  const loadSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const profileSnap = await getDoc(doc(db, "users", user.uid, "settings", "profile"));
      if (profileSnap.exists()) setProfile((p) => ({ ...p, ...profileSnap.data() }));

      const billingSnap = await getDoc(doc(db, "users", user.uid, "settings", "billing"));
      if (billingSnap.exists()) setBilling((b) => ({ ...b, ...billingSnap.data() }));
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // ─── Save settings ─────────────────────────────────
  const saveSettings = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await Promise.all([
        setDoc(doc(db, "users", user.uid, "settings", "profile"), profile, { merge: true }),
        setDoc(doc(db, "users", user.uid, "settings", "billing"), billing, { merge: true }),
      ]);
      showToast("Settings saved!", "success");
    } catch (e) {
      console.error("Failed to save settings:", e);
      showToast("Failed to save settings", "error");
    }
    setSaving(false);
  };

  // ─── Change password ───────────────────────────────
  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess("");

    if (!pw.current || !pw.newPw || !pw.confirm) {
      setPwError("All fields are required");
      return;
    }
    if (pw.newPw.length < 6) {
      setPwError("New password must be at least 6 characters");
      return;
    }
    if (pw.newPw !== pw.confirm) {
      setPwError("New passwords don't match");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, pw.current);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, pw.newPw);
      setPwSuccess("Password updated successfully!");
      setPw({ current: "", newPw: "", confirm: "" });
    } catch (e) {
      if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") {
        setPwError("Current password is incorrect");
      } else {
        setPwError("Failed to update password. Please try again.");
      }
    }
  };

  // ─── Toast ─────────────────────────────────────────
  function showToast(message, type) {
    setToast({ message, type });
  }
  useEffect(() => {
    if (toast.message) {
      const t = setTimeout(() => setToast({ message: "", type: "" }), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">Settings</h1>
        <p className="text-sm text-text-muted mt-1">
          Manage your restaurant profile, billing, and account
        </p>
      </div>

      <div className="space-y-8">
        {/* ─── Restaurant Profile ─────────────────────── */}
        <section className="card p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
              <FiUser className="text-lg" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Restaurant Profile</h2>
              <p className="text-xs text-text-muted">This info appears on your receipts and bills</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Restaurant Name</label>
              <input
                type="text"
                value={profile.restaurantName}
                onChange={(e) => setProfile({ ...profile, restaurantName: e.target.value })}
                placeholder="e.g. The Chai House"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="e.g. +91 98765 43210"
                className="input w-full"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Address</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="e.g. 12, MG Road, Pune"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">GST / Tax ID</label>
              <input
                type="text"
                value={profile.gst}
                onChange={(e) => setProfile({ ...profile, gst: e.target.value })}
                placeholder="Optional"
                className="input w-full"
              />
            </div>
          </div>
        </section>

        {/* ─── Billing & Tax ──────────────────────────── */}
        <section className="card p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-success-50 text-success-500 flex items-center justify-center shrink-0">
              <FiDollarSign className="text-lg" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Billing & Tax</h2>
              <p className="text-xs text-text-muted">Currency, tax rate, and receipt settings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Currency Symbol</label>
              <select
                value={billing.currency}
                onChange={(e) => setBilling({ ...billing, currency: e.target.value })}
                className="input w-full"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Tax Rate (%)</label>
              <input
                type="number"
                value={billing.taxRate}
                onChange={(e) => setBilling({ ...billing, taxRate: parseFloat(e.target.value) || 0 })}
                placeholder="e.g. 5"
                min="0"
                max="100"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Tax Label</label>
              <input
                type="text"
                value={billing.taxLabel}
                onChange={(e) => setBilling({ ...billing, taxLabel: e.target.value })}
                placeholder="e.g. GST, VAT, Tax"
                className="input w-full"
              />
            </div>
            <div className="flex items-center gap-3 self-end pb-1">
              <button
                onClick={() => setBilling({ ...billing, showTaxOnBill: !billing.showTaxOnBill })}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  billing.showTaxOnBill ? "bg-brand-500" : "bg-surface-tertiary"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    billing.showTaxOnBill ? "translate-x-5" : ""
                  }`}
                />
              </button>
              <span className="text-sm text-text-secondary">Show tax on bill</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Receipt Footer Note</label>
            <input
              type="text"
              value={billing.footerNote}
              onChange={(e) => setBilling({ ...billing, footerNote: e.target.value })}
              placeholder="e.g. Thank you for visiting!"
              className="input w-full"
            />
            <p className="text-2xs text-text-muted mt-1 flex items-center gap-1">
              <FiInfo className="shrink-0" /> Shown at the bottom of printed receipts
            </p>
          </div>
        </section>

        {/* ─── Save Button ────────────────────────────── */}
        <div className="flex justify-stretch sm:justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="btn-primary w-full sm:w-auto px-6 py-2.5 text-sm font-medium"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FiSave className="text-base" />
                Save Settings
              </span>
            )}
          </button>
        </div>

        {/* ─── Account Section ────────────────────────── */}
        <section className="card p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-info-50 text-info-500 flex items-center justify-center shrink-0">
              <FiFileText className="text-lg" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Account</h2>
              <p className="text-xs text-text-muted">Your login details</p>
            </div>
          </div>

          <div className="bg-surface-secondary rounded-xl px-4 py-3 mb-5">
            <p className="text-sm text-text-secondary">
              <span className="font-medium text-text-primary">Email:</span>{" "}
              {user?.email || "—"}
            </p>
          </div>

          {/* Change password */}
          <div className="border-t border-border pt-5">
            <div className="flex items-center gap-2 mb-4">
              <FiLock className="text-text-muted" />
              <h3 className="text-sm font-bold text-text-primary">Change Password</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Current Password</label>
                <input
                  type="password"
                  value={pw.current}
                  onChange={(e) => setPw({ ...pw, current: e.target.value })}
                  className="input w-full text-sm"
                  placeholder="••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">New Password</label>
                <input
                  type="password"
                  value={pw.newPw}
                  onChange={(e) => setPw({ ...pw, newPw: e.target.value })}
                  className="input w-full text-sm"
                  placeholder="••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={pw.confirm}
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                  className="input w-full text-sm"
                  placeholder="••••••"
                />
              </div>
            </div>

            {pwError && (
              <p className="mt-2 text-sm text-danger-600 flex items-center gap-1">
                <FiAlertTriangle className="shrink-0" /> {pwError}
              </p>
            )}
            {pwSuccess && (
              <p className="mt-2 text-sm text-success-600 flex items-center gap-1">
                <FiCheck className="shrink-0" /> {pwSuccess}
              </p>
            )}

            <button onClick={handleChangePassword} className="mt-3 btn-secondary btn-md">
              Update Password
            </button>
          </div>
        </section>
      </div>

      {/* Toast */}
      {toast.message && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 animate-fade-in px-4 sm:px-0 w-full sm:w-auto">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium w-full sm:w-auto justify-center ${
              toast.type === "success"
                ? "bg-success-50 text-success-700 border border-success-200"
                : "bg-danger-50 text-danger-700 border border-danger-200"
            }`}
          >
            {toast.type === "success" ? <FiCheck /> : <FiAlertTriangle />}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
