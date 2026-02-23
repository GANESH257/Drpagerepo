'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminConfigPlansPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/memberships');
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0F5FA8]" />
    </div>
  );
}
