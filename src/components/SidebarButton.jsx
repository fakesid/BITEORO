import React from "react";

export default function SidebarButton({ icon, name, active, onClick, collapsed = false }) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative min-h-11 ${
        active
          ? "bg-brand-50 text-brand-600"
          : "text-text-muted hover:bg-surface-tertiary hover:text-text-primary"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {/* Active indicator bar */}
      <span
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full transition-all duration-200 ${
          active ? "h-5 bg-brand-500" : "h-0 bg-transparent"
        }`}
      />
      <span className={`text-lg transition-colors duration-200 ${active ? "text-brand-500" : "text-text-muted group-hover:text-text-secondary"}`}>
        {icon}
      </span>
      <span className={`${collapsed ? "xl:hidden" : "inline"} truncate`}>{name}</span>
    </button>
  );
}
