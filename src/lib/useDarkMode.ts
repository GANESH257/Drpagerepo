'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const DARK_MODE_KEY = 'aip_dark_mode';

export function useDarkMode() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if we're on dark mode page
    const isOnDarkPage = pathname === '/homedark';
    
    // Check localStorage preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(DARK_MODE_KEY);
      // If on dark page, always set to dark mode
      // Otherwise, use stored preference or default to false
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
    }
  }, [pathname]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(DARK_MODE_KEY, newDarkMode.toString());
    }
    
    // Navigate to appropriate page
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
