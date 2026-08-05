import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

// Single source of truth for the theme, shared via context so every
// consumer (Nav's toggle, the hero's shader, section styling) re-renders
// together instead of drifting out of sync with independent local state.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#080808" : "#f8f6f3");

    try {
      localStorage.setItem("theme", theme);
    } catch {
      // localStorage unavailable (private browsing, etc.) - theme still
      // applies for this session, it just won't persist.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
