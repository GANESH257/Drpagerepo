'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/adminSession';
import { AdminShell } from '@/components/admin/AdminShell';
import { ProfileViewProvider } from '@/contexts/ProfileViewContext';
import { getActorFromSession, assertAdmin } from '@/lib/services/permissionService';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { usePortalTheme } from '@/contexts/PortalThemeContext';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const didRedirect = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      setIsLoading(true);
      return;
    }

    // Normalize pathname (remove trailing slash for comparison)
    const normalizedPath = pathname.replace(/\/$/, '') || '/';

    // Skip auth check for login page
    if (normalizedPath === '/admin/login') {
      setIsLoading(false);
      didRedirect.current = false; // Reset redirect flag on login page
      return;
    }

    // Check authentication (only in browser)
    if (typeof window === 'undefined') {
      setIsLoading(true);
      return;
    }

    const authenticated = isAdminAuthenticated();
    
    if (!authenticated) {
      // Don't redirect if already on login page (normalized)
      if (normalizedPath === '/admin/login') {
        setIsLoading(false);
        return;
      }
      // Prevent multiple redirects
      if (!didRedirect.current) {
        didRedirect.current = true;
        setIsLoading(false); // Clear loading before redirect
        router.replace('/admin/login');
      }
      return;
    }

    // Additional permission check using Step 4 services
    try {
      const actor = getActorFromSession();
      assertAdmin(actor);
    } catch (error) {
      if (error instanceof AuthRequiredError || error instanceof PermissionDeniedError) {
        if (!didRedirect.current) {
          didRedirect.current = true;
          setIsLoading(false);
          router.replace('/admin/login');
        }
        return;
      }
    }

    // Authenticated - clear loading immediately
    setIsLoading(false);
    didRedirect.current = false; // Reset redirect flag when authenticated
  }, [router, pathname, isMounted]);

  // Normalize pathname for comparison
  const normalizedPath = pathname.replace(/\/$/, '') || '/';
  const isLoginPage = normalizedPath === '/admin/login';
  const { theme } = usePortalTheme();
  const darkClass = theme === 'dark' ? 'dark' : '';

  // Show loading state during initial mount or auth check
  if (!isMounted || isLoading) {
    // Don't show loading on login page
    if (isLoginPage) {
      return <>{children}</>;
    }

    return (
      <div className={cn(darkClass, 'min-h-screen bg-background text-foreground flex items-center justify-center')}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--aip-teal)' }} />
          <p className="text-muted-foreground">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  // Don't wrap login page with shell
  if (isLoginPage) {
    return <div className={cn(darkClass, 'min-h-screen bg-background text-foreground')}>{children}</div>;
  }

  return (
    <div className={cn(darkClass, 'min-h-screen bg-background text-foreground')}>
      <ProfileViewProvider>
        <AdminShell>{children}</AdminShell>
      </ProfileViewProvider>
    </div>
  );
}

