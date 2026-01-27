'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center skin-slate">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-brand-dark-blue">Something went wrong!</h1>
        <p className="text-muted-foreground mb-8">{error.message || 'An error occurred'}</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="gradient">
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
