
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";


function StaffManager({ userId }) {
  const [staffList, setStaffList] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists() && userDoc.data().staffProfiles) {
          setStaffList(userDoc.data().staffProfiles);
        } else {
          setStaffList([]);
        }
      } catch (err) {
        setError("Failed to fetch staff list.");
      }
    };
    if (userId) fetchStaff();
  }, [userId]);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      const bcrypt = await import("bcryptjs");
      const passwordHash = await bcrypt.hash(password, 10);
      const newStaff = { name, email, passwordHash, permissions };
      const updatedList = [...staffList, newStaff];
      await setDoc(doc(db, "users", userId), { staffProfiles: updatedList }, { merge: true });
      setStaffList(updatedList);
      setName(""); setEmail(""); setPassword(""); setPermissions([]);
      setSuccess("Staff added successfully.");
    } catch (err) {
      setError("Failed to add staff.");
    }
    setLoading(false);
  };

  // For simplicity, only add staff. Edit/delete can be added similarly.

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Staff Management</h2>
      <form onSubmit={handleAddStaff} className="mb-6">
        <div className="mb-2">
          <label className="block mb-1">Name</label>
          <input className="w-full border px-3 py-2 rounded" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Email</label>
          <input className="w-full border px-3 py-2 rounded" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Password</label>
          <input type="password" className="w-full border px-3 py-2 rounded" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {/* Permissions can be a multi-select or checkboxes. For now, just a text input. */}
        <div className="mb-2">
          <label className="block mb-1">Permissions (comma separated)</label>
          <input className="w-full border px-3 py-2 rounded" value={permissions.join(",")} onChange={e => setPermissions(e.target.value.split(",").map(p => p.trim()).filter(Boolean))} />
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded font-bold" disabled={loading}>
          {loading ? "Adding..." : "Add Staff"}
        </button>
      </form>
      <h3 className="font-bold mb-2">Current Staff</h3>
      <ul>
        {staffList.length === 0 && <li className="text-gray-500">No staff added yet.</li>}
        {staffList.map((staff, idx) => (
          <li key={idx} className="mb-1 border-b pb-1">
            {staff.name} ({staff.email})
            {staff.permissions && staff.permissions.length > 0 && (
              <span className="text-xs text-gray-500 ml-2">[{staff.permissions.join(", ")}]</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StaffManager;
