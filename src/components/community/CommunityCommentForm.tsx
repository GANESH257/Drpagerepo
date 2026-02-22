'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createCommunityComment } from '@/lib/api/community';
import { toast } from '@/lib/toast';

interface CommunityCommentFormProps {
  postId: string;
  onSuccess: () => void;
}

export function CommunityCommentForm({ postId, onSuccess }: CommunityCommentFormProps) {
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) {
      toast.error('Please enter your answer');
      return;
    }
    setSubmitting(true);
    try {
      await createCommunityComment(postId, body.trim());
      toast.success('Answer posted');
      setBody('');
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to post answer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Label htmlFor="community-comment-body">Your answer</Label>
      <Textarea
        id="community-comment-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your answer..."
        className="min-h-[80px]"
        maxLength={5000}
      />
      <Button type="submit" size="sm" disabled={submitting}>
        {submitting ? 'Posting...' : 'Post answer'}
      </Button>
    </form>
  );
}
