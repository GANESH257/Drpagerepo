'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatDateTime } from '@/lib/dateUtils';
import { CommunityComment } from '@/lib/api/community';

interface CommunityCommentListProps {
  comments: CommunityComment[];
}

export function CommunityCommentList({ comments }: CommunityCommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No answers yet. Be the first to answer.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <Card key={c.id} className="border-border glass-card">
          <CardContent className="p-3">
            <p className="text-sm text-foreground whitespace-pre-wrap">{c.body}</p>
            <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
              Answered by{' '}
              <span className="font-medium text-foreground">{c.author_display_name}</span>
              {c.author_type === 'admin' && (
                <span className="ml-1 text-[var(--aip-teal)]">(Admin)</span>
              )}
              {' · '}
              {formatDateTime(c.created_at)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
