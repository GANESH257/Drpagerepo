'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getActorFromSession, assertPracticeAdmin } from '@/lib/services/permissionService';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { createAnnouncement } from '@/lib/api/announcements';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PracticeAdminCreateAnnouncementPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
  });

  useEffect(() => {
    try {
      const actor = getActorFromSession();
      assertPracticeAdmin(actor);
      if (actor.kind === 'doctor' && actor.practiceId) {
        setPracticeId(actor.practiceId);
      }
    } catch (error) {
      if (error instanceof AuthRequiredError) {
        router.push('/join-us');
      } else if (error instanceof PermissionDeniedError) {
        router.push('/doctor/dashboard');
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!practiceId) {
      toast.error('Practice not found. Please try again.');
      return;
    }

    try {
      setIsSubmitting(true);
      // Send via REST API so doctors see it in their Announcements page
      await createAnnouncement({
        title: formData.title,
        body: formData.message,
        audience_type: 'practice_doctors',
        audience_practice_id: practiceId,
      });
      toast.success('Announcement sent to all doctors in your practice');
      router.push('/doctor/dashboard/practice');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/doctor/dashboard/practice">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <SectionHeader
          title="Create Practice Announcement"
          description="Send an announcement to all doctors in your practice"
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Announcement title..."
                required
              />
            </div>
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Announcement message..."
                rows={8}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send to Practice Doctors'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/doctor/dashboard/practice')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
