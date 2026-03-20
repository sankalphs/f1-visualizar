"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Explicitly manage dark class on html for reliability
  useEffect(() => {
    if (!mounted) return;
    const isDark = resolvedTheme === "dark" || theme === "dark";
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, resolvedTheme, mounted]);

  if (!mounted) {
    return (
      <div className="h-10 w-10 border-2 border-nb-primary bg-nb-surface-dim animate-pulse" />
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-10 w-10 items-center justify-center border-2 border-nb-primary bg-nb-surface text-nb-text hover:bg-nb-yellow hover:text-nb-primary transition-colors shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
