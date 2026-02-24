'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect old /admin/requests route to new V2 route
 * The V2 route has all the enhanced features from Steps 10.5, 10.6, 10.7
 */
export default function AdminRequestsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to V2 page
    router.replace('/admin/requests-v2');
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
