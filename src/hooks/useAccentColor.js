import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export function useAccentColor(defaultColor = "#ef4444") {
  const [color, setColor] = useState(defaultColor);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchColor() {
      try {
        const docRef = doc(db, "ui", "accentColor");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setColor(snap.data().color || defaultColor);
        }
      } catch (e) {
        // fallback to default
      } finally {
        setLoading(false);
      }
    }
    fetchColor();
  }, [defaultColor]);

  const saveColor = async (newColor) => {
    setColor(newColor);
    await setDoc(doc(db, "ui", "accentColor"), { color: newColor });
  };

  return [color, saveColor, loading];
}
