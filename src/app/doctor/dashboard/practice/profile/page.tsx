'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Edit Practice Profile: redirect to Practice hub where the Request Edit flow lives. */
export default function EditPracticeProfilePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/doctor/dashboard/practice');
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <p className="text-gray-600">Redirecting to Practice…</p>
    </div>
  );
}
