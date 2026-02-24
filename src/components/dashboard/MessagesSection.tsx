'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquarePlus, Send, UserRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { formatMessageTime } from '@/lib/dateUtils';
import { Doctor, DoctorMessage } from '@/types';
import { getAllDoctorsArray } from '@/lib/api/doctors';
import { getToken } from '@/lib/api/config';
import {
  markConversationAsRead,
  sendMessage,
  subscribeToConversation,
  subscribeToConversationsSummary,
  ConversationSummary,
} from '@/lib/messageStorage';

interface MessagesSectionProps {
  doctor: Doctor;
  otherDoctorId?: string;
  basePath?: string;
}

const AVATAR_COLORS = [
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
  'bg-gray-200 text-gray-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name.slice(0, 2) || '?').toUpperCase();
}

export function MessagesSection({ doctor, otherDoctorId, basePath }: MessagesSectionProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [isNewChatMode, setIsNewChatMode] = useState(false);
  const [composer, setComposer] = useState('');
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [threadMessages, setThreadMessages] = useState<DoctorMessage[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  // Load all doctors asynchronously
  useEffect(() => {
    async function loadDoctors() {
      try {
        const token = getToken();
        const all = await getAllDoctorsArray(token ?? undefined);
        const filtered = all.filter((d) => d.id !== doctor.id);

        // If current user is not admin, add admin to the list of available contacts
        if (doctor.id !== 'admin') {
          const adminDoctor: Doctor = {
            id: 'admin',
            fullName: 'Alliance Admin',
            specialty: 'System Administrator',
            email: 'admin@alliance.com',
            // Minimal fields needed for the list
          } as Doctor;
          setAllDoctors([adminDoctor, ...filtered]);
        } else {
          setAllDoctors(filtered);
        }
      } catch (error) {
        console.error('Error loading doctors:', error);
        setAllDoctors([]);
      }
    }
    loadDoctors();
  }, [doctor.id]);

  const doctorsById = useMemo(() => {
    const map = new Map<string, Partial<Doctor>>();
    for (const d of allDoctors) map.set(d.id, d);
    // Add virtual Admin doctor
    map.set('admin', {
      id: 'admin',
      fullName: 'Alliance Admin',
      specialty: 'System Administrator',
    });
    return map;
  }, [allDoctors]);

  const selectedOtherId = otherDoctorId;

  // Real-time Sidebar & Thread subscriptions
  useEffect(() => {
    try {
      // Subscribe to real-time summaries (already sorted by latest message in helper)
      const unsubSummaries = subscribeToConversationsSummary(doctor.id, (summaries) => {
        setConversations(summaries);
      });

      // Subscribe to the active thread
      let unsubThread: (() => void) | undefined;
      if (selectedOtherId) {
        unsubThread = subscribeToConversation(doctor.id, selectedOtherId, (messages: DoctorMessage[]) => {
          setThreadMessages(messages);
        });
        markConversationAsRead(doctor.id, selectedOtherId).catch(err => {
          console.warn('[MessagesSection] Error marking as read:', err);
        });
        setIsNewChatMode(false);
      } else {
        setThreadMessages([]);
      }

      return () => {
        unsubSummaries();
        if (unsubThread) unsubThread();
      };
    } catch (err) {
      console.warn('[MessagesSection] Error in useEffect:', err);
      return () => { };
    }
  }, [doctor.id, selectedOtherId]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [selectedOtherId, threadMessages.length]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (isNewChatMode) {
      if (!q) return allDoctors;
      return allDoctors.filter(d =>
        d.fullName.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q)
      );
    } else {
      if (!q) return conversations;
      return conversations.filter((c) => {
        const d = doctorsById.get(c.otherDoctorId);
        const name = d?.fullName?.toLowerCase() || (c.otherDoctorId === 'admin' ? 'alliance admin' : '');
        const spec = d?.specialty?.toLowerCase() || (c.otherDoctorId === 'admin' ? 'system administrator' : '');
        const preview = c.lastMessage?.content?.toLowerCase() || '';
        return name.includes(q) || spec.includes(q) || preview.includes(q);
      });
    }
  }, [isNewChatMode, allDoctors, conversations, doctorsById, search]);

  const openConversation = (id: string) => {
    const base = basePath || '/doctor/dashboard/messages';
    const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
    router.push(`${cleanBase}?otherDoctorId=${encodeURIComponent(id)}`);
  };

  const handleSend = async () => {
    if (!selectedOtherId || !composer.trim()) return;
    try {
      await sendMessage(doctor.id, selectedOtherId, composer);
      setComposer('');
    } catch (err) {
      console.warn('[MessagesSection] Error sending message:', err);
    }
  };

  const selectedDoctor = selectedOtherId ? doctorsById.get(selectedOtherId) : null;
  const lastMessage = threadMessages.length > 0 ? threadMessages[threadMessages.length - 1] : null;
  const lastMessageSenderName = lastMessage
    ? (lastMessage.senderId === doctor.id ? 'You' : (doctorsById.get(lastMessage.senderId)?.fullName ?? 'Unknown'))
    : null;

  return (
    <div className="flex flex-col gap-5 overflow-hidden">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-sm text-gray-500">
          Secure direct messaging with AIP colleagues and administration.
        </p>
      </header>

      <div className="flex h-[calc(100vh-200px)] flex-col gap-4 overflow-hidden md:flex-row">
      {/* Sidebar - Conversation list */}
      <Card className="flex w-full flex-col overflow-hidden border-gray-200 bg-white md:w-80 lg:w-96 glass-card">
        <CardHeader className="border-b bg-gray-50/50 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageSquarePlus className="h-5 w-5 text-brand-dark-blue" />
              {isNewChatMode ? 'New Chat' : 'Chats'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsNewChatMode(!isNewChatMode);
                setSearch('');
              }}
              className={cn(
                "h-8 px-2 text-xs font-semibold",
                isNewChatMode ? "text-brand-dark-blue hover:text-brand-dark-blue" : "text-gray-500 hover:text-brand-dark-blue"
              )}
            >
              {isNewChatMode ? 'Back to Chats' : '+ New Chat'}
            </Button>
          </div>
          <div>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isNewChatMode ? "Search all physicians..." : "Search messages..."}
              className="h-10 bg-white shadow-sm focus-ring"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="p-2">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                  <UserRound className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {isNewChatMode ? 'No physicians found' : 'No chats yet'}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {isNewChatMode ? 'Try a different search term.' : 'Start a conversation with a peer.'}
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {isNewChatMode ? (
                  (filteredItems as Doctor[]).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => openConversation(d.id)}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 hover:bg-brand-dark-blue/5"
                    >
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-dark-blue/10 text-brand-dark-blue text-base font-bold shadow-sm group-hover:bg-brand-dark-blue group-hover:text-white transition-colors">
                        {d.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900">{d.fullName}</div>
                        <div className="truncate text-xs text-gray-500">
                          {d.specialty}
                          {d.email && (
                            <span className="ml-2 text-[10px] text-gray-400">({d.email})</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  (filteredItems as ConversationSummary[]).map((c) => {
                    const d = doctorsById.get(c.otherDoctorId);
                    const name = d?.fullName || (c.otherDoctorId === 'admin' ? 'Alliance Admin' : 'Unknown');
                    const active = selectedOtherId === c.otherDoctorId;
                    const avatarColor = getAvatarColor(name);
                    return (
                      <button
                        key={c.otherDoctorId}
                        type="button"
                        onClick={() => openConversation(c.otherDoctorId)}
                        className={cn(
                          'group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200',
                          active ? 'bg-gray-100' : 'hover:bg-gray-50'
                        )}
                      >
                        <div className={cn(
                          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                          avatarColor
                        )}>
                          {getInitials(name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-semibold text-gray-900">{name}</span>
                            <span className="flex flex-shrink-0 items-center gap-1.5">
                              {c.lastMessage?.sentAt && (
                                <span className="text-xs text-gray-400">
                                  {formatMessageTime(c.lastMessage.sentAt)}
                                </span>
                              )}
                              {c.unreadCount > 0 && (
                                <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
                              )}
                            </span>
                          </div>
                          <p className="truncate text-xs text-gray-500">
                            {c.lastMessage?.senderId === doctor.id ? 'You: ' : ''}
                            {c.lastMessage?.content || d?.specialty}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Thread */}
      <Card className="flex flex-1 flex-col overflow-hidden border-gray-200 bg-white glass-card">
        {!selectedOtherId ? (
          <div className="flex flex-1 flex-col items-center justify-center bg-gray-50/30 p-10 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl">
              <MessageSquarePlus className="h-12 w-12 text-brand-dark-blue/20" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Select a conversation</h3>
            <p className="mt-2 max-w-xs text-gray-500">
              Your messages will appear here. Choose a contact from the list to start chatting.
            </p>
          </div>
        ) : (
          <>
            <CardHeader className="border-b bg-white px-6 py-4">
              <CardTitle className="text-lg font-bold text-gray-900">
                Conversation with {selectedDoctor?.fullName}
              </CardTitle>
              {lastMessageSenderName != null && lastMessage && (
                <CardDescription className="mt-1 text-sm text-gray-500">
                  From: {lastMessageSenderName} – {formatMessageTime(lastMessage.sentAt)}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="relative flex-1 overflow-y-auto bg-white p-0">
              <div className="flex min-h-full flex-col justify-end p-4 md:p-6">
                {threadMessages.length === 0 ? (
                  <div className="mb-auto flex h-full flex-col items-center justify-center p-12 text-center">
                    <p className="text-sm text-gray-400">No messages yet. Send a greeting!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {threadMessages.map((m) => {
                      const mine = m.senderId === doctor.id;
                      const senderName = mine ? 'You' : (doctorsById.get(m.senderId)?.fullName ?? 'Unknown');
                      return (
                        <div
                          key={m.id}
                          className={cn(
                            'rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm',
                            mine && 'bg-gray-50'
                          )}
                        >
                          <div className="mb-1 text-xs font-medium text-gray-500">
                            {senderName} – {formatMessageTime(m.sentAt)}
                          </div>
                          <div className="whitespace-pre-wrap text-sm text-gray-900">{m.content}</div>
                        </div>
                      );
                    })}
                    <div ref={threadEndRef} className="h-2" />
                  </div>
                )}
              </div>
            </CardContent>

            <div className="border-t bg-white p-4">
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/50 p-2 focus-within:border-green-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-green-500/20">
                <Textarea
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your reply..."
                  className="min-h-[44px] max-h-[120px] flex-1 resize-none border-0 bg-transparent py-3 focus-visible:ring-0 text-sm"
                />
                <Button
                  variant="dashboard"
                  onClick={handleSend}
                  disabled={!composer.trim()}
                  className="shrink-0 gap-2"
                >
                  <Send className="h-4 w-4" aria-hidden />
                  Send
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
    </div>
  );
}
