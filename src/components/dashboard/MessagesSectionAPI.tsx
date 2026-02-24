'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageSquarePlus, Send, UserRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  getThreads,
  getThread,
  sendMessage as sendMessageAPI,
  createThread,
  type MessageThread,
  type ThreadWithMessages,
  type Message,
} from '@/lib/api/messages';
import { getAllDoctorsArray } from '@/lib/api/doctors';
import { getToken } from '@/lib/api/config';
import { Doctor } from '@/types';
import { formatDateTime } from '@/lib/dateUtils';

const DEFAULT_BASE_PATH = '/doctor/dashboard/messages';

interface MessagesSectionAPIProps {
  /** Current doctor id (for "You" in messages); from dashboard context */
  currentDoctorId?: string | null;
  /** Base path for message routes (e.g. /admin/messages or /doctor/dashboard/messages) */
  basePath?: string;
}

export function MessagesSectionAPI({ currentDoctorId: currentDoctorIdProp, basePath: basePathProp }: MessagesSectionAPIProps) {
  const basePath = basePathProp ?? DEFAULT_BASE_PATH;
  const router = useRouter();
  const searchParams = useSearchParams();
  const threadIdFromUrl = searchParams.get('threadId') ?? undefined;
  const otherDoctorIdFromUrl = searchParams.get('otherDoctorId') ?? undefined;

  const currentDoctorId = currentDoctorIdProp ?? null;

  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(threadIdFromUrl ?? null);
  const [threadDetail, setThreadDetail] = useState<ThreadWithMessages | null>(null);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [composer, setComposer] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isNewChatMode, setIsNewChatMode] = useState(false);
  const [search, setSearch] = useState('');
  const otherDoctorHandled = useRef(false);

  const loadThreads = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const list = await getThreads();
      setThreads(Array.isArray(list) ? list : []);
    } catch {
      setThreads([]);
    }
  }, []);

  const loadThreadDetail = useCallback(
    async (tid: string) => {
      try {
        const detail = await getThread(tid);
        setThreadDetail(detail);
      } catch {
        setThreadDetail(null);
      }
    },
    []
  );

  // Sync URL with selected thread
  useEffect(() => {
    const tid = searchParams.get('threadId');
    if (tid) setSelectedThreadId(tid);
  }, [searchParams]);

  // Load threads and current user's doctor id (from first thread's "other" we can infer; we need doctor id for "mine" in messages - get from thread participants: the one that is not in participants is "me" for display. Actually we need current doctor id to show "You" in messages. We don't have it in API. So we need to get it from context or from thread: in getThread the participants include both; the backend returns participants for the thread. So when we load a thread, messages have sender_id. We don't have "current user doctor id" from messages API. So we need to get it from Dashboard context. Let me add a prop currentDoctorId to MessagesSectionAPI and pass it from the wrapper. So the wrapper gets doctor from context and passes doctor.id to MessagesSectionAPI.
  // Actually re-reading the backend: getThread returns messages with sender_id. So "mine" = message.sender_id === currentDoctorId. We need currentDoctorId. So I'll get it from useDoctorContext in the wrapper and pass it down. So MessagesSectionAPI receives optional currentDoctorId. When we don't have it (e.g. context not available), we can't show "You" for sent messages - we could show by comparing sender_id to the "other" participant: if message.sender_id is in threadDetail.participants then it's "other", else it's "me" if there are only 2 participants. So: participants in getThread are all participants (backend returns all for the thread). So the one that is not current user is the "other". So we need current user's doctor id. I'll add prop currentDoctorId to MessagesSectionAPI.
  // Initial load
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    loadThreads().then(() => setLoading(false)).catch(() => setLoading(false));
  }, [loadThreads]);

  // Poll for new threads and new messages so receiver sees new conversations and incoming messages
  const POLL_INTERVAL_MS = 15000; // 15 seconds
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const interval = setInterval(() => {
      loadThreads();
      if (selectedThreadId) loadThreadDetail(selectedThreadId);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadThreads, loadThreadDetail, selectedThreadId]);

  // Refresh threads (and open thread) when window regains focus so receiver sees updates after switching tabs
  useEffect(() => {
    const onFocus = () => {
      const token = getToken();
      if (!token) return;
      loadThreads();
      if (selectedThreadId) loadThreadDetail(selectedThreadId);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadThreads, loadThreadDetail, selectedThreadId]);

  // When URL has otherDoctorId but no threadId, find existing thread or create one (once)
  useEffect(() => {
    if (!otherDoctorIdFromUrl || threadIdFromUrl || otherDoctorHandled.current) return;
    const found = threads.find((t) =>
      (t.participants ?? []).some((p: { id: string }) => p.id === otherDoctorIdFromUrl)
    );
    if (found) {
      otherDoctorHandled.current = true;
      router.replace(`${basePath}?threadId=${encodeURIComponent(found.id)}`);
      setSelectedThreadId(found.id);
    } else if (threads.length >= 0 && !loading) {
      otherDoctorHandled.current = true;
      const token = getToken();
      if (token) {
        createThread({ participant_ids: [otherDoctorIdFromUrl] })
          .then((thread) => {
            router.replace(`${basePath}?threadId=${encodeURIComponent(thread.id)}`);
            setSelectedThreadId(thread.id);
            loadThreadDetail(thread.id);
            loadThreads();
          })
          .catch(() => { otherDoctorHandled.current = false; });
      }
    }
  }, [otherDoctorIdFromUrl, threadIdFromUrl, threads, loading, loadThreadDetail, loadThreads, router]);

  useEffect(() => {
    if (!selectedThreadId) {
      setThreadDetail(null);
      return;
    }
    loadThreadDetail(selectedThreadId);
  }, [selectedThreadId, loadThreadDetail]);

  // Load doctors for new-chat picker
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    getAllDoctorsArray(token)
      .then((list) => setAllDoctors(Array.isArray(list) ? list : []))
      .catch(() => setAllDoctors([]));
  }, []);

  const openThread = (tid: string) => {
    setSelectedThreadId(tid);
    router.push(`${basePath}?threadId=${encodeURIComponent(tid)}`);
    setIsNewChatMode(false);
  };

  const handleSend = async () => {
    if (!selectedThreadId || !composer.trim()) return;
    setSending(true);
    try {
      await sendMessageAPI(selectedThreadId, composer.trim());
      setComposer('');
      await loadThreadDetail(selectedThreadId);
      await loadThreads();
    } catch (e) {
      console.warn('Send message failed', e);
    } finally {
      setSending(false);
    }
  };

  const handleNewChatSelect = async (doctorId: string) => {
    const token = getToken();
    if (!token) return;
    try {
      const thread = await createThread({ participant_ids: [doctorId] });
      const tid = thread.id;
      setSelectedThreadId(tid);
      router.push(`${basePath}?threadId=${encodeURIComponent(tid)}`);
      setThreadDetail(null);
      await loadThreadDetail(tid);
      await loadThreads();
      setIsNewChatMode(false);
    } catch (e) {
      console.warn('Create thread failed', e);
    }
  };

  const displayNameForThread = (t: MessageThread) => {
    const participants = t.participants ?? [];
    if (participants.length === 0) return 'Unknown';
    return participants.map((p) => p.full_name).join(', ');
  };

  const filteredThreads = search.trim()
    ? threads.filter((t) => displayNameForThread(t).toLowerCase().includes(search.trim().toLowerCase()))
    : threads;
  const filteredDoctors = search.trim()
    ? allDoctors.filter(
        (d) =>
          d.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          d.specialty?.toLowerCase().includes(search.toLowerCase())
      )
    : allDoctors;

  const isMine = (msg: Message) => {
    if (currentDoctorId) return msg.sender_id === currentDoctorId;
    if (!threadDetail?.participants?.length) return false;
    const participantIds = (threadDetail.participants as { participant_id?: string; id?: string }[]).map(
      (p) => p.participant_id ?? p.id
    );
    return !participantIds.includes(msg.sender_id);
  };

  if (loading && threads.length === 0) {
    return (
      <div className="flex h-[calc(100vh-140px)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0F5FA8] border-t-transparent" />
          <p className="text-sm text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col gap-4 overflow-hidden md:flex-row">
      <Card className="flex w-full flex-col overflow-hidden border-gray-200 bg-white md:w-80 lg:w-96">
        <CardHeader className="space-y-3 border-b bg-gray-50/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageSquarePlus className="h-5 w-5 text-[#0F5FA8]" />
              {isNewChatMode ? 'New message' : 'Messages'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsNewChatMode(!isNewChatMode);
                setSearch('');
              }}
              className="text-xs font-semibold text-gray-600 hover:text-[#0F5FA8]"
            >
              {isNewChatMode ? 'Back' : '+ New'}
            </Button>
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isNewChatMode ? 'Search physicians...' : 'Search conversations...'}
            className="h-10 bg-white shadow-sm"
          />
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="p-2">
            {isNewChatMode ? (
              filteredDoctors.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">No physicians found.</p>
              ) : (
                <div className="space-y-0.5">
                  {filteredDoctors.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleNewChatSelect(d.id)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-[#0F5FA8]/5"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0F5FA8]/10 text-[#0F5FA8] font-bold">
                        {d.fullName?.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900">{d.fullName}</div>
                        <div className="truncate text-xs text-gray-500">{d.specialty}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserRound className="mb-3 h-12 w-12 text-gray-300" />
                <p className="text-sm font-medium text-gray-600">No conversations yet</p>
                <p className="mt-1 text-xs text-gray-500">Start a new message above.</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredThreads.map((t) => {
                  const active = selectedThreadId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => openThread(t.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left',
                        active ? 'bg-[#0F5FA8] text-white' : 'hover:bg-gray-100'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold',
                          active ? 'bg-white/20' : 'bg-[#0F5FA8]/10 text-[#0F5FA8]'
                        )}
                      >
                        {displayNameForThread(t).charAt(0) || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={cn('truncate font-semibold', active ? 'text-white' : 'text-gray-900')}>
                          {displayNameForThread(t)}
                        </div>
                        <div className={cn('truncate text-xs', active ? 'text-white/80' : 'text-gray-500')}>
                          {t.last_message_at
                            ? formatDateTime(t.last_message_at)
                            : `${t.message_count ?? 0} message(s)`}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-1 flex-col overflow-hidden border-gray-200 bg-white">
        {!selectedThreadId ? (
          <div className="flex flex-1 flex-col items-center justify-center bg-gray-50/30 p-10 text-center">
            <MessageSquarePlus className="mb-6 h-24 w-24 text-[#0F5FA8]/20" />
            <h3 className="text-xl font-bold text-gray-900">Select a conversation</h3>
            <p className="mt-2 max-w-xs text-gray-500">
              Choose a thread from the list or start a new message.
            </p>
          </div>
        ) : (
          <>
            <CardHeader className="flex flex-row items-center gap-3 border-b px-6 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F5FA8] text-sm font-bold text-white">
                {threadDetail?.participants?.length
                  ? (threadDetail.participants as { participant_name?: string; full_name?: string }[])[0]?.participant_name?.charAt(0) ??
                    (threadDetail.participants as { full_name?: string }[])[0]?.full_name?.charAt(0) ?? '?'
                  : '?'}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-lg text-gray-900">
                  {threadDetail?.participants?.length
                    ? (threadDetail.participants as { participant_name?: string; full_name?: string }[])
                        .map((p) => p.participant_name ?? p.full_name)
                        .join(', ')
                    : 'Loading...'}
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  {threadDetail?.messages?.length ?? 0} message(s)
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="relative flex-1 overflow-y-auto bg-[#f0f2f5] p-4 md:p-6">
              <div className="flex min-h-full flex-col justify-end">
                {!threadDetail?.messages?.length ? (
                  <div className="mb-auto flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm text-gray-500">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {threadDetail.messages.map((m) => {
                      const mine = isMine(m);
                      return (
                        <div
                          key={m.id}
                          className={cn(
                            'flex',
                            mine ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div
                            className={cn(
                              'max-w-[85%] rounded-2xl px-4 py-2 shadow-sm',
                              mine ? 'bg-[#0F5FA8] text-white' : 'bg-white text-gray-900'
                            )}
                          >
                            {!mine && (
                              <p className="text-[10px] font-medium opacity-80">{m.sender_name}</p>
                            )}
                            <p className="text-sm">{m.content}</p>
                            <p className={cn('mt-1 text-[10px]', mine ? 'text-white/70' : 'text-gray-500')}>
                              {formatDateTime(m.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Input
                    value={composer}
                    onChange={(e) => setComposer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1"
                    disabled={sending}
                  />
                  <Button onClick={handleSend} disabled={!composer.trim() || sending} className="bg-[#0F5FA8] hover:bg-[#0F5FA8]/90">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
