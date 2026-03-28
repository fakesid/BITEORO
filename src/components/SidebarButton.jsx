import React from 'react';

export default function SidebarButton({ icon, name, active, onClick, collapsed }) {
  return (
    <button
      onClick={onClick}
      // Group class add ki taaki icon/text hover par ek saath react karein
      className={`
        group relative flex items-center w-full transition-all duration-200 rounded-xl
        ${collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2.5 gap-3'}
        ${active 
          ? 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-semibold' 
          : 'text-text-muted dark:text-gray-400 hover:bg-surface-tertiary dark:hover:bg-gray-800 hover:text-text-primary'
        }
      `}
      aria-current={active ? "page" : undefined}
    >
      {/* 1. Active Indicator Bar (Left Side Line) */}
      <span
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-300 ${
          active ? "h-6 bg-brand-500" : "h-0 bg-transparent"
        }`}
      />

      {/* 2. Icon Section */}
      <span className={`
        text-lg transition-colors duration-200 
        ${active ? "text-brand-500" : "text-text-muted dark:text-gray-500 group-hover:text-text-secondary"}
      `}>
        {icon}
      </span>

      {/* 3. Text Section (Collapsed mode mein hide ho jayega) */}
      {!collapsed && (
        <span className="truncate text-sm sm:text-base transition-opacity duration-200">
          {name}
        </span>
      )}

      {/* 4. Tooltip (Optional: Sirf tab dikhega jab collapsed ho aur hover karein) */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          {name}
        </div>
      )}
    </button>
  );
}