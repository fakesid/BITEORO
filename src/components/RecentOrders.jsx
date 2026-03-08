import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import {
  FiClock,
  FiChevronDown,
  FiCreditCard,
  FiTrash2,
  FiUser,
  FiCheck,
  FiX,
} from "react-icons/fi";

function RecentOrders() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "users", user.uid, "orders"), (snapshot) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const todayOrders = all
        .filter((o) => {
          const created = o.createdAt?.toDate?.() || new Date(o.createdAt);
          return (
            created.getFullYear() === today.getFullYear() &&
            created.getMonth() === today.getMonth() &&
            created.getDate() === today.getDate()
          );
        })
        .sort((a, b) => {
          const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return bDate - aDate;
        });
      setOrders(todayOrders);
    });
    return () => unsub();
  }, [user]);

  const togglePaid = async (id, currentStatus) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid, "orders", id), { paid: !currentStatus });
  };

  const deleteOrder = async (id) => {
    if (!user) return;
    if (window.confirm("Delete this order?")) {
      await deleteDoc(doc(db, "users", user.uid, "orders", id));
    }
  };

  const formatTime = (createdAt) => {
    if (!createdAt?.seconds) return "--:--";
    const date = new Date(createdAt.seconds * 1000);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const itemCount = (order) => {
    return (order.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  if (loading) {
    return (
      <div className="space-y-3 p-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-3">
            <FiClock className="text-brand-400 text-xl" />
          </div>
          <p className="text-sm font-medium text-text-secondary">No orders today yet</p>
          <p className="text-xs text-text-disabled mt-1">New orders will appear here</p>
        </div>
      )}

      {orders.map((order) => {
        const isExpanded = expandedId === order.id;
        const time = formatTime(order.createdAt);
        const count = itemCount(order);

        return (
          <div
            key={order.id}
            className={`rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
              isExpanded
                ? "border-brand-200 shadow-sm"
                : "border-border-light bg-surface hover:border-border hover:shadow-card"
            }`}
            onClick={() => setExpandedId(isExpanded ? null : order.id)}
          >
            {/* Header row */}
            <div className="flex items-center gap-3 px-4 py-3">
              {/* Status indicator dot */}
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  order.paid
                    ? "bg-success-50 text-success-500"
                    : "bg-warning-50 text-warning-500"
                }`}
              >
                {order.paid ? (
                  <FiCheck className="text-base" />
                ) : (
                  <FiClock className="text-base" />
                )}
              </div>

              {/* Order info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">
                    #{order.id.slice(-4)}
                  </span>
                  <span className="text-xs text-text-muted truncate">
                    {order.customerName || "Walk-in"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-2xs text-text-disabled">{time}</span>
                  <span className="text-text-disabled">·</span>
                  <span className="text-2xs text-text-disabled">
                    {count} item{count !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Amount & status */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="text-right">
                  <span className="text-sm font-bold text-text-primary block">
                    ₹{order.total}
                  </span>
                </div>
                <span
                  className={`text-2xs font-semibold px-2 py-0.5 rounded-full ${
                    order.paid
                      ? "bg-success-50 text-success-600"
                      : "bg-warning-50 text-warning-600"
                  }`}
                >
                  {order.paid ? "Paid" : "Unpaid"}
                </span>
                <FiChevronDown
                  className={`text-text-muted transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="animate-fade-in border-t border-border-light bg-surface-secondary/50">
                {/* Items list */}
                <div className="px-4 pt-3 pb-2 space-y-1.5">
                  {(order.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-2xs font-medium text-text-disabled bg-surface-tertiary w-5 h-5 rounded flex items-center justify-center shrink-0">
                          {item.quantity}
                        </span>
                        <span className="text-text-secondary truncate">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-medium text-text-primary shrink-0 ml-3">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer: meta + actions */}
                <div className="px-4 py-2.5 flex items-center justify-between border-t border-border-light">
                  <div className="flex items-center gap-3">
                    {/* Payment mode */}
                    {order.paymentMode && (
                      <span className="flex items-center gap-1 text-2xs text-text-muted">
                        <FiCreditCard className="text-xs" />
                        <span className="capitalize">{order.paymentMode}</span>
                      </span>
                    )}
                    {/* Customer phone */}
                    {order.customerPhone && (
                      <span className="flex items-center gap-1 text-2xs text-text-muted">
                        <FiUser className="text-xs" />
                        {order.customerPhone}
                      </span>
                    )}
                  </div>

                  {/* Quick actions */}
                  <div className="flex items-center gap-1">
                    <button
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                        order.paid
                          ? "text-warning-600 hover:bg-warning-50"
                          : "text-success-600 hover:bg-success-50"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePaid(order.id, order.paid);
                      }}
                    >
                      {order.paid ? (
                        <>
                          <FiX className="text-xs" /> Unpaid
                        </>
                      ) : (
                        <>
                          <FiCheck className="text-xs" /> Paid
                        </>
                      )}
                    </button>
                    <button
                      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg text-danger-500 hover:bg-danger-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteOrder(order.id);
                      }}
                    >
                      <FiTrash2 className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default RecentOrders;
