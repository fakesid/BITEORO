import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import {
  FiBell,
  FiAlertTriangle,
  FiAlertOctagon,
  FiXCircle,
  FiPackage,
  FiDollarSign,
  FiCheck,
} from "react-icons/fi";

export default function NotificationBell({ onNavigate }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("biteoro_dismissed_notifs") || "[]");
    } catch {
      return [];
    }
  });
  const ref = useRef(null);

  // Click outside to close logic
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Firebase Real-time logic
  useEffect(() => {
    if (!user) return;
    let menuItems = [];
    let inventoryItems = [];
    let orders = [];

    function buildNotifications() {
      const notifs = [];
      // Out of Stock Menu
      const outOfStock = menuItems.filter((i) => i.inStock === false);
      if (outOfStock.length > 0) {
        notifs.push({
          id: "menu-oos",
          type: "danger",
          icon: <FiAlertOctagon />,
          title: `${outOfStock.length} items out of stock`,
          detail: outOfStock.slice(0, 2).map((i) => i.name).join(", "),
          action: "Menu",
        });
      }
      // Low Stock Inventory
      const lowStock = inventoryItems.filter((i) => i.quantity > 0 && i.quantity <= (i.min || 5));
      if (lowStock.length > 0) {
        notifs.push({
          id: "inv-low",
          type: "warning",
          icon: <FiAlertTriangle />,
          title: "Inventory running low",
          detail: `${lowStock.length} items need restock`,
          action: "Inventory",
        });
      }
      // Unpaid Orders
      const unpaid = orders.filter((o) => !o.paid);
      if (unpaid.length > 0) {
        notifs.push({
          id: "orders-unpaid",
          type: "info",
          icon: <FiDollarSign />,
          title: "Unpaid orders",
          detail: `${unpaid.length} payments pending`,
          action: "Dashboard",
        });
      }
      // Default clear message
      if (notifs.length === 0) {
        notifs.push({ id: "all-clear", type: "success", icon: <FiCheck />, title: "All clear!", detail: "No new alerts", action: null });
      }
      setNotifications(notifs);
    }

    const unsubMenu = onSnapshot(collection(db, "users", user.uid, "menu"), (snap) => {
      menuItems = snap.docs.map((d) => d.data());
      buildNotifications();
    });
    const unsubInv = onSnapshot(collection(db, "users", user.uid, "inventory"), (snap) => {
      inventoryItems = snap.docs.map((d) => d.data());
      buildNotifications();
    });
    const unsubOrders = onSnapshot(collection(db, "users", user.uid, "orders"), (snap) => {
      orders = snap.docs.map((d) => d.data());
      buildNotifications();
    });

    return () => { unsubMenu(); unsubInv(); unsubOrders(); };
  }, [user]);

  // Persist dismissed logic
  useEffect(() => {
    localStorage.setItem("biteoro_dismissed_notifs", JSON.stringify(dismissed));
  }, [dismissed]);

  const activeNotifs = notifications.filter((n) => !dismissed.includes(n.id) && n.id !== "all-clear");
  const count = activeNotifs.length;

  const typeStyles = {
    danger: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400" },
    warning: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400" },
    info: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400" },
    success: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-600 dark:text-green-400" },
  };

  return (
    <div className="relative" ref={ref}>
      {/* TRIGGER: Combined Styling */}
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-1.5 sm:p-2 rounded-lg hover:bg-surface-secondary dark:hover:bg-gray-700 transition-colors group"
      >
        <FiBell className={`text-base sm:text-lg transition-colors ${count > 0 ? "text-brand-500" : "text-gray-500 dark:text-gray-400"}`} />
        {count > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-gray-800" />
        )}
      </button>

      {/* DROPDOWN: Rich Content */}
      {open && (
        <div className="absolute top-full right-0 mt-3 w-72 sm:w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Notifications</h3>
            {count > 0 && (
              <button onClick={() => setDismissed(notifications.map(n => n.id))} className="text-xs text-brand-500 hover:underline">Clear all</button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notif) => {
              const isDismissed = dismissed.includes(notif.id);
              if (isDismissed && notif.id !== "all-clear") return null;
              const style = typeStyles[notif.type] || typeStyles.info;

              return (
                <div 
                  key={notif.id}
                  className={`flex items-start gap-3 p-4 border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer`}
                  onClick={() => { if(notif.action) { onNavigate(notif.action); setOpen(false); } }}
                >
                  <div className={`p-2 rounded-lg ${style.bg} ${style.text}`}>{notif.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{notif.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{notif.detail}</p>
                  </div>
                  {notif.id !== "all-clear" && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDismissed([...dismissed, notif.id]); }}
                      className="text-gray-300 hover:text-gray-500"
                    >
                      <FiXCircle size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}