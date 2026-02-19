'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getActorFromSession, assertPracticeAdmin } from '@/lib/services/permissionService';
import { createAnnouncement, CreateAnnouncementInput } from '@/lib/services/announcementService';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
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
  const [formData, setFormData] = useState({
    title: '',
    message: '',
  });

  useEffect(() => {
    try {
      const actor = getActorFromSession();
      assertPracticeAdmin(actor);
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
    
    try {
      setIsSubmitting(true);
      const actor = getActorFromSession();
      
      if (actor.kind !== 'doctor' || !actor.practiceId) {
        throw new PermissionDeniedError('Must be practice admin');
      }
      
      if (actor.kind !== 'doctor' || !actor.practiceId) {
        throw new PermissionDeniedError('Must be practice admin');
      }
      
      const input: CreateAnnouncementInput = {
        audience: { kind: 'practice_doctors', practiceId: actor.practiceId },
        title: formData.title,
        message: formData.message,
      };
      createAnnouncement(actor, input);
      
      toast.success('Announcement created and sent to practice doctors');
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
