import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiChevronUp, FiChevronDown, FiPackage } from "react-icons/fi";

function MenuManager() {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: "", inStock: true });
  const [editingItemId, setEditingItemId] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ message: "", type: "" });
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [showAddForm, setShowAddForm] = useState(false);

  const menuCollection = user ? collection(db, "users", user.uid, "menu") : null;

  useEffect(() => { if (user) fetchMenu(); }, [user]); // eslint-disable-line

  const fetchMenu = async () => {
    if (!menuCollection) return;
    const snapshot = await getDocs(menuCollection);
    setMenuItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) { setToast({ message: "Name and price required", type: "error" }); return; }
    try {
      await addDoc(menuCollection, { ...newItem, price: parseFloat(newItem.price), inStock: !!newItem.inStock });
      setNewItem({ name: "", price: "", inStock: true });
      setShowAddForm(false);
      setToast({ message: "Item added!", type: "success" });
      fetchMenu();
    } catch { setToast({ message: "Failed to add item", type: "error" }); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "menu", id));
      setToast({ message: "Item deleted!", type: "success" });
      fetchMenu();
    } catch { setToast({ message: "Failed to delete item", type: "error" }); }
  };

  const handleUpdate = async (id, updated) => {
    if (!updated.name || !updated.price) { setToast({ message: "Name and price required", type: "error" }); return; }
    try {
      await updateDoc(doc(db, "users", user.uid, "menu", id), updated);
      setEditingItemId(null);
      setToast({ message: "Item updated!", type: "success" });
      fetchMenu();
    } catch { setToast({ message: "Failed to update item", type: "error" }); }
  };

  const sortItems = (items) => {
    return [...items].sort((a, b) => {
      let valA = a[sortBy], valB = b[sortBy];
      if (sortBy === "name") { valA = valA?.toLowerCase(); valB = valB?.toLowerCase(); }
      if (sortBy === "inStock") { valA = a.inStock ? 1 : 0; valB = b.inStock ? 1 : 0; }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  };

  const filteredItems = sortItems(menuItems.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())));
  const total = menuItems.length;
  const inStock = menuItems.filter((i) => i.inStock).length;
  const outStock = total - inStock;

  useEffect(() => { if (toast.message) { const t = setTimeout(() => setToast({ message: "", type: "" }), 2500); return () => clearTimeout(t); } }, [toast]);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("asc"); }
  };

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return null;
    return sortDir === "asc" ? <FiChevronUp className="inline w-3.5 h-3.5" /> : <FiChevronDown className="inline w-3.5 h-3.5" />;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="page-title">Menu Manager</h2>
          <p className="text-sm text-text-muted mt-1">Manage your restaurant menu items</p>
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
          <p className="text-2xl font-bold text-success-600">{inStock}</p>
          <p className="text-xs text-text-muted mt-0.5">In stock</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-danger-600">{outStock}</p>
          <p className="text-xs text-text-muted mt-0.5">Out of stock</p>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="card p-5 mb-6 animate-fade-in-up">
          <h3 className="section-title mb-4">New menu item</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Name</label>
              <input type="text" placeholder="Item name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Price</label>
              <input type="number" placeholder="0.00" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Availability</label>
              <button type="button" onClick={() => setNewItem((prev) => ({ ...prev, inStock: !prev.inStock }))} className={`w-full py-2.5 rounded-xl text-sm font-medium border transition-all ${newItem.inStock ? "bg-success-50 border-success-200 text-success-700" : "bg-danger-50 border-danger-200 text-danger-700"}`}>
                {newItem.inStock ? "In Stock" : "Out of Stock"}
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddItem} className="btn-primary btn-lg flex-1">Add</button>
              <button onClick={() => setShowAddForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" placeholder="Search menu items..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
      </div>

      <div className="space-y-3 md:hidden">
        {filteredItems.map((item) => (
          <div key={item.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <FiPackage className="text-brand-500 text-base" />
                </div>
                <div className="min-w-0 flex-1">
                  {editingItemId === item.id ? (
                    <div className="space-y-3">
                      <input type="text" value={item.name} onChange={(e) => setMenuItems((prev) => prev.map((i) => i.id === item.id ? { ...i, name: e.target.value } : i))} className="input" />
                      <input type="number" value={item.price} onChange={(e) => setMenuItems((prev) => prev.map((i) => i.id === item.id ? { ...i, price: e.target.value } : i))} className="input" />
                      <button type="button" onClick={() => setMenuItems((prev) => prev.map((i) => i.id === item.id ? { ...i, inStock: !i.inStock } : i))} className={`w-full py-2.5 rounded-xl text-sm font-medium border transition-all ${item.inStock ? "bg-success-50 border-success-200 text-success-700" : "bg-danger-50 border-danger-200 text-danger-700"}`}>
                        {item.inStock ? "In Stock" : "Out of Stock"}
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-text-primary truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-sm font-medium text-text-primary">{String.fromCharCode(8377)}{item.price}</span>
                        {item.inStock ? <span className="badge-success">In Stock</span> : <span className="badge-danger">Out of Stock</span>}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              {editingItemId === item.id ? (
                <>
                  <button onClick={() => handleUpdate(item.id, item)} className="btn-success btn-md flex-1 justify-center"><FiCheck /> Save</button>
                  <button onClick={() => setEditingItemId(null)} className="btn-secondary btn-md flex-1 justify-center"><FiX /> Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => setEditingItemId(item.id)} className="btn-secondary btn-md flex-1 justify-center"><FiEdit2 /> Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="btn-danger btn-md flex-1 justify-center"><FiTrash2 /> Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="card p-8 text-center text-text-muted">No menu items found.</div>
        )}
      </div>

      {/* Table */}
      <div className="hidden md:block table-container">
        <table className="w-full">
          <thead>
            <tr className="table-head">
              <th className="table-cell cursor-pointer select-none" onClick={() => handleSort("name")}>Name <SortIcon col="name" /></th>
              <th className="table-cell cursor-pointer select-none" onClick={() => handleSort("price")}>Price <SortIcon col="price" /></th>
              <th className="table-cell cursor-pointer select-none" onClick={() => handleSort("inStock")}>Status <SortIcon col="inStock" /></th>
              <th className="table-cell text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="table-row">
                <td className="table-cell font-medium text-text-primary">
                  {editingItemId === item.id ? (
                    <input type="text" value={item.name} onChange={(e) => setMenuItems((prev) => prev.map((i) => i.id === item.id ? { ...i, name: e.target.value } : i))} className="input py-1.5" />
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center"><FiPackage className="text-brand-500 text-sm" /></div>
                      {item.name}
                    </div>
                  )}
                </td>
                <td className="table-cell">
                  {editingItemId === item.id ? (
                    <input type="number" value={item.price} onChange={(e) => setMenuItems((prev) => prev.map((i) => i.id === item.id ? { ...i, price: e.target.value } : i))} className="input py-1.5 w-24" />
                  ) : (
                    <span className="font-medium">{String.fromCharCode(8377)}{item.price}</span>
                  )}
                </td>
                <td className="table-cell">
                  {editingItemId === item.id ? (
                    <button type="button" onClick={() => setMenuItems((prev) => prev.map((i) => i.id === item.id ? { ...i, inStock: !i.inStock } : i))} className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${item.inStock ? "bg-success-50 border-success-200 text-success-700" : "bg-danger-50 border-danger-200 text-danger-700"}`}>
                      {item.inStock ? "In Stock" : "Out of Stock"}
                    </button>
                  ) : (
                    item.inStock ? <span className="badge-success">In Stock</span> : <span className="badge-danger">Out of Stock</span>
                  )}
                </td>
                <td className="table-cell text-right">
                  {editingItemId === item.id ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => handleUpdate(item.id, item)} className="btn-icon w-8 h-8 rounded-lg bg-success-50 text-success-600 hover:bg-success-100"><FiCheck /></button>
                      <button onClick={() => setEditingItemId(null)} className="btn-icon w-8 h-8 rounded-lg bg-surface-tertiary text-text-muted hover:bg-border"><FiX /></button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setEditingItemId(item.id)} className="btn-icon w-8 h-8 rounded-lg text-text-muted hover:bg-surface-tertiary hover:text-brand-500"><FiEdit2 className="text-sm" /></button>
                      <button onClick={() => handleDelete(item.id)} className="btn-icon w-8 h-8 rounded-lg text-text-muted hover:bg-danger-50 hover:text-danger-500"><FiTrash2 className="text-sm" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr><td colSpan={4} className="table-cell text-center text-text-muted py-12">No menu items found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Toast */}
      {toast.message && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-elevated z-50 animate-fade-in-up text-sm font-medium ${toast.type === "success" ? "bg-success-600 text-white" : "bg-danger-600 text-white"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default MenuManager;
