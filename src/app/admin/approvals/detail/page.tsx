'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ApprovalRequestDetailClient } from '../../requests-v2/[id]/ApprovalRequestDetailClient';

/**
 * Detail page for approval requests.
 * Uses query param ?id=xxx to avoid static export issues with dynamic [id] routes.
 */
function ApprovalDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestId = searchParams.get('id');

  useEffect(() => {
    if (!requestId) {
      router.replace('/admin/approvals');
    }
  }, [requestId, router]);

  if (!requestId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ApprovalRequestDetailClient
      requestId={requestId}
      backHref="/admin/approvals"
    />
  );
}

export default function AdminApprovalDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F5FA8] mx-auto mb-4" />
            <p className="text-gray-600">Loading request details...</p>
          </div>
        </div>
      }
    >
      <ApprovalDetailContent />
    </Suspense>
  );
}
