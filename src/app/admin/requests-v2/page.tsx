'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Redirect legacy URL to new Membership Approvals page. */
export default function AdminRequestsV2Redirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/approvals');
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--aip-teal)' }} />
    </div>
  );
}
