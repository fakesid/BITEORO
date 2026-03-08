import { useState } from "react";

function ProfileSettings() {
  return (
    <section className="mb-6 p-4 bg-white rounded shadow">
      <h3 className="font-bold mb-2">Profile Settings</h3>
      {/* Name, DP, Password update form placeholder */}
      <p>Edit your name, display picture, and password here.</p>
    </section>
  );
}

function StaffList() {
  return (
    <section className="mb-6 p-4 bg-white rounded shadow">
      <h3 className="font-bold mb-2">Staff Management</h3>
      {/* Staff list and add/edit/remove staff placeholder */}
      <p>Manage staff accounts and roles here.</p>
    </section>
  );
}

function RoleAccessManager() {
  return (
    <section className="mb-6 p-4 bg-white rounded shadow">
      <h3 className="font-bold mb-2">Role & Access Control</h3>
      {/* Role and access control placeholder */}
      <p>Set what each staff role can access.</p>
    </section>
  );
}

function DarkModeToggle({ darkMode, setDarkMode }) {
  return (
    <section className="mb-6 p-4 bg-white rounded shadow flex items-center gap-4">
      <span className="font-bold">Dark Mode</span>
      <button
        onClick={() => setDarkMode((d) => !d)}
        className={`px-4 py-2 rounded-full font-semibold ${darkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-800"}`}
      >
        {darkMode ? "On" : "Off"}
      </button>
    </section>
  );
}

function AdminPanel() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? "bg-gray-900 min-h-screen text-white" : "bg-gray-50 min-h-screen text-gray-900"} style={{ padding: 20 }}>
      <h2 className="text-2xl font-bold mb-6">👑 Admin Panel</h2>
      <ProfileSettings />
      <StaffList />
      <RoleAccessManager />
      <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
    </div>
  );
}

export default AdminPanel;
