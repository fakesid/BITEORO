import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { FiSearch, FiMinus, FiPlus, FiTrash2, FiUser, FiPhone, FiCheck } from "react-icons/fi";

function ImprovedOrderPage({ onOrderPlaced }) {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [paid, setPaid] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchMenu();
    if (searchInputRef.current) searchInputRef.current.focus();
    // eslint-disable-next-line
  }, []);

  const fetchMenu = async () => {
    if (!user) return;
    const snapshot = await getDocs(collection(db, "users", user.uid, "menu"));
    setMenuItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (item) => {
    const exists = cart.find((i) => i.id === item.id);
    if (exists) {
      setCart(cart.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const decreaseQty = (id) => {
    const item = cart.find((i) => i.id === id);
    if (item.quantity === 1) removeFromCart(id);
    else setCart(cart.map((i) => i.id === id ? { ...i, quantity: item.quantity - 1 } : i));
  };

  const removeFromCart = (id) => setCart(cart.filter((item) => item.id !== id));
  const clearCart = () => setCart([]);
  const getTotal = () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const validatePhone = (phone) => /^\d{10}$/.test(phone);

  const placeOrder = async () => {
    if (cart.length === 0) { setMessage("Cart is empty"); setShowToast(true); return; }
    if (customerPhone && !validatePhone(customerPhone)) { setPhoneError(true); setMessage("Invalid phone number"); setShowToast(true); return; }
    setPhoneError(false);
    setLoading(true);
    try {
      if (!user) throw new Error("User not authenticated");
      await addDoc(collection(db, "users", user.uid, "orders"), {
        customerName, customerPhone, items: cart, total: getTotal(), paid, paymentMode, createdAt: serverTimestamp(), status: "new",
      });
      setCart([]); setCustomerName(""); setCustomerPhone(""); setPaid(false); setSearchTerm(""); setPaymentMode("cash");
      setMessage("Order placed successfully!");
      setShowToast(true);
      if (onOrderPlaced) onOrderPlaced();
    } catch (err) {
      setMessage("Failed: " + err.message);
      setShowToast(true);
    } finally {
      setLoading(false);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const paymentOptions = [
    { label: "Cash", value: "cash" },
    { label: "Card", value: "card" },
    { label: "UPI", value: "upi" },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row lg:h-[85vh] lg:max-h-[700px]">
      {/* Left: Menu browser */}
      <div className="flex-1 flex min-h-0 flex-col p-4 sm:p-6 lg:border-r border-border-light">
        <div className="mb-4 shrink-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-text-primary">New Order</h2>
              <p className="text-sm text-text-muted mt-1">Search the menu and build the cart.</p>
            </div>
            <div className="badge-brand self-start sm:self-auto">{cart.length} items</div>
          </div>
          <div className="mt-3 relative">
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-text-muted text-sm">No items found</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const inCart = cart.find((i) => i.id === item.id);
              return (
                <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${inCart ? "border-brand-200 bg-brand-50/30" : "border-border-light hover:border-border bg-surface"}`}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                    <p className="text-xs text-text-muted">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-3">
                    {inCart && (
                      <>
                        <button onClick={() => decreaseQty(item.id)} className="btn-icon w-7 h-7 rounded-lg bg-surface-tertiary text-text-secondary hover:bg-border text-xs">
                          <FiMinus />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold text-text-primary">{inCart.quantity}</span>
                      </>
                    )}
                    <button onClick={() => addToCart(item)} className="btn-icon w-7 h-7 rounded-lg bg-brand-500 text-white hover:bg-brand-600 text-xs">
                      <FiPlus />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Cart & checkout */}
      <div className="w-full lg:w-[360px] flex min-h-0 flex-col border-t lg:border-t-0 lg:border-l border-border-light bg-surface-secondary/50">
        <div className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-6 mb-4 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Cart</h3>
            <p className="text-xs text-text-muted mt-0.5">Review items and complete checkout.</p>
          </div>
          <span className="badge-brand shrink-0">₹{getTotal()}</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 px-4 sm:px-6 mb-4 min-h-[140px] max-h-[28vh] lg:max-h-none">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-text-muted">Add items from the menu</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border-light">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                  <p className="text-xs text-text-muted">₹{item.price} × {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-text-primary shrink-0">₹{item.price * item.quantity}</span>
                <button onClick={() => removeFromCart(item.id)} className="btn-icon w-6 h-6 text-text-muted hover:text-danger-500 transition-colors">
                  <FiTrash2 className="text-xs" />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <button onClick={clearCart} className="btn-sm btn-ghost text-danger-500 hover:bg-danger-50 mb-3 mx-4 sm:mx-6 w-auto justify-center">
            Clear cart
          </button>
        )}

        <form className="space-y-3 border-t border-border-light pt-4 px-4 pb-4 sm:px-6 sm:pb-6 shrink-0 bg-surface-secondary/80 backdrop-blur-sm" onSubmit={e => { e.preventDefault(); placeOrder(); }}>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
            <input type="text" placeholder="Customer name (optional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="input pl-9 py-2 text-sm" />
          </div>
          <div className="relative">
            <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
            <input
              type="text" placeholder="Phone (10 digits)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
              className={`input pl-9 py-2 text-sm ${phoneError ? "border-danger-500 focus:ring-danger-500/20" : ""}`}
              maxLength={10}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {paymentOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPaymentMode(opt.value)}
                className={`py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                  paymentMode === opt.value
                    ? "bg-brand-50 border-brand-200 text-brand-600"
                    : "bg-surface border-border text-text-muted hover:border-text-disabled"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${paid ? "bg-brand-500 border-brand-500" : "border-border"}`}>
              {paid && <FiCheck className="text-white text-xs" />}
            </div>
            <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="sr-only" />
            <span className="text-sm text-text-secondary">Mark as paid</span>
          </label>
          <button type="submit" className="btn-primary btn-lg w-full" disabled={loading || cart.length === 0}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Placing...
              </span>
            ) : (
              `Place Order · ₹${getTotal()}`
            )}
          </button>
        </form>

        {showToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-text-primary text-white px-6 py-3 rounded-xl shadow-elevated z-50 animate-fade-in-up text-sm font-medium">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImprovedOrderPage;
