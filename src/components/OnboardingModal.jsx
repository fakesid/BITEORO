import React, { useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import {
  FiArrowRight,
  FiCheck,
  FiPlus,
  FiGrid,
  FiPackage,
  FiZap,
  FiArrowLeft,
} from "react-icons/fi";

const STEPS = [
  { id: "welcome", label: "Welcome" },
  { id: "menu", label: "Menu" },
  { id: "done", label: "Done" },
];

export default function OnboardingModal({ onComplete }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [menuItems, setMenuItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [adding, setAdding] = useState(false);
  const [animate, setAnimate] = useState(true);

  // Quick-add a menu item
  const addItem = async () => {
    if (!itemName.trim() || !itemPrice) return;
    setAdding(true);
    try {
      const ref = collection(db, "users", user.uid, "menu");
      await addDoc(ref, {
        name: itemName.trim(),
        price: parseFloat(itemPrice),
        inStock: true,
      });
      setMenuItems((prev) => [
        ...prev,
        { name: itemName.trim(), price: parseFloat(itemPrice) },
      ]);
      setItemName("");
      setItemPrice("");
    } catch (e) {
      console.error("Failed to add item:", e);
    }
    setAdding(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addItem();
  };

  const goNext = () => {
    setAnimate(false);
    setTimeout(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
      setAnimate(true);
    }, 150);
  };

  const goBack = () => {
    setAnimate(false);
    setTimeout(() => {
      setStep((s) => Math.max(s - 1, 0));
      setAnimate(true);
    }, 150);
  };

  const finish = async () => {
    // Save onboarding flag so it never shows again
    try {
      await setDoc(
        doc(db, "users", user.uid, "settings", "onboarding"),
        { completed: true, completedAt: new Date() },
        { merge: true }
      );
    } catch (e) {
      console.error("Failed to save onboarding flag:", e);
    }
    onComplete();
  };

  const skip = async () => {
    await finish();
  };

  // ─── Step Content ───────────────────────────────────

  const welcomeStep = (
    <div className="flex flex-col items-center text-center">
      {/* Animated icon */}
      <div className="w-20 h-20 rounded-2xl bg-brand-gradient flex items-center justify-center mb-6 shadow-lg shadow-brand-200">
        <FiZap className="text-white text-3xl" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-3">
        Welcome to BiteORO!
      </h2>
      <p className="text-text-secondary max-w-md mb-2">
        Let's get your restaurant set up in under a minute. We'll walk you through the essentials.
      </p>
      <p className="text-xs text-text-muted mb-8">
        You can always change these settings later.
      </p>

      <button onClick={goNext} className="btn-primary btn-lg group w-full max-w-xs">
        Let's go
        <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
      </button>
      <button onClick={skip} className="text-sm text-text-muted hover:text-text-secondary mt-4 transition-colors">
        Skip setup for now
      </button>
    </div>
  );

  const menuStep = (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
          <FiGrid className="text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">Add your menu items</h2>
          <p className="text-sm text-text-muted">These are the items customers can order.</p>
        </div>
      </div>

      {/* Quick-add form */}
      <div className="mt-6 flex gap-2">
        <input
          type="text"
          placeholder="Item name (e.g. Masala Chai)"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input flex-1 py-2.5"
          autoFocus
        />
        <input
          type="number"
          placeholder="Price"
          value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input w-28 py-2.5"
          min="0"
        />
        <button
          onClick={addItem}
          disabled={!itemName.trim() || !itemPrice || adding}
          className="btn-primary px-4 py-2.5 shrink-0"
        >
          <FiPlus />
        </button>
      </div>

      {/* Added items list */}
      <div className="mt-4 max-h-48 overflow-y-auto space-y-2">
        {menuItems.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
            <FiPackage className="text-2xl text-text-disabled mx-auto mb-2" />
            <p className="text-sm text-text-muted">No items yet. Add your first one above!</p>
          </div>
        ) : (
          menuItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 bg-surface-secondary rounded-xl animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-success-50 text-success-500 flex items-center justify-center">
                  <FiCheck className="text-sm" />
                </div>
                <span className="text-sm font-medium text-text-primary">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-text-secondary">₹{item.price}</span>
            </div>
          ))
        )}
      </div>

      {/* Added count */}
      {menuItems.length > 0 && (
        <p className="text-xs text-success-600 font-medium mt-3">
          {menuItems.length} item{menuItems.length > 1 ? "s" : ""} added
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-6">
        <button onClick={goBack} className="btn-ghost text-sm px-4 py-2">
          <FiArrowLeft className="mr-1" /> Back
        </button>
        <div className="flex items-center gap-3">
          <button onClick={skip} className="text-sm text-text-muted hover:text-text-secondary transition-colors">
            Skip
          </button>
          <button
            onClick={goNext}
            className="btn-primary text-sm px-5 py-2.5 group"
          >
            {menuItems.length > 0 ? "Continue" : "Skip this step"}
            <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );

  const doneStep = (
    <div className="flex flex-col items-center text-center">
      {/* Success animation */}
      <div className="w-20 h-20 rounded-full bg-success-50 border-4 border-success-100 flex items-center justify-center mb-6 animate-scale-in">
        <FiCheck className="text-success-500 text-3xl" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-3">
        You're all set!
      </h2>
      <p className="text-text-secondary max-w-md mb-2">
        {menuItems.length > 0
          ? `Great — you've added ${menuItems.length} menu item${menuItems.length > 1 ? "s" : ""}. You can always add more from the Menu page.`
          : "You can add menu items anytime from the Menu page in the sidebar."}
      </p>
      <p className="text-sm text-text-muted mb-8">
        Start taking orders or explore your dashboard.
      </p>

      <button onClick={finish} className="btn-primary btn-lg group w-full max-w-xs">
        Go to Dashboard
        <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );

  const stepContent = [welcomeStep, menuStep, doneStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-2xl shadow-modal w-full max-w-lg mx-4 overflow-hidden animate-scale-in">
        {/* Progress bar */}
        <div className="h-1 bg-surface-tertiary">
          <div
            className="h-full bg-brand-gradient rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 pt-5 pb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i <= step ? "bg-brand-500 scale-100" : "bg-surface-tertiary scale-75"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Content */}
        <div
          className={`px-6 sm:px-8 py-6 transition-all duration-300 ${
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          {stepContent[step]}
        </div>
      </div>
    </div>
  );
}
