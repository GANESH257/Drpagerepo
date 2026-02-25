'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Redirect old "View Practice Locations" link to single My Practice page. */
export default function MyPracticeLocationsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/doctor/dashboard/my-practice');
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <p className="text-sm text-muted-foreground">Redirecting to My Practice…</p>
    </div>
  );
}
