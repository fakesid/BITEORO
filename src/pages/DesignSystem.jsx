import React from "react";
import { useAccentColor } from "../hooks/useAccentColor";
import {
  FaHome,
  FaBoxOpen,
  FaChartBar,
  FaUserFriends,
  FaUtensils,
  FaHistory,
  FaUserTie,
  FaPalette,
} from "react-icons/fa";

// Color Picker Component
function ColorPicker({ color, onChange }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <label className="font-semibold text-sm">Pick Accent Color:</label>
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer"
        aria-label="Pick accent color"
      />
      <span className="font-mono text-xs">{color}</span>
    </div>
  );
}

// Instagram-style Sidebar Button
function SidebarButtonRedesigned({ icon, name, active, onClick, accentColor }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-3 rounded-xl text-base font-bold transition-all duration-200 relative overflow-hidden w-full shadow-none border-none bg-white hover:bg-gray-50 ${
        active ? "text-black" : "text-gray-400"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <span className="text-2xl">{icon}</span>
      <span className="hidden xl:inline">{name}</span>
      {active && (
        <span
          style={{ backgroundColor: accentColor }}
          className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 rounded-full"
        ></span>
      )}
    </button>
  );
}

// Instagram-style Top Selling Items
function TopSellingItemsRedesigned({
  items = [
    { name: "Burger", sold: 23 },
    { name: "Coke - small", sold: 21 },
    { name: "Fries", sold: 18 },
  ],
  accentColor,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 max-w-md">
      <h2 className="text-xl font-extrabold mb-4 text-black">
        Top Selling Items
      </h2>
      <ol className="space-y-2">
        {items.map((item, idx) => (
          <li
            key={item.name}
            className="flex items-center justify-between px-4 py-2 bg-white rounded-xl border border-gray-100"
          >
            <span className="font-semibold text-black">
              {idx + 1}. {item.name}
            </span>
            <span style={{ color: accentColor }} className="font-bold">
              {item.sold} sold
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Instagram-style Recent Orders
function RecentOrdersRedesigned({
  orders = [{ id: "#CFzk", customer: "—", total: 204, paid: false }],
  accentColor,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 max-w-md">
      <h2 className="text-xl font-extrabold mb-4 text-black">Recent Orders</h2>
      <ul className="space-y-3">
        {orders.map((order) => (
          <li
            key={order.id}
            className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-100"
          >
            <div>
              <span className="font-bold text-black">{order.id}</span>
              <span className="block text-gray-400 text-xs">
                {order.customer}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">₹{order.total}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                  order.paid
                    ? "bg-green-50 text-green-600 border-green-200"
                    : ""
                }`}
                style={
                  order.paid
                    ? {}
                    : {
                        backgroundColor: accentColor + "22", // light bg
                        color: accentColor,
                        borderColor: accentColor + "44",
                      }
                }
              >
                {order.paid ? "Paid" : "Unpaid"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Instagram-style Low Stock Inventory
function LowStockInventoryRedesigned({
  items = [{ name: "ga", quantity: 2, unit: "pcs", min: 5 }],
  accentColor,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 max-w-md">
      <h2 className="text-xl font-extrabold mb-4 text-black">
        Low Stock Inventory
      </h2>
      <ul className="divide-y divide-gray-100">
        {items.map((item) => (
          <li key={item.name} className="py-2 flex justify-between items-center">
            <span className="font-medium text-black">{item.name}</span>
            <span
              style={{
                color: accentColor,
                backgroundColor: accentColor + "22",
              }}
              className="px-2 py-0.5 rounded-full text-xs font-bold"
            >
              {item.quantity} {item.unit} (Min: {item.min})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Instagram-style Dashboard Summary
function DashboardSummaryRedesigned({
  stats = {
    orders: 12,
    paid: 1682,
    unpaid: 142,
    revenue: 1824,
  },
  accentColor,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 max-w-md">
      <h2 className="text-xl font-extrabold mb-4 text-black">
        Today’s Sales Summary
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center">
          <span className="text-2xl">📦</span>
          <span className="font-bold text-black text-lg">
            {stats.orders}
          </span>
          <span className="text-xs text-gray-400">Orders Today</span>
        </div>
        <div
          className="rounded-xl p-4 flex flex-col items-center"
          style={{ backgroundColor: accentColor + "22" }}
        >
          <span className="text-2xl">✔️</span>
          <span className="font-bold text-lg" style={{ color: accentColor }}>
            ₹{stats.paid}
          </span>
          <span className="text-xs" style={{ color: accentColor }}>
            Paid
          </span>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center">
          <span className="text-2xl">❌</span>
          <span className="font-bold text-black text-lg">
            ₹{stats.unpaid}
          </span>
          <span className="text-xs text-gray-400">Unpaid</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center col-span-2">
          <span className="text-2xl">💰</span>
          <span className="font-bold text-black text-lg">
            ₹{stats.revenue}
          </span>
          <span className="text-xs text-gray-400">Total Revenue</span>
        </div>
      </div>
    </div>
  );
}

// Instagram-style Accent Switcher
function AccentSwitcherRedesigned({ accentColor }) {
  return (
    <div className="flex gap-3 items-center">
      <span className="font-semibold text-sm">Accent:</span>
      <button
        className="w-10 h-10 rounded-full border-2 border-gray-200 focus:outline-none scale-110"
        style={{ backgroundColor: accentColor, borderColor: accentColor }}
        aria-label="Accent color"
        disabled
      />
    </div>
  );
}

function ComponentGallery({ accentColor }) {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-xl font-extrabold mb-4 tracking-tight text-black">
          Sidebar Button
        </h2>
        <SidebarButtonRedesigned
          icon={<FaHome />}
          name="Dashboard"
          active
          accentColor={accentColor}
        />
        <SidebarButtonRedesigned
          icon={<FaBoxOpen />}
          name="Inventory"
          accentColor={accentColor}
        />
        <SidebarButtonRedesigned
          icon={<FaChartBar />}
          name="Analytics"
          accentColor={accentColor}
        />
        <SidebarButtonRedesigned
          icon={<FaUserFriends />}
          name="Customers"
          accentColor={accentColor}
        />
        <SidebarButtonRedesigned
          icon={<FaUtensils />}
          name="Menu"
          accentColor={accentColor}
        />
        <SidebarButtonRedesigned
          icon={<FaHistory />}
          name="History"
          accentColor={accentColor}
        />
        <SidebarButtonRedesigned
          icon={<FaUserTie />}
          name="Staff"
          accentColor={accentColor}
        />
        <SidebarButtonRedesigned
          icon={<FaPalette />}
          name="Design System"
          accentColor={accentColor}
        />
      </section>
      <section>
        <h2 className="text-xl font-extrabold mb-4 tracking-tight text-black">
          Top Selling Items
        </h2>
        <TopSellingItemsRedesigned accentColor={accentColor} />
      </section>
      <section>
        <h2 className="text-xl font-extrabold mb-4 tracking-tight text-black">
          Recent Orders
        </h2>
        <RecentOrdersRedesigned accentColor={accentColor} />
      </section>
      <section>
        <h2 className="text-xl font-extrabold mb-4 tracking-tight text-black">
          Low Stock Inventory
        </h2>
        <LowStockInventoryRedesigned accentColor={accentColor} />
      </section>
      <section>
        <h2 className="text-xl font-extrabold mb-4 tracking-tight text-black">
          Dashboard Summary
        </h2>
        <DashboardSummaryRedesigned accentColor={accentColor} />
      </section>
      <section>
        <h2 className="text-xl font-extrabold mb-4 tracking-tight text-black">
          Accent Switcher
        </h2>
        <AccentSwitcherRedesigned accentColor={accentColor} />
      </section>
    </div>
  );
}

export default function DesignSystem() {
  // default to one of Instagram's signature pinks
  const [accentColor, setAccentColor, loading] = useAccentColor("#d62976");
  return (
    <div className="min-h-screen bg-white p-4 text-black font-sans">
      <h1 className="text-3xl font-extrabold mb-8 tracking-tight text-black font-sans">
        Instagram-Inspired UI Kit
      </h1>
      <ColorPicker color={accentColor} onChange={setAccentColor} />
      {loading ? (
        <div className="text-gray-400">Loading accent color...</div>
      ) : (
        <ComponentGallery accentColor={accentColor} />
      )}
    </div>
  );
}
