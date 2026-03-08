import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { FiShoppingBag, FiCheckCircle, FiXCircle, FiDollarSign } from "react-icons/fi";

function DashboardSummary() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paidTotal, setPaidTotal] = useState(0);
  const [unpaidTotal, setUnpaidTotal] = useState(0);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "users", user.uid, "orders"), (snapshot) => {
      const allOrders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = allOrders.filter((order) => {
        const created = order.createdAt?.toDate?.() || new Date(order.createdAt);
        return created.getFullYear() === today.getFullYear() && created.getMonth() === today.getMonth() && created.getDate() === today.getDate();
      });
      setOrders(todayOrders);
      const total = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const paid = todayOrders.filter((o) => o.paid).reduce((sum, o) => sum + (o.total || 0), 0);
      setTotalRevenue(total);
      setPaidTotal(paid);
      setUnpaidTotal(total - paid);
    });
    return () => unsub();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  const stats = [
    { label: "Orders Today", value: orders.length, icon: <FiShoppingBag />, bg: "bg-brand-50", text: "text-brand-600" },
    { label: "Paid", value: `\u20B9${paidTotal.toLocaleString()}`, icon: <FiCheckCircle />, bg: "bg-success-50", text: "text-success-600" },
    { label: "Unpaid", value: `\u20B9${unpaidTotal.toLocaleString()}`, icon: <FiXCircle />, bg: "bg-danger-50", text: "text-danger-600" },
    { label: "Revenue", value: `\u20B9${totalRevenue.toLocaleString()}`, icon: <FiDollarSign />, bg: "bg-info-50", text: "text-info-600" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="card p-4 flex items-start gap-3 group hover:shadow-card-hover transition-all duration-200">
          <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.text} flex items-center justify-center text-lg shrink-0`}>
            {stat.icon}
          </div>
          <div className="min-w-0">
            <p className="stat-label">{stat.label}</p>
            <p className="text-xl font-bold text-text-primary mt-0.5 truncate">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardSummary;
