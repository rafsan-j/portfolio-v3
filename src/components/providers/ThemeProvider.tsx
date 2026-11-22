'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'v4-theme';

interface ThemeContextValue {
  theme: Theme;
  mounted: boolean;
  setTheme: (next: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  mounted: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

function readStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // Ignore storage access errors in restricted environments
  }
  return null;
}

function writeStoredTheme(next: Theme): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Ignore storage write errors in restricted environments
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const domTheme = document.documentElement.getAttribute('data-theme');
    const storedTheme = readStoredTheme();
    const resolved: Theme =
      domTheme === 'light' || domTheme === 'dark'
        ? domTheme
        : storedTheme ?? 'dark';

    document.documentElement.setAttribute('data-theme', resolved);
    setThemeState(resolved);
    setMounted(true);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.setAttribute('data-theme', next);
    writeStoredTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      writeStoredTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, mounted, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
