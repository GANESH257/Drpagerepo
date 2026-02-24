'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DoctorProfile } from '@/components/DoctorProfile';
import { getDoctorBySlug, getDoctor } from '@/lib/api/doctors';
import { Doctor } from '@/types';
import { Loader2 } from 'lucide-react';

/**
 * Static doctor profile page. Uses ?slug= or ?id= to work with output: 'export'.
 * Use this instead of /doctors/[slug] so all profiles load without generateStaticParams.
 */
function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get('slug');
  const id = searchParams.get('id');
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug && !id) {
      router.replace('/doctors');
      return;
    }

    let cancelled = false;
    setError(null);

    const load = async () => {
      try {
        if (slug) {
          const d = await getDoctorBySlug(slug);
          if (!cancelled) setDoctor(d);
        } else if (id) {
          const d = await getDoctor(id);
          if (!cancelled) setDoctor(d);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Doctor not found');
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, id, router]);

  if (!slug && !id) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-dark-blue)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-gray-600">{error}</p>
        <button
          type="button"
          onClick={() => router.push('/doctors')}
          className="text-[var(--brand-dark-blue)] font-medium hover:underline"
        >
          Back to directory
        </button>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--brand-dark-blue)]" />
        <p className="text-sm text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return <DoctorProfile doctor={doctor} />;
}

export default function DoctorProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--brand-dark-blue)]" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
