import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center skin-slate">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-brand-dark-blue">404</h1>
        <p className="text-muted-foreground mb-8">Page not found</p>
        <Button asChild variant="gradient">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
