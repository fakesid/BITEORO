import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import {
  FiArrowRight,
  FiCheck,
  FiPlus,
  FiGrid,
  FiPackage,
  FiZap,
  FiArrowLeft,
  FiX
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

  // Logic: Step Management
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

  // Logic: Firebase Functions
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
      setMenuItems((prev) => [...prev, { name: itemName.trim(), price: parseFloat(itemPrice) }]);
      setItemName("");
      setItemPrice("");
    } catch (e) { console.error(e); }
    setAdding(false);
  };

  const finish = async () => {
    try {
      await setDoc(doc(db, "users", user.uid, "settings", "onboarding"), {
        completed: true,
        completedAt: new Date()
      }, { merge: true });
    } catch (e) { console.error(e); }
    onComplete();
  };

  // ─── UI Content for each Step ───────────────────────

  const WelcomeView = (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-brand-gradient flex items-center justify-center mb-6 shadow-lg shadow-brand-200">
        <span className="text-white text-3xl font-bold">B</span>
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Welcome to BiteORO! 👋
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs">
        Let's get your restaurant set up in under a minute. We'll walk you through the essentials.
      </p>
      <button onClick={goNext} className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 group">
        Get Started <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
      </button>
      <button onClick={finish} className="mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors">
        Skip setup for now
      </button>
    </div>
  );

  const MenuView = (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
          <FiGrid size={20} />
        </div>
        <div className="text-left">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Add your menu</h2>
          <p className="text-xs text-gray-500">Add at least one item to start.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text" placeholder="Item Name" value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
        />
        <input
          type="number" placeholder="₹" value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
          className="w-20 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
        />
        <button onClick={addItem} disabled={!itemName || !itemPrice || adding} className="p-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
          <FiPlus />
        </button>
      </div>

      <div className="max-h-40 overflow-y-auto space-y-2 mb-6">
        {menuItems.map((item, i) => (
          <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 animate-fade-in">
            <span className="text-sm font-medium dark:text-gray-200">{item.name}</span>
            <span className="text-sm font-bold text-brand-600">₹{item.price}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between gap-3">
        <button onClick={goBack} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 flex items-center gap-1">
          <FiArrowLeft /> Back
        </button>
        <button onClick={goNext} className="btn-primary px-6 py-2 text-sm flex items-center gap-2">
          {menuItems.length > 0 ? "Continue" : "Skip"} <FiArrowRight />
        </button>
      </div>
    </div>
  );

  const DoneView = (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center mb-6 border-4 border-green-100 dark:border-green-900/30 animate-scale-in">
        <FiCheck size={32} />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You're all set!</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs">
        {menuItems.length > 0 ? `Awesome! ${menuItems.length} items added.` : "Your dashboard is ready to explore."}
      </p>
      <button onClick={finish} className="w-full btn-primary py-2.5">
        Go to Dashboard
      </button>
    </div>
  );

  const stepViews = [WelcomeView, MenuView, DoneView];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
        
        {/* Progress bar at the top */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 dark:bg-gray-700">
          <div 
            className="h-full bg-brand-gradient transition-all duration-500" 
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Close button */}
        <button onClick={finish} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10">
          <FiX className="text-gray-400" />
        </button>

        <div className={`p-8 transition-all duration-300 ${animate ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
          {stepViews[step]}
        </div>
      </div>
    </div>
  );
}