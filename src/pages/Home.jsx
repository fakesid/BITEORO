import React, { useState, useEffect } from "react";
import ImprovedOrderPage from "./ImprovedOrderPage";
import RecentOrders from "../components/RecentOrders";
import LowStockInventory from "../components/LowStockInventory";
import TopSellingItems from "../components/TopSellingItems";
import DashboardSummary from "../components/DashboardSummary";
import { FiPlus, FiX, FiClock, FiAlertTriangle, FiTrendingUp } from "react-icons/fi";

export default function Home() {
  const [showOrderForm, setShowOrderForm] = useState(false);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = showOrderForm ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showOrderForm]);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-white">Dashboard</h1>
          <p className="text-sm text-text-muted mt-1">Real-time overview of your restaurant</p>
        </div>
        <button
          onClick={() => setShowOrderForm(true)}
          className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-brand-200 dark:shadow-none transition-all active:scale-95"
        >
          <FiPlus className="text-lg" /> New Order
        </button>
      </div>

      {/* 2. Stats/Summary Row */}
      {/* DashboardSummary component handle karega stats cards ko */}
      <DashboardSummary />

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Top Selling Items (Takes 1 column) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-border-light dark:border-gray-700">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-500 flex items-center justify-center">
              <FiTrendingUp />
            </div>
            <h2 className="font-bold text-text-primary dark:text-white">Top Selling</h2>
          </div>
          <TopSellingItems max={5} />
        </div>

        {/* Center: Recent Orders (Takes 1 column) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-border-light dark:border-gray-700 flex flex-col h-[450px]">
          <div className="flex items-center gap-2 p-5 border-b border-border-light dark:border-gray-700">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-text-muted flex items-center justify-center">
              <FiClock />
            </div>
            <h2 className="font-bold text-text-primary dark:text-white">Recent Orders</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <RecentOrders />
          </div>
        </div>

        {/* Right: Low Stock Alerts (Takes 1 column) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-border-light dark:border-gray-700">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-warning-50 dark:bg-warning-900/30 text-warning-500 flex items-center justify-center">
              <FiAlertTriangle />
            </div>
            <h2 className="font-bold text-text-primary dark:text-white">Low Stock</h2>
          </div>
          <LowStockInventory max={5} />
        </div>
      </div>

      {/* 4. New Order Full-Screen Modal */}
      {showOrderForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-2 sm:p-4"
          onClick={() => setShowOrderForm(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-6xl h-full max-h-[95vh] relative animate-scale-in overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowOrderForm(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 flex items-center justify-center transition-all"
            >
              <FiX size={20} />
            </button>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              <ImprovedOrderPage onOrderPlaced={() => setShowOrderForm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}