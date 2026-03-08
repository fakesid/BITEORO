import { useState, useEffect } from "react";
import ImprovedOrderPage from "./ImprovedOrderPage";
import RecentOrders from "../components/RecentOrders";
import LowStockInventory from "../components/LowStockInventory";
import TopSellingItems from "../components/TopSellingItems";
import DashboardSummary from "../components/DashboardSummary";
import { FiPlus, FiX, FiClock, FiAlertTriangle } from "react-icons/fi";

function Home() {
  const [showOrderForm, setShowOrderForm] = useState(false);

  useEffect(() => {
    document.body.style.overflow = showOrderForm ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showOrderForm]);

  return (
    <div className="p-6 lg:p-8 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-text-muted mt-1">Overview of today's activity</p>
        </div>
        <button
          onClick={() => setShowOrderForm(true)}
          className="btn-primary btn-lg shadow-md hover:shadow-lg"
        >
          <FiPlus className="text-lg" /> New Order
        </button>
      </div>

      {/* Stats row */}
      <div className="mb-8">
        <DashboardSummary />
      </div>

      {/* Main grid — 2 columns on desktop: left stacks Top Selling + Low Stock, right has Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column — Top Selling */}
        <div className="xl:col-span-1">
          <TopSellingItems max={5} />
        </div>

        {/* Center column — Recent Orders */}
        <div className="xl:col-span-1 card flex flex-col min-h-[400px] max-h-[calc(100vh-220px)]">
          <div className="flex items-center gap-2 p-5 pb-3 border-b border-border-light shrink-0">
            <div className="w-8 h-8 rounded-lg bg-surface-tertiary text-text-muted flex items-center justify-center">
              <FiClock className="text-base" />
            </div>
            <h2 className="section-title">Today's Orders</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <RecentOrders />
          </div>
        </div>

        {/* Right column — Low Stock */}
        <div className="xl:col-span-1 card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-warning-50 text-warning-500 flex items-center justify-center">
              <FiAlertTriangle className="text-base" />
            </div>
            <h2 className="section-title">Low Stock</h2>
          </div>
          <LowStockInventory max={5} />
        </div>
      </div>

      {/* Order modal */}
      {showOrderForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowOrderForm(false)}
        >
          <div
            className="bg-surface rounded-2xl shadow-modal w-full max-w-5xl mx-4 relative animate-scale-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowOrderForm(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg bg-surface-tertiary hover:bg-border flex items-center justify-center text-text-muted hover:text-text-primary transition-all"
              aria-label="Close"
            >
              <FiX />
            </button>
            <ImprovedOrderPage onOrderPlaced={() => setShowOrderForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
