'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const DARK_MODE_KEY = 'aip_dark_mode';

export function useDarkMode() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Initialize from localStorage if available, otherwise default to false
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(DARK_MODE_KEY);
      return stored === 'true';
    }
    return false;
  });

  // Update state from pathname and localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isOnDarkPage = pathname === '/homedark';
    const stored = localStorage.getItem(DARK_MODE_KEY);
    
    // Priority: pathname > localStorage > default (false)
    if (isOnDarkPage) {
      setIsDarkMode(true);
      localStorage.setItem(DARK_MODE_KEY, 'true');
    } else if (pathname === '/') {
      setIsDarkMode(false);
      localStorage.setItem(DARK_MODE_KEY, 'false');
    } else if (stored === 'true') {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, [pathname]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    
    // Update state immediately for responsive UI
    setIsDarkMode(newDarkMode);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(DARK_MODE_KEY, newDarkMode.toString());
    }
    
    // Navigate to appropriate home page
    // This ensures the user sees the correct theme immediately
    if (newDarkMode) {
      router.push('/homedark');
    } else {
      router.push('/');
    }
  };

  const [homeLink, setHomeLink] = useState<string>('/');

  useEffect(() => {
    // Use current pathname to determine home link if on home pages
    if (pathname === '/homedark') {
      setHomeLink('/homedark');
      return;
    }
    if (pathname === '/') {
      setHomeLink('/');
      return;
    }
    // Otherwise use stored preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(DARK_MODE_KEY);
      setHomeLink(stored === 'true' ? '/homedark' : '/');
    }
  }, [pathname]);

  const getHomeLink = () => {
    return homeLink;
  };

  return {
    isDarkMode,
    toggleDarkMode,
    getHomeLink,
  };
}
