'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Doctor } from '@/types';

interface CompleteProfileGateProps {
  doctor: Doctor;
  children: React.ReactNode;
}

/**
 * When doctor has profile_status pending_profile or verified=false (newly approved),
 * ONLY the 2-screen flow is allowed: Add profile data + Add practice data.
 * Never show the full dashboard until they complete and admin approves.
 */
export function CompleteProfileGate({ doctor, children }: CompleteProfileGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isOnCompleteProfile = pathname?.includes('complete-profile');

  useEffect(() => {
    if (!isOnCompleteProfile) {
      router.replace('/doctor/dashboard/complete-profile');
    }
  }, [isOnCompleteProfile, router]);

  // Never render dashboard content when we need to redirect - only show complete-profile page
  if (!isOnCompleteProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#0F5FA8] border-t-transparent mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
