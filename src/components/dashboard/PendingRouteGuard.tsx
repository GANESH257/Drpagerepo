'use client';

import { useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Doctor } from '@/types';

interface PendingRouteGuardProps {
  doctor: Doctor;
  children: ReactNode;
}

const ALLOWED_PA = [
  '/doctor/dashboard',
  '/doctor/dashboard/profile',
  '/doctor/dashboard/practice',
  '/doctor/dashboard/practice/locations',
  '/doctor/dashboard/settings',
];

const ALLOWED_DOCTOR_ONLY = [
  '/doctor/dashboard',
  '/doctor/dashboard/profile',
  '/doctor/dashboard/settings',
];

function isPending(doctor: Doctor): boolean {
  return doctor.profileStatus === 'pending_profile' || doctor.verified !== true;
}

export function PendingRouteGuard({ doctor, children }: PendingRouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isPending(doctor)) return;

    const allowed =
      doctor.roleInPractice === 'practice_admin' ? ALLOWED_PA : ALLOWED_DOCTOR_ONLY;
    const path = pathname ?? '';
    const isAllowed = allowed.some((p) => path === p || (p !== '/doctor/dashboard' && path.startsWith(p + '/')));
    if (!isAllowed) {
      router.replace('/doctor/dashboard');
    }
  }, [doctor, pathname, router]);

  if (!isPending(doctor)) {
    return <>{children}</>;
  }

  const allowed =
    doctor.roleInPractice === 'practice_admin' ? ALLOWED_PA : ALLOWED_DOCTOR_ONLY;
  const path = pathname ?? '';
  const isAllowed = allowed.some((p) => path === p || (p !== '/doctor/dashboard' && path.startsWith(p + '/')));
  if (!isAllowed) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--aip-teal)] border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
