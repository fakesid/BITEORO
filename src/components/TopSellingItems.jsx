import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { FiTrendingUp } from "react-icons/fi";

export default function TopSellingItems({ max = 5 }) {
  const { user, loading: authLoading } = useAuth();
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchTopSelling() {
      setLoading(true);
      const ordersSnap = await getDocs(collection(db, "users", user.uid, "orders"));
      const itemSales = {};
      ordersSnap.forEach((doc) => {
        const { items } = doc.data();
        if (Array.isArray(items)) {
          items.forEach((item) => {
            if (!itemSales[item.name]) itemSales[item.name] = { ...item, sold: 0 };
            itemSales[item.name].sold += item.quantity || 1;
          });
        }
      });
      const sorted = Object.values(itemSales).sort((a, b) => b.sold - a.sold).slice(0, max);
      setTopItems(sorted);
      setLoading(false);
    }
    fetchTopSelling();
  }, [max, user]);

  if (authLoading) return <div className="skeleton h-48 rounded-2xl" />;

  const maxSold = topItems[0]?.sold || 1;

  // Different colors for each rank to add visual variety
  const barColors = [
    "bg-brand-500",       // #1 — brand orange
    "bg-info-500",        // #2 — blue
    "bg-success-500",     // #3 — green
    "bg-warning-500",     // #4 — amber
    "bg-purple-500",      // #5 — purple (fallback to brand)
  ];

  const badgeStyles = [
    "bg-brand-500 text-white",
    "bg-info-100 text-info-700",
    "bg-success-100 text-success-700",
    "bg-warning-100 text-warning-700",
    "bg-purple-100 text-purple-700",
  ];

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center">
          <FiTrendingUp className="text-base" />
        </div>
        <h2 className="section-title">Top Selling</h2>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}
        </div>
      ) : topItems.length === 0 ? (
        <div className="text-center py-8">
          <FiTrendingUp className="text-3xl text-text-disabled mx-auto mb-2" />
          <p className="text-text-muted text-sm">No sales data yet</p>
          <p className="text-text-disabled text-xs mt-1">Start taking orders to see trends</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topItems.map((item, idx) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                badgeStyles[idx] || "bg-surface-tertiary text-text-muted"
              }`}>
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text-primary truncate">{item.name}</span>
                  <span className="text-sm font-semibold text-text-secondary shrink-0 ml-2">{item.sold}</span>
                </div>
                <div className="w-full h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColors[idx] || "bg-brand-400"}`}
                    style={{ width: `${(item.sold / maxSold) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
