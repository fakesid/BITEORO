import React, { useState, useEffect, useRef, useCallback } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import {
  FiSearch,
  FiHome,
  FiUsers,
  FiClock,
  FiGrid,
  FiPackage,
  FiSettings,
  FiCornerDownLeft,
  FiX,
} from "react-icons/fi";

const PAGE_RESULTS = [
  { name: "Dashboard", icon: <FiHome />, type: "page" },
  { name: "Customers", icon: <FiUsers />, type: "page" },
  { name: "History", icon: <FiClock />, type: "page" },
  { name: "Menu", icon: <FiGrid />, type: "page" },
  { name: "Inventory", icon: <FiPackage />, type: "page" },
  { name: "Settings", icon: <FiSettings />, type: "page" },
];

export default function GlobalSearch({ onNavigate }) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Logic: Firebase Data Fetching
  const fetchData = useCallback(async () => {
    if (dataLoaded || !user || loading) return;
    setLoading(true);
    try {
      const [menuSnap, ordersSnap, invSnap] = await Promise.all([
        getDocs(collection(db, "users", user.uid, "menu")),
        getDocs(collection(db, "users", user.uid, "orders")),
        getDocs(collection(db, "users", user.uid, "inventory")),
      ]);

      setMenuItems(menuSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const customerMap = {};
      ordersSnap.docs.forEach((d) => {
        const order = d.data();
        const phone = order.customerPhone || "";
        if (phone && !customerMap[phone]) {
          customerMap[phone] = { name: order.customerName || "", phone };
        }
      });
      setCustomers(Object.values(customerMap));
      setInventoryItems(invSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setDataLoaded(true);
    } catch (e) {
      console.error("GlobalSearch: failed to fetch data", e);
    }
    setLoading(false);
  }, [user, dataLoaded, loading]);

  useEffect(() => {
    if (open && !dataLoaded) fetchData();
  }, [open, dataLoaded, fetchData]);

  // Logic: Keyboard Shortcuts (Cmd+K)
  useEffect(() => {
    function handleGlobalKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", handleGlobalKey);
    return () => document.removeEventListener("keydown", handleGlobalKey);
  }, []);

  // Filter Logic
  const q = query.toLowerCase().trim();
  const filteredPages = q ? PAGE_RESULTS.filter((p) => p.name.toLowerCase().includes(q)) : PAGE_RESULTS;
  const filteredMenu = q ? menuItems.filter((item) => item.name?.toLowerCase().includes(q) || String(item.price).includes(q)) : [];
  const filteredCustomers = q ? customers.filter((c) => c.name?.toLowerCase().includes(q) || c.phone?.includes(q)) : [];
  const filteredInventory = q ? inventoryItems.filter((item) => item.name?.toLowerCase().includes(q)) : [];

  const allResults = [];
  filteredPages.forEach((p) => allResults.push({ ...p, category: "Pages", action: () => navigate(p.name) }));
  filteredMenu.forEach((item) => allResults.push({ name: item.name, detail: `₹${item.price}`, icon: <FiGrid />, category: "Menu", action: () => navigate("Menu") }));
  filteredCustomers.forEach((c) => allResults.push({ name: c.name || c.phone, detail: c.phone, icon: <FiUsers />, category: "Customers", action: () => navigate("Customers") }));
  filteredInventory.forEach((item) => allResults.push({ name: item.name, detail: `${item.quantity} left`, icon: <FiPackage />, category: "Inventory", action: () => navigate("Inventory") }));

  const cappedResults = allResults.slice(0, 20); // Limit total results

  function navigate(tabName) {
    onNavigate(tabName);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* UI: Combined Styling from both versions */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500 text-sm sm:text-base pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search orders, customers, menu..."
          className="w-full pl-9 pr-10 py-2 text-sm bg-surface-secondary dark:bg-gray-900 border border-border-light dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white transition-all"
        />
        {query && (
          <button 
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX size={14} />
          </button>
        )}
      </div>

      {/* Dropdown: Sirf tab dikhega jab search open ho */}
      {open && (query || loading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
          ) : cappedResults.length > 0 ? (
            <div className="py-2">
              {cappedResults.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => item.action()}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                >
                  <span className="text-gray-400">{item.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium dark:text-white">{item.name}</div>
                    {item.detail && <div className="text-xs text-gray-500">{item.detail}</div>}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}