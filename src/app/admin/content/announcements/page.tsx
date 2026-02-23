'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Redirect to existing admin announcements page for now. */
export default function AdminContentAnnouncementsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/announcements');
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0F5FA8]" />
    </div>
  );
}
