'use client';

import { useDoctorContext } from '@/components/dashboard/DoctorContext';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export default function ViewPublicProfilePage() {
  const { doctor } = useDoctorContext();
  const slug = (doctor as any)?.slug ?? doctor?.slug;
  const publicUrl = slug ? `/doctors/${slug}` : `/doctors/${doctor.id}`;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="View Public Profile"
        description="Preview how your profile appears to the public"
      />
      <div className="rounded-xl border bg-gray-50 p-6 text-center">
        <p className="text-gray-700 mb-4">
          Your public profile is visible at the link below. Open it in a new tab to see exactly what patients and other physicians see.
        </p>
        <Link href={publicUrl} target="_blank" rel="noopener noreferrer">
          <Button>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open public profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
