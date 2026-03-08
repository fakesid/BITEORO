import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function SignUpStaff() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Add staff role to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        role: "staff",
      });
      setSuccess("Staff account created!");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6">Register Staff</h2>
        <input
          type="email"
          placeholder="Staff Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full p-2 border rounded"
          required
        />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded font-bold"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register Staff"}
        </button>
      </form>
    </div>
  );
}
