import React, { useState } from "react";

function AdminSetupForm({ userId, onComplete, createAdminProfile }) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !pin || !confirmPin) {
      setError("All fields are required.");
      return;
    }
    if (pin !== confirmPin) {
      setError("Pins do not match.");
      return;
    }
    setLoading(true);
    try {
      await createAdminProfile(userId, { username, pin });
      onComplete();
    } catch (err) {
      setError("Failed to create admin profile.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Set Up Admin Profile</h2>
      <div className="mb-3">
        <label className="block mb-1">Admin Username</label>
        <input
          className="w-full border px-3 py-2 rounded"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="block mb-1">Admin Pin</label>
        <input
          type="password"
          className="w-full border px-3 py-2 rounded"
          value={pin}
          onChange={e => setPin(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="block mb-1">Confirm Pin</label>
        <input
          type="password"
          className="w-full border px-3 py-2 rounded"
          value={confirmPin}
          onChange={e => setConfirmPin(e.target.value)}
          required
        />
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button
        type="submit"
        className="w-full bg-orange-500 text-white py-2 rounded font-bold"
        disabled={loading}
      >
        {loading ? "Saving..." : "Create Admin Profile"}
      </button>
    </form>
  );
}

export default AdminSetupForm;
