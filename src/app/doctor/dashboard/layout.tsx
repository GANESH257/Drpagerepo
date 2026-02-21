'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDoctorSession } from '@/lib/useDoctorSession';
import { getDoctor } from '@/lib/api/doctors';
import { getActorFromSession, assertDoctor } from '@/lib/services/permissionService';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Doctor } from '@/types';

export default function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { getToken, getUser, isAuthenticated, updateSessionDoctorId } = useDoctorSession();
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F5FA8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-2xl font-bold text-[#0F5FA8] mb-4">
            Dashboard Access
          </h2>
          <p className="text-gray-600 mb-2">{error}</p>
          <p className="text-sm text-gray-600 mb-6">
            Submit a join request to get started. Once approved, you'll have full access to your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push('/join-us/application')}
              className="bg-[#0F5FA8] hover:bg-[#1a6bb8] text-white"
            >
              Submit Join Request
            </Button>
            <Button
              onClick={() => router.push('/join-us')}
              variant="outline"
              className="border-[#0F5FA8] text-[#0F5FA8] hover:bg-[#0F5FA8] hover:text-white"
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

  const handleProfileUpdate = (updatedDoctor: Doctor) => {
    // Profile updates are handled by individual sections via localStorage
    // This is just for layout-level updates if needed
  };

  return (
    <DashboardLayout doctor={doctor} onProfileUpdate={handleProfileUpdate}>
      {children}
    </DashboardLayout>
  );
}
