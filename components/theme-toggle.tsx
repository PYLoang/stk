"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";
const themeEvent = "stk-theme-change";

function themeSnapshot(): Theme {
  if (typeof window === "undefined") return "light";

  return (localStorage.getItem("theme") as Theme | null) ?? "light";
}

function subscribeToTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(themeEvent, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(themeEvent, callback);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, themeSnapshot, () => "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    window.dispatchEvent(new Event(themeEvent));
  };

  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
      <i className={`fa-solid ${theme === "light" ? "fa-sun" : "fa-moon"}`} aria-hidden />
      <span>{theme === "light" ? "LIGHT" : "DARK"}</span>
    </button>
  );
}
