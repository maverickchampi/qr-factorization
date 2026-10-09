import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("qr-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("qr-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const html = document.documentElement;
    html.classList.add("theme-transition");
    setTheme((t) => (t === "dark" ? "light" : "dark"));
    window.setTimeout(() => html.classList.remove("theme-transition"), 300);
  }, []);

  return { theme, toggleTheme };
}
