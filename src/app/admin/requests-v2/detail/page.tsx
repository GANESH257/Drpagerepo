'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ApprovalRequestDetailClient } from '../[id]/ApprovalRequestDetailClient';

function RequestDetailContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    if (!id) {
        return (
            <div className="p-8 text-center glass-card rounded-lg">
                <p className="text-foreground font-medium text-lg mb-2">Missing Request ID</p>
                <p className="text-muted-foreground text-sm">Please provide a valid approval request ID in the URL.</p>
            </div>
        );
    }

    return <ApprovalRequestDetailClient requestId={id} />;
}

export default function AdminRequestDetailQueryPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--aip-teal)' }} />
                    <p className="text-muted-foreground">Loading request details...</p>
                </div>
            </div>
        }>
            <RequestDetailContent />
        </Suspense>
    );
}
