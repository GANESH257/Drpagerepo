'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createDoctorFromOnboarding } from '@/lib/doctorCreation';
import { useDoctorSession } from '@/lib/useDoctorSession';
import { clearOnboardingDraft } from '@/lib/onboardingStorage';
import { OnboardingDraft } from '@/types';

interface OnboardingCompleteProps {
  email: string;
  draft: OnboardingDraft;
}

export function OnboardingComplete({ email, draft }: OnboardingCompleteProps) {
  const router = useRouter();
  const { updateSessionDoctorId } = useDoctorSession();
  const [isCreating, setIsCreating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createProfile = async () => {
      try {
        // Create doctor profile from onboarding data
        const doctor = createDoctorFromOnboarding(email, draft);

        // Update session with doctorId
        updateSessionDoctorId(doctor.id);

        // Clear onboarding draft
        clearOnboardingDraft(email);

        setIsCreating(false);

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/doctor/dashboard');
        }, 2000);
      } catch (err) {
        console.error('Error creating doctor profile:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to create profile. Please try again.'
        );
        setIsCreating(false);
      }
    };

    createProfile();
  }, [email, draft, router, updateSessionDoctorId]);

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-8 text-center">
          <div className="text-destructive mb-4">
            <CheckCircle2 className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-xl font-bold mb-2">Error</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button
            onClick={() => router.push('/join-us/onboarding?step=1')}
            variant="outline"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isCreating) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal mx-auto mb-4"></div>
          <h3 className="text-xl font-bold mb-2">Creating Your Profile</h3>
          <p className="text-muted-foreground">
            Please wait while we set up your account...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardContent className="p-8 text-center">
        <div className="text-green-600 mb-4">
          <CheckCircle2 className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-2xl font-bold text-brand-dark-blue mb-2">
          Welcome to the Network!
        </h3>
        <p className="text-muted-foreground mb-6">
          Your profile has been created successfully. You're now part of the
          Alliance of Independent Physicians network.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Redirecting to your dashboard...
        </p>
        <Button
          onClick={() => router.push('/doctor/dashboard')}
          className="bg-brand-teal hover:bg-brand-teal/90"
        >
          Go to Dashboard
        </Button>
      </CardContent>
    </Card>
  );
}