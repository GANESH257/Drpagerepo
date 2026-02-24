'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Redirect legacy /admin/requests directly to the canonical approvals page. */
export default function AdminRequestsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/approvals');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--aip-teal)' }} />
        <p className="text-muted-foreground">Redirecting to Approval Requests...</p>
      </div>
    </div>
  );
}
