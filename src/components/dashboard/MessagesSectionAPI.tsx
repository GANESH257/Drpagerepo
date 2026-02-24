'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageSquarePlus, Send, UserRound, AlertCircle, RefreshCw } from 'lucide-react';
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

  // Error states — surfaces all silent failures so the user can see what's wrong
  const [threadListError, setThreadListError] = useState<string | null>(null);
  const [doctorLoadError, setDoctorLoadError] = useState<string | null>(null);
  const [newChatError, setNewChatError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const loadThreads = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      setThreadListError(null);
      const list = await getThreads();
      setThreads(Array.isArray(list) ? list : []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load conversations';
      setThreadListError(msg);
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
    setDoctorLoadError(null);
    getAllDoctorsArray(token)
      .then((list) => {
        if (Array.isArray(list)) setAllDoctors(list);
        else setAllDoctors([]);
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : 'Failed to load physicians';
        setDoctorLoadError(msg);
        setAllDoctors([]);
      });
  }, []);

  const openThread = (tid: string) => {
    setSelectedThreadId(tid);
    router.push(`${basePath}?threadId=${encodeURIComponent(tid)}`);
    setIsNewChatMode(false);
  };

  const handleSend = async () => {
    if (!selectedThreadId || !composer.trim()) return;
    setSending(true);
    setSendError(null);
    try {
      await sendMessageAPI(selectedThreadId, composer.trim());
      setComposer('');
      await loadThreadDetail(selectedThreadId);
      await loadThreads();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to send message';
      setSendError(msg);
    } finally {
      setSending(false);
    }
  };

  const handleNewChatSelect = async (doctorId: string) => {
    const token = getToken();
    if (!token) return;
    setNewChatError(null);
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
      const msg = e instanceof Error ? e.message : 'Failed to start conversation';
      setNewChatError(msg);
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
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--aip-teal)] border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col gap-4 overflow-hidden md:flex-row">
      <Card className="flex w-full flex-col overflow-hidden border-border bg-card md:w-80 lg:w-96">
        <CardHeader className="space-y-3 border-b border-border bg-muted/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl text-foreground">
              <MessageSquarePlus className="h-5 w-5 text-[var(--aip-teal)]" />
              {isNewChatMode ? 'New message' : 'Messages'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsNewChatMode(!isNewChatMode);
                setSearch('');
              }}
              className="text-xs font-semibold text-muted-foreground hover:text-[var(--aip-teal)]"
            >
              {isNewChatMode ? 'Back' : '+ New'}
            </Button>
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isNewChatMode ? 'Search physicians...' : 'Search conversations...'}
            className="h-10 bg-background shadow-sm"
          />
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="p-2">
            {/* Error banners */}
            {threadListError && !isNewChatMode && (
              <div className="mb-2 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-red-400">Could not load conversations</p>
                  <p className="text-xs text-red-400/80">{threadListError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => loadThreads()}
                  className="shrink-0 text-red-400 hover:text-red-300"
                  title="Retry"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {doctorLoadError && isNewChatMode && (
              <div className="mb-2 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-red-400">Could not load physicians</p>
                  <p className="text-xs text-red-400/80">{doctorLoadError}</p>
                </div>
              </div>
            )}
            {newChatError && isNewChatMode && (
              <div className="mb-2 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-red-400">Could not start conversation</p>
                  <p className="text-xs text-red-400/80">{newChatError}</p>
                </div>
              </div>
            )}
            {isNewChatMode ? (
              doctorLoadError ? null : filteredDoctors.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No physicians found.</p>
              ) : (
                <div className="space-y-0.5">
                  {filteredDoctors.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleNewChatSelect(d.id)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-[var(--aip-teal)]/10"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--aip-teal)]/10 text-[var(--aip-teal)] font-bold">
                        {d.fullName?.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-foreground">{d.fullName}</div>
                        <div className="truncate text-xs text-muted-foreground">{d.specialty}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserRound className="mb-3 h-12 w-12 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">No conversations yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Start a new message above.</p>
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
                        active ? 'bg-[var(--aip-teal)] text-white' : 'hover:bg-accent'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold',
                          active ? 'bg-white/20' : 'bg-[var(--aip-teal)]/10 text-[var(--aip-teal)]'
                        )}
                      >
                        {displayNameForThread(t).charAt(0) || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={cn('truncate font-semibold', active ? 'text-white' : 'text-foreground')}>
                          {displayNameForThread(t)}
                        </div>
                        <div className={cn('truncate text-xs', active ? 'text-white/80' : 'text-muted-foreground')}>
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

      <Card className="flex flex-1 flex-col overflow-hidden border-border bg-card">
        {!selectedThreadId ? (
          <div className="flex flex-1 flex-col items-center justify-center bg-muted/30 p-10 text-center">
            <MessageSquarePlus className="mb-6 h-24 w-24 text-[var(--aip-teal)]/20" />
            <h3 className="text-xl font-bold text-foreground">Select a conversation</h3>
            <p className="mt-2 max-w-xs text-muted-foreground">
              Choose a thread from the list or start a new message.
            </p>
          </div>
        ) : (
          <>
            <CardHeader className="flex flex-row items-center gap-3 border-b border-border px-6 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--aip-teal)] text-sm font-bold text-white">
                {threadDetail?.participants?.length
                  ? (threadDetail.participants as { participant_name?: string; full_name?: string }[])[0]?.participant_name?.charAt(0) ??
                    (threadDetail.participants as { full_name?: string }[])[0]?.full_name?.charAt(0) ?? '?'
                  : '?'}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-lg text-foreground">
                  {threadDetail?.participants?.length
                    ? (threadDetail.participants as { participant_name?: string; full_name?: string }[])
                        .map((p) => p.participant_name ?? p.full_name)
                        .join(', ')
                    : 'Loading...'}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  {threadDetail?.messages?.length ?? 0} message(s)
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="relative flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6">
              <div className="flex min-h-full flex-col justify-end">
                {!threadDetail?.messages?.length ? (
                  <div className="mb-auto flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
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
                              mine ? 'bg-[var(--aip-teal)] text-white' : 'bg-muted text-foreground'
                            )}
                          >
                            {!mine && (
                              <p className="text-[10px] font-medium opacity-80">{m.sender_name}</p>
                            )}
                            <p className="text-sm">{m.content}</p>
                            <p className={cn('mt-1 text-[10px]', mine ? 'text-white/70' : 'text-muted-foreground')}>
                              {formatDateTime(m.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {sendError && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    <p className="text-xs text-red-400">{sendError}</p>
                    <button type="button" onClick={() => setSendError(null)} className="ml-auto text-red-400 hover:text-red-300 text-xs">✕</button>
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Input
                    value={composer}
                    onChange={(e) => { setComposer(e.target.value); setSendError(null); }}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1"
                    disabled={sending}
                  />
                  <Button onClick={handleSend} disabled={!composer.trim() || sending} className="bg-[var(--aip-teal)] hover:opacity-90">
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
