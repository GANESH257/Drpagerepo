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
      <p className="text-sm text-gray-500 py-4">No answers yet. Be the first to answer.</p>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <Card key={c.id} className="border-gray-200">
          <CardContent className="p-3">
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{c.body}</p>
            <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
              Answered by <span className="font-medium text-gray-700">{c.author_display_name}</span>
              {c.author_type === 'admin' && (
                <span className="ml-1 text-brand-dark-blue">(Admin)</span>
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
