import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import TopSellingItems from "../components/TopSellingItems";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FiCalendar, FiDollarSign, FiShoppingBag, FiTrendingUp, FiBarChart2, FiAward } from "react-icons/fi";

function History() {
  const { user } = useAuth();
  const [overview, setOverview] = useState({
    today: 0, week: 0, month: 0, allTime: 0,
    ordersToday: 0, ordersWeek: 0, ordersMonth: 0, ordersAllTime: 0, avgOrder: 0,
  });
  const [loading, setLoading] = useState(true);
  const [salesByWeekday, setSalesByWeekday] = useState([]);
  const [salesByMonthDay, setSalesByMonthDay] = useState([]);
  const [itemInsights, setItemInsights] = useState([]);

  const ordersCollection = user ? collection(db, "users", user.uid, "orders") : null;

  useEffect(() => {
    if (!user) return;
    async function fetchAnalytics() {
      setLoading(true);
      const snap = await getDocs(ordersCollection);
      const orders = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      let today = 0, week = 0, month = 0, allTime = 0;
      let ordersToday = 0, ordersWeek = 0, ordersMonth = 0, ordersAllTime = 0;
      let totalOrderValue = 0;
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0,0,0,0);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const weekdayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const salesByDay = Array(7).fill(0);
      const salesByDate = Array(31).fill(0);
      const itemMap = {};
      orders.forEach((order) => {
        const created = order.createdAt?.toDate?.() || new Date(order.createdAt);
        const total = order.total || 0;
        allTime += total; ordersAllTime++; totalOrderValue += total;
        if (created >= startOfToday) { today += total; ordersToday++; }
        if (created >= startOfWeek) { week += total; ordersWeek++; }
        if (created >= startOfMonth) { month += total; ordersMonth++; }
        salesByDay[created.getDay()] += total;
        salesByDate[created.getDate() - 1] += total;
        if (Array.isArray(order.items)) {
          order.items.forEach((item) => {
            if (!itemMap[item.name]) itemMap[item.name] = { name: item.name, quantity: 0, sales: 0 };
            itemMap[item.name].quantity += item.quantity || 1;
            itemMap[item.name].sales += (item.price || 0) * (item.quantity || 1);
          });
        }
      });
      setOverview({ today, week, month, allTime, ordersToday, ordersWeek, ordersMonth, ordersAllTime, avgOrder: ordersAllTime ? Math.round(totalOrderValue / ordersAllTime) : 0 });
      setSalesByWeekday(weekdayMap.map((name, i) => ({ name, sales: salesByDay[i] })));
      setSalesByMonthDay(salesByDate.map((sales, i) => ({ name: (i + 1).toString(), sales })));
      setItemInsights(Object.values(itemMap).sort((a, b) => b.quantity - a.quantity).slice(0, 10));
      setLoading(false);
    }
    fetchAnalytics();
  }, [user]); // eslint-disable-line

  const statCards = [
    { label: "Today", value: overview.today, orders: overview.ordersToday, icon: FiDollarSign, color: "brand" },
    { label: "This Week", value: overview.week, orders: overview.ordersWeek, icon: FiCalendar, color: "info" },
    { label: "This Month", value: overview.month, orders: overview.ordersMonth, icon: FiTrendingUp, color: "success" },
    { label: "All Time", value: overview.allTime, orders: overview.ordersAllTime, icon: FiShoppingBag, color: "warning" },
  ];

  const colorMap = { brand: { bg: "bg-brand-50", text: "text-brand-600" }, info: { bg: "bg-info-50", text: "text-info-600" }, success: { bg: "bg-success-50", text: "text-success-600" }, warning: { bg: "bg-warning-50", text: "text-warning-600" } };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-surface border border-border-light rounded-xl px-4 py-2.5 shadow-card">
          <p className="text-xs font-medium text-text-secondary mb-0.5">{label}</p>
          <p className="text-sm font-bold text-text-primary">{String.fromCharCode(8377)}{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="page-title">Analytics</h2>
        <p className="text-sm text-text-muted mt-1">Sales performance and trends overview</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          const c = colorMap[card.color];
          return (
            <div key={card.label} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}><Icon className={`${c.text}`} /></div>
                <span className="text-xs font-medium text-text-muted">{card.label}</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{String.fromCharCode(8377)}{card.value.toLocaleString()}</p>
              <p className="text-xs text-text-muted mt-1">{card.orders} orders</p>
            </div>
          );
        })}
      </div>

      {/* Avg Order Value */}
      <div className="card p-5 mb-8 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center"><FiTrendingUp className="text-brand-600" /></div>
        <div>
          <p className="text-xs text-text-muted">Average order value</p>
          <p className="text-xl font-bold text-text-primary">{String.fromCharCode(8377)}{overview.avgOrder}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales by Day of Week */}
        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-info-50 flex items-center justify-center"><FiBarChart2 className="text-info-600 text-sm" /></div>
            <h3 className="section-title !mb-0">Sales by Weekday</h3>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={salesByWeekday} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" fill="#F97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Day of Month */}
        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-success-50 flex items-center justify-center"><FiCalendar className="text-success-600 text-sm" /></div>
            <h3 className="section-title !mb-0">Sales by Date</h3>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={salesByMonthDay} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Selling Items Bar + Component */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-success-50 flex items-center justify-center"><FiAward className="text-success-600 text-sm" /></div>
            <h3 className="section-title !mb-0">Top Items (Chart)</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={itemInsights} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={88} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="quantity" fill="#10B981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <TopSellingItems max={5} />
      </div>
    </div>
  );
}

export default History;
