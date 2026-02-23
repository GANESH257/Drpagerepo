'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Doctor } from '@/types';

interface CompleteProfileGateProps {
  doctor: Doctor;
  children: React.ReactNode;
}

/**
 * When doctor has profile_status pending_profile (e.g. new Practice Admin after first approval),
 * only the complete-profile flow is allowed. Redirect to it if on another dashboard path.
 */
export function CompleteProfileGate({ doctor, children }: CompleteProfileGateProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname?.includes('complete-profile')) {
      router.replace('/doctor/dashboard/complete-profile');
    }
  }, [pathname, router]);

  return <>{children}</>;
}
