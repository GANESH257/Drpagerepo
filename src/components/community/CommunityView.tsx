'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDateTime } from '@/lib/dateUtils';
import { toast } from '@/lib/toast';
import {
  MessageSquarePlus,
  Send,
  User,
  ChevronRight,
  Search,
  LayoutGrid,
  MessageCircle,
} from 'lucide-react';

interface CommunityViewProps {
  canPost?: boolean;
}

export function CommunityView({ canPost = true }: CommunityViewProps) {
  const [sections, setSections] = useState<CommunitySection[]>([]);
  const [section, setSection] = useState('general');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
      const res = await getCommunityPosts(section, 1, 100);
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

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.trim().toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.body && p.body.toLowerCase().includes(q)) ||
        (p.author_display_name && p.author_display_name.toLowerCase().includes(q))
    );
  }, [posts, searchQuery]);

  const currentSectionName = sections.find((s) => s.id === section)?.name ?? section;

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
    <div className="min-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0F5FA8] to-[#0d5499] px-6 py-8 text-white shadow-lg md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Community</h1>
            <p className="mt-1 max-w-xl text-sm text-white/90 md:text-base">
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
              className="shrink-0 bg-white text-[#0F5FA8] hover:bg-white/90 hover:text-[#0d5499]"
            >
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              New question
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        {/* Section filter sidebar */}
        <aside className="lg:w-56 xl:w-64 shrink-0">
          <Card className="sticky top-4 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <LayoutGrid className="h-4 w-4" />
                Section
              </CardTitle>
              <CardDescription className="text-xs">
                Filter questions by specialty
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Desktop: scrollable list */}
              <div className="hidden max-h-[calc(100vh-280px)] overflow-y-auto rounded-lg border bg-gray-50/50 lg:block">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSection(s.id)}
                    className={`block w-full px-3 py-2.5 text-left text-sm transition-colors ${
                      section === s.id
                        ? 'bg-[#0F5FA8] font-medium text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
              {/* Mobile: dropdown */}
              <div className="lg:hidden">
                <Select value={section} onValueChange={setSection}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main content: search + post list */}
        <main className="min-w-0 flex-1">
          <Card>
            <CardHeader className="border-b pb-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search questions, answers, or authors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    aria-label="Search posts"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="hidden sm:inline">{currentSectionName}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
                    {filteredPosts.length} {filteredPosts.length === 1 ? 'question' : 'questions'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex min-h-[280px] items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3 text-gray-500">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0F5FA8] border-t-transparent" />
                    <span className="text-sm">Loading questions...</span>
                  </div>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center py-12 text-center">
                  <MessageCircle className="mb-3 h-12 w-12 text-gray-300" />
                  <p className="font-medium text-gray-600">
                    {searchQuery.trim()
                      ? 'No questions match your search.'
                      : 'No questions in this section yet.'}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery.trim()
                      ? 'Try a different search or section.'
                      : 'Be the first to ask.'}
                  </p>
                  {canPost && !searchQuery.trim() && (
                    <Button
                      className="mt-4"
                      onClick={() => {
                        setNewPostSection(section);
                        setNewPostTitle('');
                        setNewPostBody('');
                        setNewPostOpen(true);
                      }}
                    >
                      <MessageSquarePlus className="mr-2 h-4 w-4" />
                      New question
                    </Button>
                  )}
                </div>
              ) : (
                <ul className="divide-y">
                  {filteredPosts.map((post) => (
                    <li key={post.id}>
                      <button
                        type="button"
                        onClick={() => openPost(post.id)}
                        className="flex w-full items-start gap-4 p-4 text-left transition-colors hover:bg-gray-50/80"
                      >
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900">{post.title}</h3>
                          {post.body && (
                            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                              {post.body.replace(/\s+/g, ' ').slice(0, 160)}
                              {post.body.length > 160 ? '…' : ''}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                            <span>{post.author_display_name}</span>
                            <span>·</span>
                            <span>{formatDateTime(post.created_at)}</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* New post dialog */}
      <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New question</DialogTitle>
            <CardDescription>Post to the community. Choose a section so others can find it.</CardDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <Label htmlFor="new-section">Section</Label>
              <Select value={newPostSection} onValueChange={setNewPostSection}>
                <SelectTrigger id="new-section" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Post detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {postDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-8 text-lg">{postDetail.title}</DialogTitle>
                <CardDescription>
                  {postDetail.author_display_name} · {formatDateTime(postDetail.created_at)}
                </CardDescription>
              </DialogHeader>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">
                {postDetail.body}
              </div>
              <div className="mt-6 border-t pt-6">
                <h4 className="mb-3 font-semibold text-gray-900">Answers</h4>
                {postDetail.comments && postDetail.comments.length > 0 ? (
                  <ul className="space-y-4">
                    {postDetail.comments.map((c) => (
                      <li key={c.id}>
                        <div className="flex gap-3 rounded-xl bg-gray-50 p-4">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F5FA8]/10">
                            <User className="h-4 w-4 text-[#0F5FA8]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-[#0F5FA8]">
                              {c.author_display_name}
                            </div>
                            <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                              {c.body}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
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
                <form onSubmit={handleAddComment} className="mt-6 border-t pt-6">
                  <Label htmlFor="comment-body">Add your answer</Label>
                  <Textarea
                    id="comment-body"
                    value={newCommentBody}
                    onChange={(e) => setNewCommentBody(e.target.value)}
                    placeholder="Write your answer..."
                    rows={3}
                    className="mt-2"
                  />
                  <Button type="submit" size="sm" className="mt-2" disabled={submitting}>
                    <Send className="mr-1.5 h-3.5 w-3.5" />
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
