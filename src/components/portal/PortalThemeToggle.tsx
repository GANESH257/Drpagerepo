'use client';

import { Moon, Sun } from 'lucide-react';
import { usePortalTheme } from '@/contexts/PortalThemeContext';

export function PortalThemeToggle() {
  const { theme, toggleTheme } = usePortalTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative flex items-center gap-1.5 px-1.5 py-1 rounded-full border border-border bg-muted/50 hover:bg-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--aip-teal)] focus:ring-offset-2 focus:ring-offset-background active:scale-95"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div
        className="relative z-10"
        style={{
          opacity: isDark ? 0.5 : 1,
          transition: 'opacity 0.25s ease',
        }}
      >
        <Sun className="h-3.5 w-3.5 md:h-4 md:w-4 text-foreground stroke-2" />
      </div>
      <div
        className="relative z-10"
        style={{
          opacity: isDark ? 1 : 0.5,
          transition: 'opacity 0.25s ease',
        }}
      >
        <Moon className="h-3.5 w-3.5 md:h-4 md:w-4 text-foreground stroke-2" />
      </div>
      <div
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background rounded-full shadow-sm border border-border"
        style={{
          transform: isDark ? 'translateX(calc(100% + 2px))' : 'translateX(2px)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        aria-hidden="true"
      />
    </button>
  );
}
