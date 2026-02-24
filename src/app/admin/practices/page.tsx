'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPracticesPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/members/practices');
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--aip-teal)' }} />
    </div>
  );
}
