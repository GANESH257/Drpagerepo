'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
      setError(null);
    } catch (e) {
      console.warn('Failed to load community sections:', e);
      setError(e instanceof Error ? e.message : 'Failed to load sections');
      // Set default section on error
      setSections([{ id: 'general', name: 'General' }]);
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
    // Wrap in async IIFE to handle errors properly
    (async () => {
      try {
        await loadSections();
      } catch (error) {
        // Error already handled in loadSections, but prevent unhandled rejection
        console.warn('Error in loadSections effect:', error);
      }
    })();
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
      <div>
        <h2 className="text-2xl font-bold text-[#0F5FA8]">Forum Management</h2>
        <p className="text-gray-600 mt-1">View forum and delete any post or topic.</p>
      </div>
      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Section</span>
            <Select value={section} onValueChange={setSection}>
              <SelectTrigger className="w-[200px]">
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F5FA8]" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-gray-600">No posts in this section.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="max-w-[300px]">
                        <div className="font-medium truncate">{p.title || '(No title)'}</div>
                        {p.body && (
                          <div className="text-xs text-gray-500 truncate max-w-[300px]">
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
        </CardContent>
      </Card>
    </div>
  );
}
