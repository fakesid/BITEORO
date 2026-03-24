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

  // Close on click outside
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Listen to menu + inventory + orders for live notifications
  useEffect(() => {
    if (!user) return;
    let menuItems = [];
    let inventoryItems = [];
    let orders = [];

    function buildNotifications() {
      const notifs = [];

      // Out of stock menu items
      const outOfStock = menuItems.filter((i) => i.inStock === false);
      if (outOfStock.length > 0) {
        notifs.push({
          id: "menu-oos",
          type: "danger",
          icon: <FiAlertOctagon />,
          title: `${outOfStock.length} menu item${outOfStock.length > 1 ? "s" : ""} out of stock`,
          detail: outOfStock.slice(0, 3).map((i) => i.name).join(", ") + (outOfStock.length > 3 ? ` +${outOfStock.length - 3} more` : ""),
          action: "Menu",
          time: "Now",
        });
      }

      // Low stock inventory
      const lowStock = inventoryItems.filter((i) => i.quantity > 0 && i.quantity <= (i.min || 5));
      if (lowStock.length > 0) {
        notifs.push({
          id: "inv-low",
          type: "warning",
          icon: <FiAlertTriangle />,
          title: `${lowStock.length} inventory item${lowStock.length > 1 ? "s" : ""} running low`,
          detail: lowStock.slice(0, 3).map((i) => `${i.name} (${i.quantity} ${i.unit || "pcs"})`).join(", "),
          action: "Inventory",
          time: "Now",
        });
      }

      // Out of stock inventory (quantity === 0)
      const outOfStockInv = inventoryItems.filter((i) => i.quantity === 0);
      if (outOfStockInv.length > 0) {
        notifs.push({
          id: "inv-oos",
          type: "danger",
          icon: <FiPackage />,
          title: `${outOfStockInv.length} inventory item${outOfStockInv.length > 1 ? "s" : ""} depleted`,
          detail: outOfStockInv.slice(0, 3).map((i) => i.name).join(", ") + (outOfStockInv.length > 3 ? ` +${outOfStockInv.length - 3} more` : ""),
          action: "Inventory",
          time: "Now",
        });
      }

      // Unpaid orders today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = orders.filter((o) => {
        const created = o.createdAt?.toDate?.() || new Date(o.createdAt);
        return (
          created.getFullYear() === today.getFullYear() &&
          created.getMonth() === today.getMonth() &&
          created.getDate() === today.getDate()
        );
      });
      const unpaid = todayOrders.filter((o) => !o.paid);
      if (unpaid.length > 0) {
        const unpaidTotal = unpaid.reduce((sum, o) => sum + (o.total || 0), 0);
        notifs.push({
          id: "orders-unpaid",
          type: "info",
          icon: <FiDollarSign />,
          title: `${unpaid.length} unpaid order${unpaid.length > 1 ? "s" : ""} today`,
          detail: `₹${unpaidTotal.toLocaleString()} pending collection`,
          action: "Dashboard",
          time: "Today",
        });
      }

      // All clear notification
      if (notifs.length === 0) {
        notifs.push({
          id: "all-clear",
          type: "success",
          icon: <FiCheck />,
          title: "All clear!",
          detail: "No issues to report right now",
          action: null,
          time: "Now",
        });
      }

      setNotifications(notifs);
    }

    const unsubMenu = onSnapshot(collection(db, "users", user.uid, "menu"), (snap) => {
      menuItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      buildNotifications();
    });

    const unsubInv = onSnapshot(collection(db, "users", user.uid, "inventory"), (snap) => {
      inventoryItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      buildNotifications();
    });

    const unsubOrders = onSnapshot(collection(db, "users", user.uid, "orders"), (snap) => {
      orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      buildNotifications();
    });

    return () => { unsubMenu(); unsubInv(); unsubOrders(); };
  }, [user]);

  // Persist dismissed
  useEffect(() => {
    localStorage.setItem("biteoro_dismissed_notifs", JSON.stringify(dismissed));
  }, [dismissed]);

  const activeNotifs = notifications.filter((n) => !dismissed.includes(n.id) && n.id !== "all-clear");
  const count = activeNotifs.length;

  const dismiss = (id) => {
    setDismissed((prev) => [...prev, id]);
  };

  const clearAll = () => {
    setDismissed(notifications.map((n) => n.id));
  };

  // Reset dismissed daily
  useEffect(() => {
    const lastReset = localStorage.getItem("biteoro_notif_reset_date");
    const todayStr = new Date().toDateString();
    if (lastReset !== todayStr) {
      setDismissed([]);
      localStorage.setItem("biteoro_notif_reset_date", todayStr);
    }
  }, []);

  const typeStyles = {
    danger: { bg: "bg-danger-50", text: "text-danger-600", dot: "bg-danger-500" },
    warning: { bg: "bg-warning-50", text: "text-warning-600", dot: "bg-warning-500" },
    info: { bg: "bg-info-50", text: "text-info-600", dot: "bg-info-500" },
    success: { bg: "bg-success-50", text: "text-success-600", dot: "bg-success-500" },
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost p-2 rounded-lg relative"
        title="Notifications"
      >
        <FiBell className={`text-lg ${count > 0 ? "text-text-primary" : "text-text-muted"}`} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-danger-500 rounded-full leading-none animate-scale-in">
            {count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full right-0 mt-2 w-[min(20rem,calc(100vw-1rem))] bg-surface border border-border-light rounded-xl shadow-modal z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
            <h3 className="text-sm font-bold text-text-primary">Notifications</h3>
            {count > 0 && (
              <button
                onClick={clearAll}
                className="text-2xs font-medium text-text-muted hover:text-text-secondary transition-colors"
              >
                Dismiss all
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div className="max-h-[min(65vh,20rem)] overflow-y-auto">
            {notifications.map((notif) => {
              const isDismissed = dismissed.includes(notif.id);
              if (isDismissed && notif.id !== "all-clear") return null;
              const style = typeStyles[notif.type] || typeStyles.info;

              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-border-light last:border-0 transition-colors ${
                    notif.action ? "cursor-pointer hover:bg-surface-secondary" : ""
                  } ${isDismissed ? "opacity-50" : ""}`}
                  onClick={() => {
                    if (notif.action && onNavigate) {
                      onNavigate(notif.action);
                      setOpen(false);
                    }
                  }}
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-lg ${style.bg} ${style.text} flex items-center justify-center shrink-0 mt-0.5`}>
                    {notif.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary leading-snug">{notif.title}</p>
                    <p className="text-2xs text-text-muted mt-0.5 truncate">{notif.detail}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xs text-text-disabled">{notif.time}</span>
                      {notif.action && (
                        <span className={`text-2xs font-medium ${style.text}`}>
                          Go to {notif.action} →
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dismiss button */}
                  {notif.id !== "all-clear" && !isDismissed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismiss(notif.id);
                      }}
                      className="shrink-0 mt-1 text-text-disabled hover:text-text-muted transition-colors"
                      title="Dismiss"
                    >
                      <FiXCircle className="w-4 h-4" />
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
