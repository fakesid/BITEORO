import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { FiSearch, FiPlus, FiMinus, FiTrash2, FiChevronUp, FiChevronDown, FiPackage, FiAlertTriangle } from "react-icons/fi";

export default function Inventory() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", quantity: "", unit: "pcs", min: 5 });
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const inventoryCollection = user ? collection(db, "users", user.uid, "inventory") : null;

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(inventoryCollection, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]); // eslint-disable-line

  const addItem = async () => {
    if (!newItem.name || !newItem.quantity) return;
    await addDoc(inventoryCollection, { ...newItem, quantity: parseFloat(newItem.quantity), min: parseFloat(newItem.min || 0) });
    setNewItem({ name: "", quantity: "", unit: "pcs", min: 5 });
    setShowAddForm(false);
  };

  const adjustQty = async (id, delta) => {
    const ref = doc(db, "users", user.uid, "inventory", id);
    const item = items.find((i) => i.id === id);
    const newQty = Math.max(0, (item.quantity || 0) + delta);
    await updateDoc(ref, { quantity: newQty });
  };

  const deleteItem = async (id) => {
    if (window.confirm("Delete this inventory item?")) {
      await deleteDoc(doc(db, "users", user.uid, "inventory", id));
    }
  };

  const total = items.length;
  const lowStock = items.filter((i) => i.quantity <= i.min && i.quantity > 0).length;
  const outStock = items.filter((i) => i.quantity === 0).length;

  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const handleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("asc"); }
  };

  const filteredItems = items
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let valA = a[sortBy], valB = b[sortBy];
      if (sortBy === "name") { valA = valA?.toLowerCase(); valB = valB?.toLowerCase(); }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return null;
    return sortDir === "asc" ? <FiChevronUp className="inline w-3.5 h-3.5" /> : <FiChevronDown className="inline w-3.5 h-3.5" />;
  };

  const getStatus = (item) => {
    if (item.quantity === 0) return { label: "Out of Stock", cls: "badge-danger" };
    if (item.quantity <= item.min) return { label: "Low Stock", cls: "badge-warning" };
    return { label: "Healthy", cls: "badge-success" };
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="page-title">Inventory</h2>
          <p className="text-sm text-text-muted mt-1">Track and manage your stock levels</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary btn-lg w-full sm:w-auto justify-center">
          <FiPlus className="mr-1.5" /> Add item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-text-primary">{total}</p>
          <p className="text-xs text-text-muted mt-0.5">Total items</p>
        </div>
        <div className="card p-4 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <FiAlertTriangle className="text-warning-600 text-sm" />
            <p className="text-2xl font-bold text-warning-600">{lowStock}</p>
          </div>
          <p className="text-xs text-text-muted mt-0.5">Low stock</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-danger-600">{outStock}</p>
          <p className="text-xs text-text-muted mt-0.5">Out of stock</p>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="card p-5 mb-6 animate-fade-in-up">
          <h3 className="section-title mb-4">New inventory item</h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Name</label>
              <input type="text" placeholder="Item name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Quantity</label>
              <input type="number" placeholder="0" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Unit</label>
              <select value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} className="input">
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="L">L</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Min threshold</label>
              <input type="number" placeholder="5" value={newItem.min} onChange={(e) => setNewItem({ ...newItem, min: e.target.value })} className="input" />
            </div>
            <div className="flex gap-2">
              <button onClick={addItem} className="btn-primary btn-lg flex-1">Add</button>
              <button onClick={() => setShowAddForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
      </div>

      <div className="space-y-3 md:hidden">
        {filteredItems.map((item) => {
          const status = getStatus(item);
          return (
            <div key={item.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.quantity === 0 ? "bg-danger-50" : item.quantity <= item.min ? "bg-warning-50" : "bg-brand-50"}`}>
                  <FiPackage className={`text-base ${item.quantity === 0 ? "text-danger-500" : item.quantity <= item.min ? "text-warning-500" : "text-brand-500"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-text-primary truncate">{item.name}</p>
                      <p className="text-xs text-text-muted mt-1">Min threshold: {item.min} {item.unit}</p>
                    </div>
                    <span className={status.cls}>{status.label}</span>
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                      <p className={`text-xl font-bold ${item.quantity === 0 ? "text-danger-600" : item.quantity <= item.min ? "text-warning-600" : "text-text-primary"}`}>{item.quantity}</p>
                      <p className="text-xs text-text-muted uppercase tracking-wide">{item.unit}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => adjustQty(item.id, -1)} className="btn-icon w-9 h-9 rounded-xl bg-surface-tertiary text-text-secondary hover:bg-border"><FiMinus className="text-sm" /></button>
                      <button onClick={() => adjustQty(item.id, 1)} className="btn-icon w-9 h-9 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100"><FiPlus className="text-sm" /></button>
                      <button onClick={() => deleteItem(item.id)} className="btn-icon w-9 h-9 rounded-xl text-text-muted hover:bg-danger-50 hover:text-danger-500"><FiTrash2 className="text-sm" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredItems.length === 0 && (
          <div className="card p-8 text-center text-text-muted">No inventory items found.</div>
        )}
      </div>

      {/* Table */}
      <div className="hidden md:block table-container">
        <table className="w-full">
          <thead>
            <tr className="table-head">
              <th className="table-cell cursor-pointer select-none" onClick={() => handleSort("name")}>Item <SortIcon col="name" /></th>
              <th className="table-cell cursor-pointer select-none" onClick={() => handleSort("quantity")}>Quantity <SortIcon col="quantity" /></th>
              <th className="table-cell">Unit</th>
              <th className="table-cell cursor-pointer select-none" onClick={() => handleSort("min")}>Min <SortIcon col="min" /></th>
              <th className="table-cell">Status</th>
              <th className="table-cell text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const status = getStatus(item);
              return (
                <tr key={item.id} className="table-row">
                  <td className="table-cell font-medium text-text-primary">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.quantity === 0 ? "bg-danger-50" : item.quantity <= item.min ? "bg-warning-50" : "bg-brand-50"}`}>
                        <FiPackage className={`text-sm ${item.quantity === 0 ? "text-danger-500" : item.quantity <= item.min ? "text-warning-500" : "text-brand-500"}`} />
                      </div>
                      {item.name}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`font-semibold ${item.quantity === 0 ? "text-danger-600" : item.quantity <= item.min ? "text-warning-600" : "text-text-primary"}`}>{item.quantity}</span>
                  </td>
                  <td className="table-cell text-text-muted">{item.unit}</td>
                  <td className="table-cell text-text-muted">{item.min}</td>
                  <td className="table-cell"><span className={status.cls}>{status.label}</span></td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => adjustQty(item.id, -1)} className="btn-icon w-7 h-7 rounded-lg bg-surface-tertiary text-text-secondary hover:bg-border"><FiMinus className="text-xs" /></button>
                      <button onClick={() => adjustQty(item.id, 1)} className="btn-icon w-7 h-7 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100"><FiPlus className="text-xs" /></button>
                      <button onClick={() => deleteItem(item.id)} className="btn-icon w-7 h-7 rounded-lg text-text-muted hover:bg-danger-50 hover:text-danger-500 ml-1"><FiTrash2 className="text-xs" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredItems.length === 0 && (
              <tr><td colSpan={6} className="table-cell text-center text-text-muted py-12">No inventory items found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
