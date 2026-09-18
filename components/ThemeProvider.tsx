"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const STORAGE_KEY = "ow-theme";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void; mounted: boolean }>({
  theme: "light",
  toggle: () => {},
  mounted: false,
});

function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Sync with the pre-paint script result after mount (no hydration mismatch:
  // nothing theme-dependent renders before mount).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time mount guard: reads the pre-paint theme once, no subscriptions, no cascade
    setTheme(currentTheme());
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Private mode — theme still applies for this session
      }
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, toggle, mounted }}>{children}</ThemeContext.Provider>;
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle, mounted } = useContext(ThemeContext);
  const t = useTranslations("theme");

  if (!mounted) {
    // Same-size placeholder: no layout shift, no hydration mismatch.
    return <span aria-hidden className={cn("inline-block h-9 w-9 rounded-md", className)} />;
  }

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? t("toLight") : t("toDark")}
      title={isDark ? t("toLight") : t("toDark")}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
        className,
      )}
    >
      {isDark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
    </button>
  );
}
