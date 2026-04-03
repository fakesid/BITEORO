import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import ReCAPTCHA from "react-google-recaptcha";
import { FiMinus, FiPlus, FiCheckCircle } from "react-icons/fi";
import { ThemeProvider } from '../context/ThemeContext';

function PublicStorefrontContent() {
  const { businessId } = useParams();
  const [businessName, setBusinessName] = useState("Loading...");
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [billing, setBilling] = useState({ taxRate: 0, taxLabel: "GST", showTaxOnBill: true });
  
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  
  const [error, setError] = useState("");

  const testSiteKey = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

  useEffect(() => {
    fetchStoreData();
  }, [businessId]);

  const fetchStoreData = async () => {
    setLoading(true);
    try {
      let finalName = "Our Cafe";
      
      const profileDoc = await getDoc(doc(db, "users", businessId, "settings", "profile"));
      if (profileDoc.exists() && profileDoc.data().restaurantName) {
        finalName = profileDoc.data().restaurantName;
      } else {
        const userDoc = await getDoc(doc(db, "users", businessId));
        if (userDoc.exists()) {
          const d = userDoc.data();
          if (d.businessName) finalName = d.businessName;
          else if (d.name) finalName = `${d.name}'s Cafe`;
          else if (d.email) finalName = `${d.email.split('@')[0]}'s Cafe`;
          finalName = finalName.replace(/\b\w/g, c => c.toUpperCase());
        } else {
          setBusinessName("Store Not Found");
          setLoading(false);
          return;
        }
      }
      setBusinessName(finalName);

      const snapshot = await getDocs(collection(db, "users", businessId, "menu"));
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).filter(item => item.inStock !== false);
      setMenuItems(items);

      try {
        const billDoc = await getDoc(doc(db, "users", businessId, "settings", "billing"));
        if (billDoc.exists()) setBilling(prev => ({ ...prev, ...billDoc.data() }));
      } catch (e) {
        console.error("Failed to load billing:", e);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load store menu.");
    }
    setLoading(false);
  };

  const addToCart = (item) => {
    const exists = cart.find(i => i.id === item.id);
    if (exists) {
      setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const decreaseQty = (id) => {
    const item = cart.find(i => i.id === id);
    if (item.quantity === 1) setCart(cart.filter(i => i.id !== id));
    else setCart(cart.map(i => i.id === id ? { ...i, quantity: item.quantity - 1 } : i));
  };
  
  const getSubtotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const getTaxAmount = () => Number((getSubtotal() * (billing.taxRate / 100)).toFixed(2));
  const getTotal = () => Number((getSubtotal() + getTaxAmount()).toFixed(2));

  const handleCaptcha = (value) => {
    setCaptchaVerified(!!value);
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return setError("Cart is empty.");
    if (!customerPhone || customerPhone.length !== 10) return setError("Please enter a valid 10-digit phone number.");
    if (!captchaVerified) return setError("Please complete the CAPTCHA.");
    
    setPlacingOrder(true);
    setError("");

    try {
      await addDoc(collection(db, "users", businessId, "orders"), {
        customerName,
        customerPhone,
        tableNumber: tableNumber ? parseInt(tableNumber) || tableNumber : null,
        items: cart,
        subtotal: getSubtotal(),
        taxAmount: getTaxAmount(),
        taxRate: billing.taxRate,
        taxLabel: billing.taxLabel,
        total: getTotal(),
        paid: false,
        paymentMode: "cash",
        status: "new",
        source: "public_page",
        createdAt: serverTimestamp()
      });
      setOrderComplete(true);
    } catch (err) {
      console.error(err);
      setError("Failed to place order. Try again.");
    }
    setPlacingOrder(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary dark:bg-gray-900">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent animate-spin rounded-full"></div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-secondary dark:bg-gray-900 px-4 text-center">
        <FiCheckCircle className="text-brand-500 text-6xl mb-4" />
        <h1 className="text-2xl font-bold text-text-primary dark:text-white mb-2">Order Received!</h1>
        <p className="text-text-muted dark:text-gray-400 mb-6 font-medium">Your order has been sent to {businessName}. We will prepare it shortly!</p>
        <button onClick={() => { setCart([]); setOrderComplete(false); }} className="btn-primary mt-2 px-8 py-3 text-lg">
          Place Another Order
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary dark:bg-gray-900 text-text-primary dark:text-white pb-32 font-sans">
      <header className="bg-surface dark:bg-gray-800 border-b border-border shadow-sm p-4 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-500 font-display tracking-tight">{businessName}</h1>
          <div className="badge-brand gap-1 items-center px-3 py-1 flex shadow-sm">
            <span className="font-semibold text-sm">{cart.length} items</span>
            <span className="text-white/80 shrink-0 mx-1">•</span>
            <span className="font-bold">₹{getTotal()}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:py-8 flex flex-col md:flex-row gap-6 lg:gap-8">
        <div className="flex-1 space-y-4">
          <h2 className="text-xl font-bold mb-4 font-display">Our Menu</h2>
          {menuItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 shadow-card rounded-2xl bg-surface border border-border">
              <p className="text-text-muted text-sm text-center">No items available right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {menuItems.map(item => (
                <div key={item.id} className="bg-surface dark:bg-gray-800 p-4 lg:p-5 rounded-2xl shadow-card border border-border flex justify-between items-center hover:border-brand-500/30 transition-all group">
                  <div className="min-w-0 pr-4">
                    <h3 className="font-bold text-text-primary dark:text-gray-100 truncate text-base">{item.name}</h3>
                    <p className="font-medium text-text-muted mt-0.5">₹{item.price}</p>
                  </div>
                  <button onClick={() => addToCart(item)} className="btn-primary py-1.5 px-4 text-sm whitespace-nowrap shadow-sm group-hover:scale-105 transition-transform">
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-full md:w-[360px] relative">
          <div className="space-y-5 md:sticky md:top-24 pb-8">
          {/* Cart Section */}
          <div className="bg-surface dark:bg-gray-800 p-5 rounded-2xl shadow-header border border-border">
            <h2 className="text-lg font-bold border-b border-border-light pb-3 mb-4 font-display">Your Cart</h2>
            {cart.length === 0 ? (
              <p className="text-sm text-text-muted mb-4 text-center py-4">Cart is empty</p>
            ) : (
              <div className="space-y-4 mb-5 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-surface-secondary/50 dark:bg-gray-700/50 p-2.5 rounded-xl border border-border/50">
                    <div className="flex-1 truncate pr-3">
                      <span className="font-semibold text-sm truncate block">{item.name}</span>
                      <p className="text-xs text-text-muted mt-0.5 font-medium">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 bg-surface dark:bg-gray-800 px-2 py-1 rounded-lg border border-border-light">
                      <button onClick={() => decreaseQty(item.id)} className="p-1 hover:text-danger-500 transition-colors"><FiMinus className="text-xs" /></button>
                      <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => addToCart(item)} className="p-1 hover:text-brand-500 transition-colors"><FiPlus className="text-xs" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-border-light pt-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-text-muted">Subtotal</span>
                <span className="font-bold text-text-primary">₹{getSubtotal()}</span>
              </div>
              {billing.taxRate > 0 && billing.showTaxOnBill && (
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-text-muted">{billing.taxLabel} <span className="text-2xs">({billing.taxRate}%)</span></span>
                  <span className="font-bold text-text-primary">₹{getTaxAmount()}</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-2 mt-2 border-t border-border-light/50">
                <span className="text-sm font-semibold text-text-primary">Total</span>
                <span className="text-2xl font-bold font-display text-brand-600 dark:text-brand-400">₹{getTotal()}</span>
              </div>
            </div>
          </div>

          {/* Checkout Section */}
          <div className="bg-surface dark:bg-gray-800 p-5 rounded-2xl shadow-header border border-border relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-gradient" />
            <h2 className="text-lg font-bold border-b border-border-light pb-3 mb-4 font-display">Checkout Details</h2>
            {error && <p className="text-danger-600 bg-danger-50 dark:bg-danger-900/30 p-2.5 rounded-xl text-xs font-medium mb-4 flex items-center gap-2 border border-danger-100 dark:border-danger-900/50">{error}</p>}
            <form onSubmit={placeOrder} className="space-y-4">
              <div>
                <label className="text-xs text-text-muted font-bold block mb-1.5 uppercase tracking-wider">Your Name <span className="text-danger-500">*</span></label>
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. John Doe" className="input text-sm py-2.5 bg-surface-secondary shadow-sm" required />
              </div>
              <div>
                <label className="text-xs text-text-muted font-bold block mb-1.5 uppercase tracking-wider">Phone Number <span className="text-danger-500">*</span></label>
                <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, '').substring(0, 10))} placeholder="10-digit number" className="input text-sm py-2.5 bg-surface-secondary shadow-sm" required />
              </div>
              <div>
                <label className="text-xs text-text-muted font-bold block mb-1.5 uppercase tracking-wider">Table No. / Remarks</label>
                <input type="text" value={tableNumber} onChange={e => setTableNumber(e.target.value)} placeholder="e.g. Table 12 or To-Go" className="input text-sm py-2.5 bg-surface-secondary shadow-sm" />
              </div>
              <div>
                <label className="text-xs text-text-muted font-bold block mb-1.5 uppercase tracking-wider">Payment Method</label>
                <div className="w-full text-center bg-surface-secondary border border-border px-3 py-2.5 rounded-xl text-text-primary text-sm font-semibold shadow-sm text-brand-600">
                  Pay at Counter
                </div>
              </div>
              
              <div className="py-2 flex justify-center w-full">
                <div className="transform scale-[0.85] origin-center -mx-4 w-[115%] flex justify-center rounded-xl overflow-hidden shadow-sm">
                  <ReCAPTCHA sitekey={testSiteKey} onChange={handleCaptcha} />
                </div>
              </div>

              <button type="submit" disabled={cart.length === 0 || placingOrder} className="btn-primary w-full py-3.5 shadow-md mt-1 text-base font-bold tracking-wide">
                {placingOrder ? "Placing Order..." : `Submit Order (₹${getTotal()})`}
              </button>
            </form>
          </div>
          </div>
        </div>
      </main>

      {/* Mobile sticky checkout bar */}
      {cart.length > 0 && !placingOrder && !orderComplete && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface dark:bg-gray-800 border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-4 z-50 flex items-center justify-between animate-fade-in-up">
          <div>
            <p className="text-2xs text-text-muted font-bold tracking-widest uppercase mb-0.5">Your Cart</p>
            <p className="font-extrabold text-lg text-brand-600 dark:text-brand-400">
              ₹{getTotal()} <span className="text-sm font-semibold text-text-secondary">({cart.length} items)</span>
            </p>
          </div>
          <button 
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} 
            className="btn-primary py-3 px-6 shadow-lg shadow-brand-500/30 font-bold tracking-wide"
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}

export default function PublicStorefront() {
  return (
    <ThemeProvider>
      <PublicStorefrontContent />
    </ThemeProvider>
  );
}
