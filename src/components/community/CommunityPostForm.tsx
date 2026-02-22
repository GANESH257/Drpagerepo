'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createCommunityPost } from '@/lib/api/community';
import { toast } from '@/lib/toast';

interface CommunityPostFormProps {
  section: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function CommunityPostForm({
  section,
  onSuccess,
  onCancel,
}: CommunityPostFormProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Please enter a title and question');
      return;
    }
    setSubmitting(true);
    try {
      await createCommunityPost(section, title.trim(), body.trim());
      toast.success('Question posted');
      setTitle('');
      setBody('');
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="community-post-title">Title</Label>
        <Input
          id="community-post-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your question"
          className="mt-1"
          maxLength={500}
        />
      </div>
      <div>
        <Label htmlFor="community-post-body">Question</Label>
        <Textarea
          id="community-post-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Ask your question to the community..."
          className="mt-1 min-h-[120px]"
          maxLength={5000}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Posting...' : 'Post question'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
