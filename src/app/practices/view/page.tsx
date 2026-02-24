'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { PracticeProfileClient } from '@/components/public/practices/PracticeProfileClient';
import { getPracticeById } from '@/lib/services/practiceDirectoryService';

/**
 * Static practice profile page (no dynamic [slug] route).
 * Reads ?slug= or ?id= from URL so it works with output: 'export'.
 * All "view practice" links should point here: /practices/view?slug=xxx or ?id=xxx
 */
function PracticeViewContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const id = searchParams.get('id');

  if (slug) {
    return <PracticeProfileClient slug={slug} />;
  }

  if (id) {
    return <PracticeProfileClient practiceId={id} />;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <h1 className="text-xl font-semibold text-brand-dark-blue mb-2">Practice not specified</h1>
        <p className="text-gray-600 mb-4">
          Use a link from Find Practices or add <code className="text-sm bg-gray-100 px-1 rounded">?slug=...</code> or <code className="text-sm bg-gray-100 px-1 rounded">?id=...</code> to the URL.
        </p>
        <a href="/practices" className="text-brand-teal hover:underline font-medium">
          ← Back to Find Practices
        </a>
      </div>
    </div>
  );
}

export default function PracticeViewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal" />
        </div>
      }
    >
      <PracticeViewContent />
    </Suspense>
  );
}
