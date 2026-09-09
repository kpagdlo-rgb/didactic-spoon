"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("meder-theme");
    const wantsDark =
      saved === "dark" ||
      (!saved && matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(wantsDark);
    document.documentElement.dataset.theme = wantsDark ? "dark" : "light";
  }, []);
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.dataset.theme = next ? "dark" : "light";
        localStorage.setItem("meder-theme", next ? "dark" : "light");
      }}
    >
      {dark ? (
        <Sun size={16} strokeWidth={2} aria-hidden="true" />
      ) : (
        <Moon size={16} strokeWidth={2} aria-hidden="true" />
      )}
    </button>
  );
}
