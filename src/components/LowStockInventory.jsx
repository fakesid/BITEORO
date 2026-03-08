import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { FiAlertTriangle } from "react-icons/fi";

export default function LowStockInventory({ max = 5 }) {
  const { user, loading } = useAuth();
  const [lowItems, setLowItems] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "users", user.uid, "inventory"), (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((item) => item.quantity <= item.min && item.quantity > 0)
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, max);
      setLowItems(list);
    });
    return () => unsub();
  }, [max, user]);

  if (loading) return <div className="skeleton h-32 rounded-2xl" />;

  if (lowItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="w-10 h-10 rounded-full bg-success-50 flex items-center justify-center mb-2">
          <span className="text-success-500 text-lg">&#10003;</span>
        </div>
        <p className="text-sm text-text-muted">All inventory is healthy</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {lowItems.map((item) => {
        const pct = Math.round((item.quantity / item.min) * 100);
        return (
          <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-secondary hover:bg-surface-tertiary transition-colors">
            <div className="w-8 h-8 rounded-lg bg-warning-50 text-warning-500 flex items-center justify-center shrink-0">
              <FiAlertTriangle className="text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary truncate">{item.name}</span>
                <span className="badge-warning ml-2 shrink-0">
                  {item.quantity} {item.unit}
                </span>
              </div>
              <div className="w-full h-1 bg-surface-tertiary rounded-full overflow-hidden mt-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${pct <= 30 ? "bg-danger-500" : "bg-warning-500"}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
