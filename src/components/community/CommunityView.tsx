'use client';

import { useEffect, useState } from 'react';
import {
  getCommunitySections,
  getCommunityPosts,
  getCommunityPost,
  createCommunityPost,
  createCommunityComment,
  type CommunitySection,
  type CommunityPost,
  type CommunityPostWithComments,
} from '@/lib/api/community';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatDateTime } from '@/lib/dateUtils';
import { toast } from '@/lib/toast';
import { MessageSquarePlus, Send, User, ChevronRight } from 'lucide-react';

interface CommunityViewProps {
  canPost?: boolean;
}

export function CommunityView({ canPost = true }: CommunityViewProps) {
  const [sections, setSections] = useState<CommunitySection[]>([]);
  const [section, setSection] = useState('general');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [postDetail, setPostDetail] = useState<CommunityPostWithComments | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newPostSection, setNewPostSection] = useState('general');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');
  const [newCommentBody, setNewCommentBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadSections = async () => {
    try {
      const list = await getCommunitySections();
      setSections(list);
      if (list.length > 0 && !list.some((s) => s.id === section)) {
        setSection(list[0].id);
      }
    } catch (e) {
      console.error(e);
      setSections([{ id: 'general', name: 'General' }]);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await getCommunityPosts(section, 1, 20);
      setPosts(res.posts);
      setPagination(res.pagination);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  useEffect(() => {
    if (section) loadPosts();
  }, [section]);

  const openPost = async (id: string) => {
    try {
      const data = await getCommunityPost(id);
      setPostDetail(data);
      setNewCommentBody('');
      setDetailOpen(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load post');
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostBody.trim()) {
      toast.error('Title and body are required');
      return;
    }
    setSubmitting(true);
    try {
      await createCommunityPost(newPostSection, newPostTitle.trim(), newPostBody.trim());
      toast.success('Question posted');
      setNewPostOpen(false);
      setNewPostTitle('');
      setNewPostBody('');
      setNewPostSection(section);
      loadPosts();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postDetail || !newCommentBody.trim()) return;
    setSubmitting(true);
    try {
      await createCommunityComment(postDetail.id, newCommentBody.trim());
      toast.success('Answer added');
      setNewCommentBody('');
      const updated = await getCommunityPost(postDetail.id);
      setPostDetail(updated);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to add answer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F5FA8]">Community</h2>
          <p className="text-gray-600 mt-1">
            Ask questions and share with the network. Browse by section and see who answered.
          </p>
        </div>
        {canPost && (
          <Button
            onClick={() => {
              setNewPostSection(section);
              setNewPostTitle('');
              setNewPostBody('');
              setNewPostOpen(true);
            }}
            className="bg-[#0F5FA8] hover:bg-[#1a6bb8]"
          >
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            New question
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Sections</CardTitle>
          <CardDescription>Choose a section to view questions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={section} onValueChange={setSection}>
            <TabsList className="flex flex-wrap gap-1 h-auto bg-gray-100 p-1">
              {sections.map((s) => (
                <TabsTrigger key={s.id} value={s.id} className="data-[state=active]:bg-white">
                  {s.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={section} className="mt-4">
              {loading ? (
                <div className="py-8 text-center text-gray-500">Loading posts...</div>
              ) : posts.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No questions in this section yet. Be the first to ask.
                </div>
              ) : (
                <ul className="space-y-2">
                  {posts.map((post) => (
                    <li key={post.id}>
                      <button
                        type="button"
                        onClick={() => openPost(post.id)}
                        className="w-full text-left flex items-center justify-between gap-2 p-3 rounded-lg border hover:bg-gray-50 hover:border-[#0F5FA8]/30 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 truncate">{post.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {post.author_display_name} · {formatDateTime(post.created_at)}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* New post dialog */}
      <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New question</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <Label htmlFor="new-section">Section</Label>
              <select
                id="new-section"
                value={newPostSection}
                onChange={(e) => setNewPostSection(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="new-title">Title</Label>
              <Input
                id="new-title"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Brief title for your question"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="new-body">Question</Label>
              <Textarea
                id="new-body"
                value={newPostBody}
                onChange={(e) => setNewPostBody(e.target.value)}
                placeholder="Describe your question..."
                rows={5}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setNewPostOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Post detail dialog (with comments / who answered) */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {postDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-8">{postDetail.title}</DialogTitle>
                <CardDescription>
                  {postDetail.author_display_name} · {formatDateTime(postDetail.created_at)}
                </CardDescription>
              </DialogHeader>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {postDetail.body}
              </div>
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Answers</h4>
                {postDetail.comments && postDetail.comments.length > 0 ? (
                  <ul className="space-y-3">
                    {postDetail.comments.map((c) => (
                      <li key={c.id} className="flex gap-2">
                        <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 flex-1">
                          <User className="h-4 w-4 text-[#0F5FA8] mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs font-medium text-[#0F5FA8]">
                              Answered by {c.author_display_name}
                            </div>
                            <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                              {c.body}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDateTime(c.created_at)}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No answers yet.</p>
                )}
              </div>
              {canPost && (
                <form onSubmit={handleAddComment} className="border-t pt-4 mt-4 space-y-2">
                  <Label htmlFor="comment-body">Add your answer</Label>
                  <Textarea
                    id="comment-body"
                    value={newCommentBody}
                    onChange={(e) => setNewCommentBody(e.target.value)}
                    placeholder="Write your answer..."
                    rows={3}
                    className="mt-1"
                  />
                  <Button type="submit" size="sm" disabled={submitting}>
                    <Send className="h-3 w-3 mr-1" />
                    {submitting ? 'Sending...' : 'Post answer'}
                  </Button>
                </form>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
