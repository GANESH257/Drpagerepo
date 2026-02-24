'use client';

import { useCallback, useEffect, useState } from 'react';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  getCommunitySections,
  getCommunityPosts,
  deleteCommunityPost,
  type CommunitySection,
  type CommunityPost,
} from '@/lib/api/community';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminCommunityForumPage() {
  const [sections, setSections] = useState<CommunitySection[]>([]);
  const [section, setSection] = useState<string>('general');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const loadSections = useCallback(async () => {
    try {
      const list = await getCommunitySections();
      const arr = Array.isArray(list) ? list : [];
      setSections(arr);
      if (arr.length) setSection((s) => s || arr[0].id || arr[0].name || 'general');
      else setSection((s) => s || 'general');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sections');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPosts = useCallback(async () => {
    if (!section) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getCommunityPosts(section, 1, 100);
      setPosts(res.posts ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  useEffect(() => {
    if (section) loadPosts();
  }, [section, loadPosts]);

  const handleDelete = async (postId: string) => {
    setActingId(postId);
    try {
      await deleteCommunityPost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete post');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Forum Management"
        description="View forum and delete any post or topic."
      />
      {error && (
        <div className="glass-card p-6">
          <p className="text-destructive">{error}</p>
        </div>
      )}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Section</span>
          <Select value={section} onValueChange={setSection}>
            <SelectTrigger className="w-[200px] rounded-lg border border-input">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((s) => (
                <SelectItem key={s.id || s.name} value={s.id || s.name || 'general'}>
                  {s.name || s.id}
                </SelectItem>
              ))}
              {sections.length === 0 && (
                <SelectItem value="general">General</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--aip-teal)' }} />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground">No posts in this section.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="uppercase tracking-wider text-muted-foreground">Title</TableHead>
                <TableHead className="uppercase tracking-wider text-muted-foreground">Author</TableHead>
                <TableHead className="uppercase tracking-wider text-muted-foreground">Date</TableHead>
                <TableHead className="text-right uppercase tracking-wider text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((p) => (
                <TableRow key={p.id} className="hover:bg-accent/30">
                  <TableCell>
                    <div className="max-w-[300px]">
                      <div className="font-medium truncate">{p.title || '(No title)'}</div>
                      {p.body && (
                        <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                          {p.body}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{p.author_display_name ?? p.author_id ?? '—'}</TableCell>
                  <TableCell>
                    {p.created_at
                      ? new Date(p.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={!!actingId}
                      onClick={() => handleDelete(p.id)}
                    >
                      {actingId === p.id ? '…' : 'Delete post'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
