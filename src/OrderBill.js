import React from "react";

function OrderBill({ order }) {
  if (!order) return null;

  const {
    id,
    customerName,
    customerPhone,
    items,
    total,
    paid,
    createdAt
  } = order;

  const formattedDate =
    createdAt?.toDate?.() instanceof Date
      ? createdAt.toDate().toLocaleString()
      : new Date().toLocaleString();

  return (
    <>
      {/* 🔧 Embedded print-specific CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            background: white;
            padding: 20px;
          }
          .print-button {
            display: none !important;
          }
        }
      `}</style>

      <div className="print-area" style={{ padding: 20, border: "1px solid #ccc", maxWidth: 600, background: "#fff" }}>
        <h2 style={{ marginBottom: 10 }}>🧾 Cafe Receipt</h2>
        <p><strong>Order ID:</strong> {id}</p>
        <p><strong>Date:</strong> {formattedDate}</p>
        <p><strong>Customer:</strong> {customerName || "N/A"}</p>
        <p><strong>Phone:</strong> {customerPhone || "N/A"}</p>
        <hr />

        <div>
          {items.map((item, idx) => (
            <div key={idx} style={{ marginBottom: 5 }}>
              {item.name} × {item.quantity} = ₹{item.price * item.quantity}
            </div>
          ))}
        </div>

        <hr />
        <h4>Total: ₹{total}</h4>
        <p>Status: {paid ? "✅ Paid" : "❌ Unpaid"}</p>

        <button
          onClick={() => window.print()}
          className="print-button"
          style={{ marginTop: 10 }}
        >
          🖨️ Print Bill
        </button>
      </div>
    </>
  );
}

export default OrderBill;
