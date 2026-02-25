'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDoctorSession } from '@/lib/useDoctorSession';
import { getDoctor } from '@/lib/api/doctors';
import { getActorFromSession, assertDoctor } from '@/lib/services/permissionService';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { CompleteProfileGate } from '@/components/dashboard/CompleteProfileGate';
import { Button } from '@/components/ui/button';
import { Doctor } from '@/types';
import { usePortalTheme } from '@/contexts/PortalThemeContext';
import { cn } from '@/lib/utils';

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

  useEffect(() => {
    const checkAuthAndLoadDoctor = async () => {
      // Check authentication
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

      // Check if user is a doctor
      if (user.role !== 'doctor') {
        setError('Dashboard access is available after your membership is approved.');
        setIsLoading(false);
        return;
      }

      // Get doctorId from user or session
      const doctorId = user.doctorId;
      if (!doctorId) {
        setError('Doctor profile not found. Please contact support.');
        setIsLoading(false);
        return;
      }

      try {
        // Load doctor profile from API
        const loadedDoctor = await getDoctor(doctorId, token);
        
        // Check if profile exists
        if (!loadedDoctor) {
          setError('Dashboard access is available after approval.');
          setIsLoading(false);
          return;
        }
        
        // Update session with doctorId if not present
        if (!user.doctorId) {
          updateSessionDoctorId(doctorId);
        }
        // Store practiceId and roleInPractice for API-created doctors (getActorFromSession needs these)
        updateSessionWithDoctorInfo(loadedDoctor);
        
        setDoctor(loadedDoctor);
        setIsLoading(false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load doctor profile';
        
        // Handle 401 (unauthorized) - token expired or invalid
        if (errorMessage.includes('Unauthorized') || errorMessage.includes('token')) {
          router.push('/join-us');
          return;
        }
        
        // Handle 404 (not found)
        if (errorMessage.includes('not found')) {
          setError('Dashboard access is available after approval.');
        } else {
          setError('Failed to load dashboard. Please try again.');
        }
        setIsLoading(false);
      }
    };

    checkAuthAndLoadDoctor();
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
            Submit a join request to get started. Once approved, you'll have full access to your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push('/join-us/application')}
              className="text-white rounded-lg"
              style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }}
            >
              Submit Join Request
            </Button>
            <Button
              onClick={() => router.push('/join-us')}
              variant="outline"
              className="rounded-lg"
              style={{ borderColor: 'var(--aip-teal)', color: 'var(--aip-teal)' }}
            >
              Return to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return null;
  }

  const handleProfileUpdate = (_updatedDoctor: Doctor) => {};

  // Newly approved doctors must ONLY see: Add profile data + Add practice data (2 screens).
  // Show gate when: profile_status is pending_profile, OR verified is not true (false/undefined).
  const isPendingProfile =
    doctor.profileStatus === 'pending_profile' || doctor.verified !== true;
  const isPendingProfilePA = isPendingProfile && doctor.roleInPractice === 'practice_admin';
  const isPendingProfileDoctorOnly = isPendingProfile && doctor.roleInPractice !== 'practice_admin';

  if (isPendingProfilePA || isPendingProfileDoctorOnly) {
    return (
      <div className={cn(darkClass, 'min-h-screen')}>
        <CompleteProfileGate doctor={doctor}>
          {children}
        </CompleteProfileGate>
      </div>
    );
  }

  return (
    <div className={cn(darkClass, 'min-h-screen flex flex-col')}>
      <DashboardLayout doctor={doctor} onProfileUpdate={handleProfileUpdate}>
        {children}
      </DashboardLayout>
    </div>
  );
}
