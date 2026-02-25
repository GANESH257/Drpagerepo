'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';

const STORAGE_KEY = 'aip_portal_theme';

export type PortalTheme = 'light' | 'dark';

type PortalThemeContextValue = {
  theme: PortalTheme;
  setTheme: (theme: PortalTheme) => void;
  toggleTheme: () => void;
};

const PortalThemeContext = createContext<PortalThemeContextValue | null>(null);

function readStoredTheme(): PortalTheme | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return null;
}

function getDefaultForPath(pathname: string): PortalTheme {
  if (pathname.startsWith('/admin')) return 'dark';
  if (pathname.startsWith('/doctor')) return 'light';
  return 'light';
}

export function PortalThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [theme, setThemeState] = useState<PortalTheme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = readStoredTheme();
    if (stored) {
      setThemeState(stored);
    } else {
      setThemeState(getDefaultForPath(pathname));
    }
    setMounted(true);
  }, [pathname]);

  const setTheme = useCallback((next: PortalTheme) => {
    setThemeState(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, next);
      }
      return next;
    });
  }, []);

  const value: PortalThemeContextValue = {
    theme: mounted ? theme : 'light',
    setTheme,
    toggleTheme,
  };

  return (
    <PortalThemeContext.Provider value={value}>
      {children}
    </PortalThemeContext.Provider>
  );
}

export function usePortalTheme(): PortalThemeContextValue {
  const ctx = useContext(PortalThemeContext);
  if (!ctx) {
    throw new Error('usePortalTheme must be used within PortalThemeProvider');
  }
  return ctx;
}

export function usePortalThemeOptional(): PortalThemeContextValue | null {
  return useContext(PortalThemeContext);
}
