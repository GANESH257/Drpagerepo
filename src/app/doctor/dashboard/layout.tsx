'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDoctorSession } from '@/lib/useDoctorSession';
import type { UserInfo } from '@/lib/useDoctorSession';
import { getDoctor } from '@/lib/api/doctors';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PendingRouteGuard } from '@/components/dashboard/PendingRouteGuard';
import { ProfileViewProvider } from '@/contexts/ProfileViewContext';
import { Button } from '@/components/ui/button';
import { Doctor } from '@/types';
import { usePortalTheme } from '@/contexts/PortalThemeContext';
import { cn } from '@/lib/utils';

/** Build a minimal Doctor from session so we can show the dashboard without waiting for GET /api/doctors/:id */
function minimalDoctorFromSession(doctorId: string, user: UserInfo): Doctor {
  const fullName = user.email ? user.email.split('@')[0] : 'Doctor';
  const isPending = user.profileStatus === 'pending_profile';
  return {
    id: doctorId,
    slug: '',
    firstName: '',
    lastName: '',
    fullName,
    specialty: '',
    credentials: '',
    bio: '',
    locations: [],
    insurance: [],
    rating: 0,
    reviewCount: 0,
    reviews: [],
    featured: false,
    verified: !isPending,
    availability: [],
    acceptsNewPatients: false,
    practiceId: user.practiceId ?? undefined,
    roleInPractice: user.roleInPractice ?? 'doctor',
    profileStatus: isPending ? 'pending_profile' : 'active',
  };
}

export default function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { getToken, getUser, isAuthenticated, updateSessionDoctorId, updateSessionWithDoctorInfo } = useDoctorSession();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backgroundLoadError, setBackgroundLoadError] = useState<string | null>(null);

  const loadFullDoctorInBackground = useCallback((doctorId: string, token: string, user: UserInfo) => {
    const timeoutMs = 20000;
    const loadWithTimeout = Promise.race([
      getDoctor(doctorId, token),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), timeoutMs)
      ),
    ]);
    loadWithTimeout
      .then((loadedDoctor) => {
        if (!loadedDoctor) return;
        updateSessionWithDoctorInfo(loadedDoctor);
        setDoctor(loadedDoctor);
        setBackgroundLoadError(null);
        if (loadedDoctor.profileStatus === 'pending_profile') {
          router.replace('/doctor/onboard');
        }
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Failed to load profile';
        if (msg.includes('Unauthorized') || msg.includes('token')) {
          router.push('/join-us');
          return;
        }
        setBackgroundLoadError('Profile details are still loading. You can continue; we’ll retry in the background.');
      });
  }, [router, updateSessionWithDoctorInfo]);

  useEffect(() => {
    const checkAuthAndLoadDoctor = async () => {
      if (!isAuthenticated()) {
        router.push('/join-us');
        return;
      }

      const token = getToken();
      const user = getUser();

      if (!token || !user) {
        router.push('/join-us');
        return;
      }

      if (user.role !== 'doctor') {
        setError('Dashboard access is available after your membership is approved.');
        setIsLoading(false);
        return;
      }

      const doctorId = user.doctorId;
      if (!doctorId) {
        setError('Doctor profile not found. If you were just approved, log out and sign in again to refresh your access.');
        setIsLoading(false);
        return;
      }

      // Show dashboard immediately from session so we never block on a slow API.
      const minimal = minimalDoctorFromSession(doctorId, user);
      if (!user.doctorId) updateSessionDoctorId(doctorId);
      setDoctor(minimal);
      setIsLoading(false);

      // Only send to onboard when we explicitly know they're pending (join-approved, not yet approved for portal).
      if (minimal.profileStatus === 'pending_profile') {
        router.replace('/doctor/onboard');
        return;
      }

      // Load full doctor in background; layout and dashboard work with minimal data until then.
      loadFullDoctorInBackground(doctorId, token, user);
    };

    checkAuthAndLoadDoctor();
    // Run once on mount; session and auth are read at that time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { theme } = usePortalTheme();
  const darkClass = theme === 'dark' ? 'dark' : '';

  if (isLoading) {
    return (
      <div className={cn(darkClass, 'min-h-screen bg-background flex items-center justify-center')}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--aip-teal)] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(darkClass, 'min-h-screen bg-background flex items-center justify-center')}>
        <div className="text-center max-w-md px-4">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--aip-teal)' }}>
            Dashboard Access
          </h2>
          <p className="text-muted-foreground mb-2">{error}</p>
          <p className="text-sm text-muted-foreground mb-6">
            {error.includes('just approved')
              ? 'Log out and sign in again so your session includes your doctor profile. If the problem continues, contact support.'
              : 'Submit a join request to get started. Once approved, you\'ll have full access to your dashboard.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push('/join-us')}
              variant="outline"
              className="rounded-lg"
              style={{ borderColor: 'var(--aip-teal)', color: 'var(--aip-teal)' }}
            >
              Return to Login
            </Button>
            {!error.includes('just approved') && (
              <Button
                onClick={() => router.push('/join-us/application')}
                className="text-white rounded-lg"
                style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))', color: 'white' }}
              >
                Submit Join Request
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return null;
  }

  const handleProfileUpdate = (_updatedDoctor: Doctor) => {};

  const handleRetryBackgroundLoad = () => {
    setBackgroundLoadError(null);
    const token = getToken();
    const user = getUser();
    if (doctor && token && user?.doctorId) {
      loadFullDoctorInBackground(user.doctorId, token, user);
    }
  };

  // All authenticated doctors (including pending) use the same dashboard with restricted nav and route guard.
  return (
    <ProfileViewProvider>
      <div className={cn(darkClass, 'min-h-screen flex flex-col')}>
        {backgroundLoadError && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-amber-800 dark:text-amber-200">{backgroundLoadError}</p>
            <Button size="sm" variant="outline" onClick={handleRetryBackgroundLoad} className="shrink-0">
              Retry
            </Button>
          </div>
        )}
        <DashboardLayout doctor={doctor} onProfileUpdate={handleProfileUpdate}>
          <PendingRouteGuard doctor={doctor}>
            {children}
          </PendingRouteGuard>
        </DashboardLayout>
      </div>
    </ProfileViewProvider>
  );
}
