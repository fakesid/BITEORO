import React, { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { 
  FiSearch, FiChevronDown, FiChevronUp, FiUser, FiPhone, 
  FiStar, FiAlertCircle, FiCreditCard, FiShoppingBag, FiEdit2, FiCalendar 
} from "react-icons/fi";

export default function Customers() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [expandedPhone, setExpandedPhone] = useState(null);
  const [sortBy, setSortBy] = useState("lastSeen");
  const [search, setSearch] = useState("");

  // Logic: Firebase Data Fetching
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "users", user.uid, "orders"), (snapshot) => {
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  // Logic: Grouping Orders into Customers
  const customersData = useMemo(() => {
    const acc = {};
    orders.forEach((order) => {
      const phone = order.customerPhone || "Unknown";
      if (!acc[phone]) {
        acc[phone] = { 
          phone, 
          name: order.customerName || "Guest Customer", 
          orders: [], 
          total: 0, 
          lastSeen: null, 
          itemCounts: {} 
        };
      }
      acc[phone].orders.push(order);
      acc[phone].total += (order.total || 0);
      acc[phone].lastSeen = order.createdAt;
      (order.items || []).forEach((item) => {
        acc[phone].itemCounts[item.name] = (acc[phone].itemCounts[item.name] || 0) + (item.quantity || 1);
      });
    });
    return acc;
  }, [orders]);

  const filteredCustomers = useMemo(() => {
    let arr = Object.values(customersData);
    if (search) {
      arr = arr.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.phone.includes(search)
      );
    }
    const sortFns = {
      total: (a, b) => b.total - a.total,
      orders: (a, b) => b.orders.length - a.orders.length,
      lastSeen: (a, b) => (b.lastSeen?.seconds || 0) - (a.lastSeen?.seconds || 0),
      name: (a, b) => a.name.localeCompare(b.name)
    };
    return arr.sort(sortFns[sortBy] || sortFns.lastSeen);
  }, [customersData, sortBy, search]);

  // UI Helper: Get favorite item
  const getFavorite = (counts) => {
    let max = 0, name = "";
    for (const k in counts) { if (counts[k] > max) { max = counts[k]; name = k; } }
    return name || "None";
  };

  const totalSpent = Object.values(customersData).reduce((sum, c) => sum + c.total, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-white">Customer Directory</h1>
          <p className="text-sm text-text-muted mt-1">Manage relationships and order history</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-border-light dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-500 flex items-center justify-center text-xl">
              <FiUser />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-white">{Object.keys(customersData).length}</p>
              <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Total Customers</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-border-light dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success-50 dark:bg-success-900/20 text-success-500 flex items-center justify-center text-xl">
              <FiCreditCard />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-white">₹{totalSpent.toLocaleString()}</p>
              <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Customer Value</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-border-light dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning-50 dark:bg-warning-900/20 text-warning-500 flex items-center justify-center text-xl">
              <FiStar />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-white">
                {filteredCustomers[0]?.orders.length || 0}
              </p>
              <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Top Visit Count</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search name or phone..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-border-light dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
          />
        </div>
        <select 
          value={sortBy} 
          onChange={e => setSortBy(e.target.value)} 
          className="px-4 py-3 bg-white dark:bg-gray-800 border border-border-light dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none dark:text-white min-w-[200px]"
        >
          <option value="lastSeen">Last Visit</option>
          <option value="total">Highest Spender</option>
          <option value="orders">Most Frequent</option>
          <option value="name">Alphabetical</option>
        </select>
      </div>

      {/* Customer List */}
      <div className="grid gap-3">
        {filteredCustomers.map((cust) => (
          <div 
            key={cust.phone} 
            className={`group bg-white dark:bg-gray-800 border rounded-2xl transition-all duration-200 overflow-hidden ${
              expandedPhone === cust.phone 
                ? "border-brand-500 shadow-lg ring-1 ring-brand-500/10" 
                : "border-border-light dark:border-gray-700 hover:border-brand-300 shadow-sm"
            }`}
          >
            <div 
              className="p-4 sm:p-5 cursor-pointer flex items-center justify-between"
              onClick={() => setExpandedPhone(expandedPhone === cust.phone ? null : cust.phone)}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-lg ${
                  cust.orders.length >= 5 ? "bg-brand-100 text-brand-600" : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                }`}>
                  <FiUser />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-text-primary dark:text-white truncate">{cust.name}</h3>
                    {cust.orders.length >= 10 && <span className="px-2 py-0.5 bg-brand-50 text-brand-600 text-[10px] font-bold rounded-full uppercase">VIP</span>}
                    {cust.phone === "Unknown" && <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-full uppercase">No Contact</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1 text-xs text-text-muted font-medium">
                      <FiPhone size={12} /> {cust.phone}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-muted font-medium">
                      <FiShoppingBag size={12} /> {cust.orders.length} Visits
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="font-bold text-text-primary dark:text-white">₹{cust.total.toLocaleString()}</p>
                  <p className="text-[10px] text-text-muted uppercase font-bold tracking-tighter">Total Spent</p>
                </div>
                <div className={`p-2 rounded-full transition-colors ${expandedPhone === cust.phone ? "bg-brand-50 text-brand-500" : "text-gray-400 group-hover:bg-gray-50 dark:group-hover:bg-gray-700"}`}>
                  {expandedPhone === cust.phone ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                </div>
              </div>
            </div>

            {/* Expanded Order History */}
            {expandedPhone === cust.phone && (
              <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-200">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-text-muted uppercase font-bold">Favorite Dish</p>
                      <p className="text-sm font-semibold dark:text-white">{getFavorite(cust.itemCounts)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-text-muted uppercase font-bold">Last Visit</p>
                      <p className="text-sm font-semibold dark:text-white">
                        {cust.lastSeen?.seconds ? new Date(cust.lastSeen.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <h4 className="text-xs font-bold text-text-muted uppercase mb-3 flex items-center gap-2">
                    <FiCalendar /> Recent Orders
                  </h4>
                  <div className="space-y-2">
                    {cust.orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                        <span className="text-xs font-mono text-text-muted">#{o.id.slice(-4)}</span>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${o.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {o.paid ? 'PAID' : 'UNPAID'}
                          </span>
                          <span className="text-sm font-bold dark:text-white">₹{o.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}