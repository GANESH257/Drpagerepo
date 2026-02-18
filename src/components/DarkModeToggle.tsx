'use client';

import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '@/lib/useDarkMode';

export function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="relative flex items-center gap-1.5 px-1.5 py-1 bg-gray-800 rounded-full transition-all duration-500 ease-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-1 focus:ring-offset-brand-dark-blue active:scale-95"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        transition: 'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease-out',
      }}
    >
      {/* Sun Icon */}
      <div 
        className="relative z-10"
        style={{
          opacity: isDarkMode ? 0.4 : 1,
          transform: isDarkMode ? 'scale(0.9)' : 'scale(1)',
          transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Sun className="h-3.5 w-3.5 md:h-4 md:w-4 text-white stroke-2" />
      </div>
      
      {/* Moon Icon */}
      <div 
        className="relative z-10"
        style={{
          opacity: isDarkMode ? 1 : 0.4,
          transform: isDarkMode ? 'scale(1)' : 'scale(0.9)',
          transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Moon className="h-3.5 w-3.5 md:h-4 md:w-4 text-white stroke-2" />
      </div>
      
      {/* Sliding Indicator */}
      <div
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-md"
        style={{
          transform: isDarkMode ? 'translateX(calc(100% + 2px))' : 'translateX(0px)',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
        aria-hidden="true"
      />
    </button>
  );
}
