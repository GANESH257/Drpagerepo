'use client';

import dynamic from 'next/dynamic';

// Load CommunityView only on client to avoid Turbopack ChunkLoadError (chunk boundary issues in dev).
const CommunityView = dynamic(
  () => import('@/components/community/CommunityView').then((m) => m.CommunityView),
  { ssr: false, loading: () => <div className="flex min-h-[300px] items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--aip-teal)]" /></div> }
);

export default function DoctorCommunityPage() {
  return <CommunityView canPost />;
}
