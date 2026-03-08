import { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { FiSearch, FiChevronDown, FiChevronUp, FiUser, FiPhone, FiStar, FiAlertCircle, FiCreditCard, FiShoppingBag, FiEdit2 } from "react-icons/fi";

export default function Customers() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [expandedPhone, setExpandedPhone] = useState(null);
  const [sortBy, setSortBy] = useState("lastSeen");
  const [search, setSearch] = useState("");

  const ordersCollection = user ? collection(db, "users", user.uid, "orders") : null;

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(ordersCollection, (snapshot) => {
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]); // eslint-disable-line

  const customers = useMemo(() => {
    const acc = {};
    for (const order of orders) {
      const phone = order.customerPhone || "Unknown";
      if (!acc[phone]) acc[phone] = { phone, name: order.customerName || "", orders: [], total: 0, lastSeen: null, itemCounts: {} };
      acc[phone].orders.push(order);
      acc[phone].total += order.total || 0;
      acc[phone].lastSeen = order.createdAt;
      (order.items || []).forEach((item) => { acc[phone].itemCounts[item.name] = (acc[phone].itemCounts[item.name] || 0) + (item.quantity || 1); });
    }
    return acc;
  }, [orders]);

  const getMostOrderedItem = (itemCounts) => {
    let max = 0, name = "";
    for (const k in itemCounts) { if (itemCounts[k] > max) { max = itemCounts[k]; name = k; } }
    return name && max ? name + " (" + max + ")" : "\u2014";
  };

  const filteredCustomers = useMemo(() => {
    let arr = Object.values(customers);
    if (search) arr = arr.filter(c => (c.name && c.name.toLowerCase().includes(search.toLowerCase())) || (c.phone && c.phone.includes(search)));
    switch (sortBy) {
      case "total": arr.sort((a, b) => b.total - a.total); break;
      case "orders": arr.sort((a, b) => b.orders.length - a.orders.length); break;
      case "lastSeen": arr.sort((a, b) => (b.lastSeen?.seconds || 0) - (a.lastSeen?.seconds || 0)); break;
      case "name": arr.sort((a, b) => (a.name || "").localeCompare(b.name || "")); break;
      default: break;
    }
    return arr;
  }, [customers, sortBy, search]);

  const totalCustomers = Object.keys(customers).length;

  const toggleOrderPaid = async (orderId, current) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "orders", orderId), { paid: !current });
    } catch (e) {
      console.error("Failed to update order status", e);
    }
  };
  const totalSpent = Object.values(customers).reduce((sum, c) => sum + c.total, 0);
  const frequent = filteredCustomers[0];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="page-title">Customers</h2>
        <p className="text-sm text-text-muted mt-1">Customer directory built from your order history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center"><FiUser className="text-brand-600" /></div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{totalCustomers}</p>
              <p className="text-xs text-text-muted">Total customers</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center"><FiCreditCard className="text-success-600" /></div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{String.fromCharCode(8377)}{totalSpent.toLocaleString()}</p>
              <p className="text-xs text-text-muted">Total revenue</p>
            </div>
          </div>
        </div>
        {frequent && (
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center"><FiStar className="text-warning-600" /></div>
              <div>
                <p className="text-sm font-bold text-text-primary truncate">{frequent.name || frequent.phone}</p>
                <p className="text-xs text-text-muted">{frequent.orders.length} orders {String.fromCharCode(183)} {String.fromCharCode(8377)}{frequent.total}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-10" />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input w-auto min-w-[180px]">
          <option value="lastSeen">Sort by Last Seen</option>
          <option value="total">Sort by Total Spent</option>
          <option value="orders">Sort by Orders</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {/* Customer Cards */}
      <div className="space-y-3">
        {filteredCustomers.map((cust) => (
          <div
            key={cust.phone}
            className={`card-hover p-4 cursor-pointer transition-all duration-200 ${expandedPhone === cust.phone ? "ring-1 ring-brand-200" : ""} ${cust.phone === "Unknown" ? "border-danger-200 bg-danger-50/30" : ""}`}
            onClick={() => setExpandedPhone(expandedPhone === cust.phone ? null : cust.phone)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cust.orders.length >= 10 ? "bg-brand-100" : cust.phone === "Unknown" ? "bg-danger-100" : "bg-surface-tertiary"}`}>
                  <FiUser className={`${cust.orders.length >= 10 ? "text-brand-600" : cust.phone === "Unknown" ? "text-danger-500" : "text-text-muted"}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-text-primary">{cust.name || "(No Name)"}</span>
                    {cust.phone !== "Unknown" && <span className="text-xs text-text-muted flex items-center gap-1"><FiPhone className="text-[10px]" />{cust.phone}</span>}
                    {cust.orders.length >= 10 && <span className="badge-brand">Frequent</span>}
                    {cust.phone === "Unknown" && <span className="badge-danger">No Phone</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
                    <span className="flex items-center gap-1"><FiShoppingBag className="text-[10px]" /> {cust.orders.length} orders</span>
                    <span>{String.fromCharCode(8377)}{cust.total.toLocaleString()}</span>
                    <span className="hidden sm:inline">Favorite: {getMostOrderedItem(cust.itemCounts)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-text-muted hidden sm:block">
                  {cust.lastSeen?.seconds ? new Date(cust.lastSeen.seconds * 1000).toLocaleDateString() : "\u2014"}
                </span>
                {expandedPhone === cust.phone ? <FiChevronUp className="text-text-muted" /> : <FiChevronDown className="text-text-muted" />}
              </div>
            </div>

            {expandedPhone === cust.phone && (
              <div className="mt-4 pt-4 border-t border-border-light animate-fade-in space-y-2">
                {cust.orders.slice(0, 5).map((o) => (
                  <div key={o.id} className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-surface-secondary/50">
                    <span className="text-text-muted font-mono text-xs">#{o.id.slice(-4)}</span>
                    <span className="text-text-secondary text-xs">{o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleString() : "\u2014"}</span>
                            <span className="font-medium text-text-primary">{String.fromCharCode(8377)}{o.total}</span>
                    <div className="flex items-center gap-2">
                      {o.paid ? <span className="badge-success">Paid</span> : <span className="badge-danger">Unpaid</span>}
                      <button
                        onClick={() => toggleOrderPaid(o.id, o.paid)}
                        className="btn-icon text-text-muted hover:text-text-primary"
                        title="Toggle paid status"
                      >
                        <FiEdit2 className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))}
                {cust.orders.length > 5 && <p className="text-xs text-text-muted text-center pt-1">...and {cust.orders.length - 5} more orders</p>}
                {cust.phone === "Unknown" && (
                  <div className="flex items-start gap-2 mt-2 p-3 rounded-xl bg-warning-50 border border-warning-200">
                    <FiAlertCircle className="text-warning-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-warning-700">Ask for this customer's phone number on their next visit to merge their orders.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {filteredCustomers.length === 0 && (
          <div className="card p-12 text-center">
            <FiUser className="mx-auto text-3xl text-text-disabled mb-3" />
            <p className="text-text-muted">No customers found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
