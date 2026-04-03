import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import PublicStorefront from "./pages/PublicStorefront";
import './index.css';
import './accent.css';
import { AccentProvider } from "./context/AccentContext";
import { AuthProvider } from "./context/AuthContext";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <AccentProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/store/:businessId" element={<PublicStorefront />} />
            <Route path="/*" element={<App />} />
          </Routes>
        </BrowserRouter>
      </AccentProvider>
    </AuthProvider>
  </React.StrictMode>
);
