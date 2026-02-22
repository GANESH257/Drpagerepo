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
      className="cursor-pointer transition-shadow hover:shadow-md border-gray-200"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2">{post.title}</h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.body}</p>
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>
            {post.author_display_name}
            {post.author_type === 'admin' && (
              <span className="ml-1 text-brand-dark-blue font-medium">(Admin)</span>
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
