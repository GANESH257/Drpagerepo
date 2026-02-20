'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getPracticeInvitationById } from '@/lib/storage/invitationStorage';
import { getAllPractices } from '@/lib/services/practiceDirectoryService';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function InvitationLandingPage() {
  const params = useParams();
  const router = useRouter();
  const invitationId = params?.invitationId as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [practiceName, setPracticeName] = useState<string>('');

  useEffect(() => {
    if (!invitationId) {
      setError('Invalid invitation link');
      setIsLoading(false);
      return;
    }

    try {
      const invitation = getPracticeInvitationById(invitationId);
      
      if (!invitation) {
        setError('Invitation not found');
        setIsLoading(false);
        return;
      }

      if (invitation.status !== 'sent') {
        setError(`This invitation has been ${invitation.status}`);
        setIsLoading(false);
        return;
      }

      // Get practice name
      const practices = getAllPractices();
      const practice = practices.find(p => p.id === invitation.practiceId);
      setPracticeName(practice?.name || 'the practice');

      setIsValid(true);
      setIsLoading(false);

      // Auto-redirect to application page with invitation parameter
      setTimeout(() => {
        router.push(`/join-us/application?invitation=${invitationId}`);
      }, 2000);
    } catch (err) {
      setError('Error loading invitation');
      setIsLoading(false);
    }
  }, [invitationId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-brand-teal" />
            <p className="text-gray-600">Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              onClick={() => router.push('/join-us')}
              className="w-full mt-4"
            >
              Go to Sign Up
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-600" />
            <h1 className="text-2xl font-bold text-brand-dark-blue">
              Invitation Valid
            </h1>
            <p className="text-gray-600">
              You've been invited to join <strong>{practiceName}</strong>.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to application form...
            </p>
            <Button
              onClick={() => router.push(`/join-us/application?invitation=${invitationId}`)}
              className="w-full bg-brand-teal hover:bg-brand-teal/90"
            >
              Continue to Application
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
