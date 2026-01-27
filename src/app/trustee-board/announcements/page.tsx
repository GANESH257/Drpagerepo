import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AnnouncementsSection } from '@/components/trustee-board/AnnouncementsSection';
import { GenericCTASection } from '@/components/GenericCTASection';

export default function AnnouncementsIndexPage() {
  return (
    <div className="min-h-screen skin-slate">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/trustee-board">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Trustee Board
            </Link>
          </Button>
        </div>
        <AnnouncementsSection />
        <GenericCTASection />
      </div>
    </div>
  );
}
