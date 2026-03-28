import React from "react";
import { useTheme } from "../context/ThemeContext";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <FiSun className="text-yellow-500 text-lg" />
      ) : (
        <FiMoon className="text-gray-700 text-lg" />
      )}
    </button>
  );
}
