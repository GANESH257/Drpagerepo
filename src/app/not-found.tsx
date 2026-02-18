'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useDarkMode } from '@/lib/useDarkMode';

export default function NotFound() {
  const { getHomeLink } = useDarkMode();
  const [homeLink, setHomeLink] = useState<string>('/');

  useEffect(() => {
    setHomeLink(getHomeLink());
  }, [getHomeLink]);

  return (
    <div className="min-h-screen flex items-center justify-center skin-slate">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-brand-dark-blue">404</h1>
        <p className="text-muted-foreground mb-8">Page not found</p>
        <Button asChild variant="gradient">
          <Link href={homeLink}>Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
