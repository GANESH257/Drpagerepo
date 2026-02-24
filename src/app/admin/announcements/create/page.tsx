'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getActorFromSession, assertAdmin } from '@/lib/services/permissionService';
import { createAnnouncement } from '@/lib/api/announcements';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminCreateAnnouncementPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
  });

  useEffect(() => {
    try {
      const actor = getActorFromSession();
      assertAdmin(actor);
    } catch (error) {
      if (error instanceof AuthRequiredError) {
        router.push('/admin/login');
      } else if (error instanceof PermissionDeniedError) {
        router.push('/admin');
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
      await createAnnouncement({
        title: formData.title,
        body: formData.message,
        audience_type: 'all',
      });
      toast.success('Announcement created and sent to all doctors');
      router.push('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <SectionHeader
          title="Create Announcement"
          description="Send an announcement to all doctors"
        />
      </div>

      <div className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Announcement title..."
              className="rounded-lg border border-input mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Announcement message..."
              rows={8}
              className="rounded-lg border border-input mt-1 focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-white border-0"
              style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }}
            >
              {isSubmitting ? 'Sending...' : 'Send to All Doctors'}
            </Button>
            <Button type="button" variant="outline" className="border-[var(--aip-teal)] text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/10" onClick={() => router.push('/admin')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
