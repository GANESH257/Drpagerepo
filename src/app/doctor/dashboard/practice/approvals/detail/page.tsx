'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PracticeAdminApprovalDetailClient } from '../PracticeAdminApprovalDetailClient';

/**
 * Detail page for practice admin approval requests.
 * Uses query param ?id=xxx to work with static export (no dynamic [id] segment).
 */
function DetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestId = searchParams.get('id');

  useEffect(() => {
    if (!requestId) {
      router.replace('/doctor/dashboard/practice/approvals');
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
    <PracticeAdminApprovalDetailClient
      requestId={requestId}
    />
  );
}

export default function PracticeApprovalDetailPage() {
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
      <DetailContent />
    </Suspense>
  );
}
