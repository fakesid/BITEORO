import React, { createContext, useContext, useState } from "react";

const gradients = [
  // Instagram‑style gradient (warm pink → purple → blue)
  "linear-gradient(90deg, #feda75 0%, #d62976 50%, #962fbf 75%, #4f5bd5 100%)",
  "linear-gradient(90deg, #ff9966 0%, #ff5e62 100%)",
  "linear-gradient(90deg, #36d1c4 0%, #5b86e5 100%)",
  // Add more gradients here if needed
];

const AccentContext = createContext();

export function AccentProvider({ children }) {
  const [accent, setAccent] = useState(gradients[0]);

  // Update CSS variable globally
  React.useEffect(() => {
    document.documentElement.style.setProperty('--accent-gradient', accent);
  }, [accent]);

  return (
    <AccentContext.Provider value={{ accent, setAccent, gradients }}>
      {children}
    </AccentContext.Provider>
  );
}

export function useAccent() {
  return useContext(AccentContext);
}
