'use client';

import { useDoctorContext } from '@/components/dashboard/DoctorContext';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { getDoctorProfileUrl } from '@/lib/doctorProfileUrl';

export default function ViewPublicProfilePage() {
  const { doctor } = useDoctorContext();
  const publicUrl = getDoctorProfileUrl({ slug: (doctor as any)?.slug ?? doctor?.slug, id: doctor?.id ?? '' });

  return (
    <div className="space-y-6 relative z-10">
      <SectionHeader
        title="View Public Profile"
        description="Preview how your profile appears to the public"
      />
      <div className="glass-card p-6 text-center">
        <p className="text-gray-700 mb-4">
          Your public profile is visible at the link below. Open it in a new tab to see exactly what patients and other physicians see.
        </p>
        <Link href={publicUrl} target="_blank" rel="noopener noreferrer">
          <Button className="rounded-lg text-white" style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open public profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
