import React, { useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";

function StaffLoginForm({ userId, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists() && userDoc.data().staffProfiles) {
        const staff = userDoc.data().staffProfiles.find(
          s => s.name === username || s.email === username
        );
        if (!staff) {
          setError("Staff not found.");
        } else {
          const match = await bcrypt.compare(password, staff.passwordHash);
          if (match) {
            onLogin(staff);
          } else {
            setError("Incorrect password.");
          }
        }
      } else {
        setError("No staff accounts found.");
      }
    } catch (err) {
      setError("Login failed.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Staff Login</h2>
      <div className="mb-3">
        <label className="block mb-1">Username or Email</label>
        <input
          className="w-full border px-3 py-2 rounded"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="block mb-1">Password / Pin</label>
        <input
          type="password"
          className="w-full border px-3 py-2 rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button
        type="submit"
        className="w-full bg-orange-500 text-white py-2 rounded font-bold"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login as Staff"}
      </button>
    </form>
  );
}

export default StaffLoginForm;
