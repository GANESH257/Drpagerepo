'use client';

import { Sun, Moon } from 'lucide-react';
import { useDarkMode } from '@/lib/useDarkMode';
import { useEffect, useRef, useState } from 'react';

export function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: server and first client render use same default (light).
  // After mount we use real isDarkMode from localStorage.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Continuously reset transforms applied by Locomotive Scroll
  useEffect(() => {
    if (!buttonRef.current) return;

    const resetTransforms = () => {
      if (buttonRef.current) {
        const style = window.getComputedStyle(buttonRef.current);
        const transform = style.transform;
        
        // Only reset if Locomotive Scroll has applied a transform
        if (transform && transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)' && !transform.includes('translate3d(0, 0, 0)')) {
          buttonRef.current.style.transform = 'translate3d(0, 0, 0)';
        }
      }
    };

    const observer = new MutationObserver(() => {
      requestAnimationFrame(resetTransforms);
    });

    observer.observe(buttonRef.current, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      subtree: true
    });

    // Also reset on animation frame
    const interval = setInterval(() => {
      requestAnimationFrame(resetTransforms);
    }, 100);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleDarkMode();
  };

  // Use consistent value for SSR and initial client render to avoid hydration mismatch
  const displayDark = mounted ? isDarkMode : false;

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      type="button"
      className="relative flex items-center gap-1.5 px-1.5 py-1 bg-gray-800 rounded-full transition-all duration-500 ease-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-1 focus:ring-offset-brand-dark-blue active:scale-95 cursor-pointer z-50 dark-mode-toggle-button"
      aria-label={displayDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        transition: 'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease-out',
        pointerEvents: 'auto',
        transform: 'translate3d(0, 0, 0)',
        willChange: 'auto',
        width: 'auto',
        height: 'auto',
        minWidth: 'auto',
        minHeight: 'auto',
        maxWidth: 'none',
        maxHeight: 'none',
        padding: '0.25rem 0.375rem',
        borderRadius: '9999px',
        backgroundColor: 'rgb(31, 41, 55)',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem'
      } as React.CSSProperties}
      data-scroll-exclude
      data-scroll-speed="0"
    >
      <div
        className={`absolute top-0.5 bottom-0.5 w-4 bg-white rounded-full transition-all duration-500 ease-out ${
          displayDark ? 'left-0.5' : 'left-[calc(100%-1.125rem)]'
        }`}
        style={{
          transition: 'left 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: 'translate3d(0, 0, 0)'
        } as React.CSSProperties}
        data-scroll-speed="0"
      />
      <Sun
        className={`relative z-10 h-3 w-3 md:h-3.5 md:w-3.5 transition-all duration-300 ${
          displayDark
            ? 'text-gray-400 scale-75 opacity-50'
            : 'text-yellow-400 scale-100 opacity-100'
        }`}
        style={{
          transition: 'color 0.3s ease, transform 0.3s ease, opacity 0.3s ease',
          transform: 'translate3d(0, 0, 0)',
          width: '0.75rem',
          height: '0.75rem',
          minWidth: '0.75rem',
          minHeight: '0.75rem',
          maxWidth: '0.75rem',
          maxHeight: '0.75rem',
          flexShrink: 0
        } as React.CSSProperties}
        data-scroll-speed="0"
      />
      <Moon
        className={`relative z-10 h-3 w-3 md:h-3.5 md:w-3.5 transition-all duration-300 ${
          displayDark
            ? 'text-blue-300 scale-100 opacity-100'
            : 'text-gray-400 scale-75 opacity-50'
        }`}
        style={{
          transition: 'color 0.3s ease, transform 0.3s ease, opacity 0.3s ease',
          transform: 'translate3d(0, 0, 0)',
          width: '0.75rem',
          height: '0.75rem',
          minWidth: '0.75rem',
          minHeight: '0.75rem',
          maxWidth: '0.75rem',
          maxHeight: '0.75rem',
          flexShrink: 0
        } as React.CSSProperties}
        data-scroll-speed="0"
      />
    </button>
  );
}
