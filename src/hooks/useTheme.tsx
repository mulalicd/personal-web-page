import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ThemeContextType {
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/** Stored choice, else the OS setting. Same rule as the inline script in index.html. */
function preferredDark(): boolean {
  try {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
  } catch {
    // Storage blocked: fall back to the OS setting.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Starts as the prerendered value (light) so hydration matches; the real
  // preference is read after mount. The inline script in index.html has
  // already applied the `dark` class, so there is no visible flash.
  const [isDark, setIsDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIsDark(preferredDark());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      // Storage blocked: the choice lasts for this visit only.
    }
  }, [isDark, ready]);

  const toggle = () => {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    setIsDark((v) => !v);
    setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 450);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
