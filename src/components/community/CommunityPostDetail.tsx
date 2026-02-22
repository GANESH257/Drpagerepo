'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatDateTime } from '@/lib/dateUtils';
import { CommunityPostWithComments } from '@/lib/api/community';
import { CommunityCommentList } from './CommunityCommentList';
import { CommunityCommentForm } from './CommunityCommentForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommunityPostDetailProps {
  post: CommunityPostWithComments;
  onBack: () => void;
  onCommentAdded: () => void;
  canComment: boolean;
}

export function CommunityPostDetail({
  post,
  onBack,
  onCommentAdded,
  canComment,
}: CommunityPostDetailProps) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Back to list
      </Button>
      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-xl font-semibold text-gray-900">{post.title}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-700">
              {post.author_display_name}
              {post.author_type === 'admin' && (
                <span className="ml-1 text-brand-dark-blue">(Admin)</span>
              )}
            </span>
            <span>{formatDateTime(post.created_at)}</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-gray-700 whitespace-pre-wrap">{post.body}</p>
        </CardContent>
      </Card>
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Answers ({post.comments?.length ?? 0})
        </h3>
        <CommunityCommentList comments={post.comments ?? []} />
        {canComment && (
          <div className="mt-4">
            <CommunityCommentForm postId={post.id} onSuccess={onCommentAdded} />
          </div>
        )}
      </div>
    </div>
  );
}
