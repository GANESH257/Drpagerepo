'use client';

import { useRouter } from 'next/navigation';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EditPracticeProfilePage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Edit Practice Profile"
        description="Update the shared details of your practice"
      />
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-700 mb-4">
            To edit your practice name, description, contact info, and address, use the Practice Management hub and click &quot;Edit practice details&quot; to submit changes for approval.
          </p>
          <Link href="/doctor/dashboard/practice">
            <Button>Go to Practice Management</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
