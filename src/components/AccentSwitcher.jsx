import React from "react";
import { useAccent } from "../context/AccentContext";

export default function AccentSwitcher() {
  const { accent, setAccent, gradients } = useAccent();

  return (
    <div className="flex gap-3 items-center">
      <span className="font-semibold text-sm">Accent:</span>
      {gradients.map((g, idx) => (
        <button
          key={idx}
          onClick={() => setAccent(g)}
          className={`w-10 h-10 rounded-full border-2 transition-all duration-200 focus:outline-none ${accent === g ? 'border-orange-500 scale-110' : 'border-transparent'}`}
          style={{ backgroundImage: g }}
          aria-label={`Accent ${idx + 1}`}
        />
      ))}
    </div>
  );
}
