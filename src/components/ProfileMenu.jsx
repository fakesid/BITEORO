import React, { useRef, useState, useEffect } from "react";
import { FiSettings, FiLogOut, FiChevronDown } from "react-icons/fi";

export default function ProfileMenu({ user, onSettings, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        onClick={() => setOpen((v) => !v)}
        aria-label="Profile menu"
      >
        <span className="text-white text-xs font-bold">
          {user?.email?.[0]?.toUpperCase() || "U"}
        </span>
        <FiChevronDown className="ml-1 text-white text-xs" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-lg border border-border z-50 animate-fade-in-up">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-text-primary">{user?.email?.split("@")[0]}</p>
            <p className="text-2xs text-text-muted">Owner</p>
          </div>
          <button
            className="flex items-center gap-2 w-full px-4 py-3 text-sm text-text-primary hover:bg-surface-tertiary transition-colors"
            onClick={() => { setOpen(false); onSettings(); }}
          >
            <FiSettings className="text-base" /> Settings
          </button>
          <button
            className="flex items-center gap-2 w-full px-4 py-3 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
            onClick={() => { setOpen(false); onLogout(); }}
          >
            <FiLogOut className="text-base" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
