'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatDateTime } from '@/lib/dateUtils';
import { CommunityPost } from '@/lib/api/community';
import { MessageCircle } from 'lucide-react';

interface CommunityPostCardProps {
  post: CommunityPost;
  commentCount?: number;
  onClick: () => void;
}

export function CommunityPostCard({ post, commentCount = 0, onClick }: CommunityPostCardProps) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md border-border glass-card"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2">{post.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.body}</p>
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>
            {post.author_display_name}
            {post.author_type === 'admin' && (
              <span className="ml-1 text-[var(--aip-teal)] font-medium">(Admin)</span>
            )}
          </span>
          <div className="flex items-center gap-2">
            {commentCount > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                {commentCount}
              </span>
            )}
            <span>{formatDateTime(post.created_at)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
