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

  // Fetch data lazily on first focus
  const fetchData = useCallback(async () => {
    if (dataLoaded || !user || loading) return;
    setLoading(true);
    try {
      const [menuSnap, ordersSnap, invSnap] = await Promise.all([
        getDocs(collection(db, "users", user.uid, "menu")),
        getDocs(collection(db, "users", user.uid, "orders")),
        getDocs(collection(db, "users", user.uid, "inventory")),
      ]);

      setMenuItems(
        menuSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );

      // Derive unique customers from orders
      const customerMap = {};
      ordersSnap.docs.forEach((d) => {
        const order = d.data();
        const phone = order.customerPhone || "";
        if (phone && !customerMap[phone]) {
          customerMap[phone] = {
            name: order.customerName || "",
            phone,
          };
        }
      });
      setCustomers(Object.values(customerMap));

      setInventoryItems(
        invSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );

      setDataLoaded(true);
    } catch (e) {
      console.error("GlobalSearch: failed to fetch data", e);
    }
    setLoading(false);
  }, [user, dataLoaded, loading]);

  // Refetch when data changes (e.g. new items added) — refresh every 60s while open
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setDataLoaded(false);
    }, 60000);
    return () => clearInterval(interval);
  }, [open]);

  useEffect(() => {
    if (open && !dataLoaded) fetchData();
  }, [open, dataLoaded, fetchData]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut: Cmd+K or Ctrl+K to focus search
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

  // Filter results
  const q = query.toLowerCase().trim();

  const filteredPages = q
    ? PAGE_RESULTS.filter((p) => p.name.toLowerCase().includes(q))
    : PAGE_RESULTS;

  const filteredMenu = q
    ? menuItems.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          String(item.price).includes(q)
      )
    : [];

  const filteredCustomers = q
    ? customers.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) || c.phone?.includes(q)
      )
    : [];

  const filteredInventory = q
    ? inventoryItems.filter((item) =>
        item.name?.toLowerCase().includes(q)
      )
    : [];

  // Build flat list for keyboard navigation
  const allResults = [];
  filteredPages.forEach((p) =>
    allResults.push({ ...p, category: "Pages", action: () => navigate(p.name) })
  );
  filteredMenu.forEach((item) =>
    allResults.push({
      name: item.name,
      detail: `₹${item.price}${item.inStock ? "" : " · Out of stock"}`,
      icon: <FiGrid />,
      type: "menu",
      category: "Menu Items",
      action: () => navigate("Menu"),
    })
  );
  filteredCustomers.forEach((c) =>
    allResults.push({
      name: c.name || c.phone,
      detail: c.name ? c.phone : "",
      icon: <FiUsers />,
      type: "customer",
      category: "Customers",
      action: () => navigate("Customers"),
    })
  );
  filteredInventory.forEach((item) =>
    allResults.push({
      name: item.name,
      detail: `${item.quantity} ${item.unit || "pcs"}`,
      icon: <FiPackage />,
      type: "inventory",
      category: "Inventory",
      action: () => navigate("Inventory"),
    })
  );

  // Cap results per category
  const MAX_PER_CATEGORY = 5;
  const cappedResults = [];
  const seen = {};
  for (const r of allResults) {
    if (!seen[r.category]) seen[r.category] = 0;
    if (seen[r.category] < MAX_PER_CATEGORY) {
      cappedResults.push(r);
      seen[r.category]++;
    }
  }

  // Reset highlight when results change
  useEffect(() => {
    setHighlightIndex(0);
  }, [query]);

  function navigate(tabName) {
    onNavigate(tabName);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleKeyDown(e) {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, cappedResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (cappedResults[highlightIndex]) {
        cappedResults[highlightIndex].action();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  // Group results by category for rendering
  const grouped = [];
  let lastCategory = "";
  cappedResults.forEach((r, i) => {
    if (r.category !== lastCategory) {
      grouped.push({ type: "header", label: r.category });
      lastCategory = r.category;
    }
    grouped.push({ ...r, flatIndex: i });
  });

  return (
    <div ref={containerRef} className="relative order-last basis-full sm:order-none sm:basis-auto flex-1 min-w-[220px] sm:max-w-md">
      {/* Search input */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="input pl-9 pr-12 sm:pr-20 py-2 bg-surface-secondary border-transparent focus:bg-surface focus:border-border w-full"
        />
        {/* Shortcut hint */}
        {!open && !query && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-2xs font-medium text-text-disabled bg-surface-tertiary border border-border-light rounded">
              ⌘K
            </kbd>
          </div>
        )}
        {/* Clear button */}
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border-light rounded-xl shadow-modal z-50 overflow-hidden animate-fade-in max-h-[min(70vh,32rem)]">
          {/* Loading state */}
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-text-muted">
              <div className="w-4 h-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
              Loading...
            </div>
          )}

          {/* Results list */}
          {!loading && cappedResults.length > 0 && (
            <div className="max-h-[min(56vh,20rem)] overflow-y-auto py-1">
              {grouped.map((item, idx) => {
                if (item.type === "header") {
                  return (
                    <div
                      key={`header-${item.label}`}
                      className="px-4 pt-3 pb-1 text-2xs font-semibold text-text-muted uppercase tracking-wider"
                    >
                      {item.label}
                    </div>
                  );
                }

                const isHighlighted = item.flatIndex === highlightIndex;

                return (
                  <button
                    key={`${item.category}-${item.name}-${item.flatIndex}`}
                    onClick={() => item.action()}
                    onMouseEnter={() => setHighlightIndex(item.flatIndex)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      isHighlighted
                        ? "bg-brand-50 text-brand-700"
                        : "text-text-primary hover:bg-surface-secondary"
                    }`}
                  >
                    <span
                      className={`shrink-0 ${
                        isHighlighted ? "text-brand-500" : "text-text-muted"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">
                        {item.name}
                      </span>
                      {item.detail && (
                        <span className="text-2xs text-text-muted truncate block">
                          {item.detail}
                        </span>
                      )}
                    </div>
                    {isHighlighted && (
                      <FiCornerDownLeft className="shrink-0 w-3.5 h-3.5 text-text-disabled" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* No results */}
          {!loading && q && cappedResults.length === 0 && (
            <div className="px-4 py-8 text-center">
              <FiSearch className="w-6 h-6 text-text-disabled mx-auto mb-2" />
              <p className="text-sm text-text-muted">
                No results for "<span className="font-medium text-text-secondary">{query}</span>"
              </p>
            </div>
          )}

          {/* Footer hint */}
          <div className="hidden sm:flex border-t border-border-light px-4 py-2 items-center gap-4 text-2xs text-text-disabled">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-surface-tertiary border border-border-light rounded text-2xs">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-surface-tertiary border border-border-light rounded text-2xs">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-surface-tertiary border border-border-light rounded text-2xs">esc</kbd>
              Close
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
