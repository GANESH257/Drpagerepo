'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquarePlus, Send, UserRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Doctor, DoctorMessage } from '@/types';
import { getAllDoctors } from '@/lib/memberStorage';
import {
  markConversationAsRead,
  sendMessage,
  subscribeToConversation,
  subscribeToConversationPartners,
} from '@/lib/messageStorage';
import { query, collection, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface MessagesSectionProps {
  doctor: Doctor;
  otherDoctorId?: string;
}

type ConversationSummary = {
  otherDoctorId: string;
  lastMessage?: DoctorMessage;
  unreadCount: number;
};

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function MessagesSection({ doctor, otherDoctorId }: MessagesSectionProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [isNewChatMode, setIsNewChatMode] = useState(false);
  const [composer, setComposer] = useState('');
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [threadMessages, setThreadMessages] = useState<DoctorMessage[]>([]);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  const allDoctors = useMemo(() => {
    const all = getAllDoctors();
    return all.filter((d) => d.id !== doctor.id);
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
      // Subscribe to conversation partners, then fetch last message per partner
      const unsubPartners = subscribeToConversationPartners(doctor.id, async (partnerIds) => {
        try {
          const summaries: ConversationSummary[] = await Promise.all(
            partnerIds.map(async (pid) => {
              try {
                // Fetch all messages between doctor and this partner (no orderBy = no composite index)
                const qA = query(
                  collection(db, 'messages'),
                  where('senderId', '==', doctor.id),
                  where('receiverId', '==', pid)
                );
                const qB = query(
                  collection(db, 'messages'),
                  where('senderId', '==', pid),
                  where('receiverId', '==', doctor.id)
                );
                const [snapA, snapB] = await Promise.all([getDocs(qA), getDocs(qB)]);
                const candidates: DoctorMessage[] = [];
                const toMsg = (docSnap: any): DoctorMessage => {
                  const d = docSnap.data();
                  return {
                    id: docSnap.id,
                    senderId: d.senderId,
                    receiverId: d.receiverId,
                    content: d.content,
                    sentAt: d.sentAt instanceof Timestamp ? d.sentAt.toDate().toISOString() : (d.sentAt ?? ''),
                    readAt: d.readAt instanceof Timestamp ? d.readAt.toDate().toISOString() : d.readAt,
                  };
                };
                snapA.docs.forEach(d => candidates.push(toMsg(d)));
                snapB.docs.forEach(d => candidates.push(toMsg(d)));
                candidates.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
                return {
                  otherDoctorId: pid,
                  lastMessage: candidates[0],
                  unreadCount: 0,
                };
              } catch (err) {
                console.warn('[MessagesSection] Error fetching messages for partner:', pid, err);
                return {
                  otherDoctorId: pid,
                  lastMessage: undefined,
                  unreadCount: 0,
                };
              }
            })
          );
          setConversations(summaries);
        } catch (err) {
          console.warn('[MessagesSection] Error processing conversation partners:', err);
          setConversations([]);
        }
      });

      // Subscribe to the active thread
      let unsubThread: (() => void) | undefined;
      if (selectedOtherId) {
        try {
          unsubThread = subscribeToConversation(doctor.id, selectedOtherId, (messages: DoctorMessage[]) => {
            setThreadMessages(messages);
          });
          markConversationAsRead(doctor.id, selectedOtherId).catch(err => {
            console.warn('[MessagesSection] Error marking as read:', err);
          });
          setIsNewChatMode(false);
        } catch (err) {
          console.warn('[MessagesSection] Error subscribing to conversation:', err);
          setThreadMessages([]);
        }
      } else {
        setThreadMessages([]);
      }

      return () => {
        try {
          unsubPartners();
          if (unsubThread) unsubThread();
        } catch (err) {
          // Ignore unsubscribe errors
        }
      };
    } catch (err) {
      console.warn('[MessagesSection] Error in useEffect:', err);
      return () => {};
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
    router.push(`/doctor/dashboard/messages/${id}`);
  };

  const handleSend = async () => {
    if (!selectedOtherId || !composer.trim()) return;
    try {
      await sendMessage(doctor.id, selectedOtherId, composer);
      setComposer('');
    } catch (err) {
      console.warn('[MessagesSection] Error sending message:', err);
      // Keep composer text so user can retry
    }
  };

  const selectedDoctor = selectedOtherId ? doctorsById.get(selectedOtherId) : null;

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col gap-4 overflow-hidden md:flex-row">
      {/* Sidebar - Conversation list */}
      <Card className="flex w-full flex-col overflow-hidden border-gray-200 bg-white md:w-80 lg:w-96">
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
              placeholder={isNewChatMode ? "Search all physicians..." : "Search conversations..."}
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
                  // Displaying all doctors for new chat
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
                  // Displaying existing conversations
                  (filteredItems as ConversationSummary[]).map((c) => {
                    const d = doctorsById.get(c.otherDoctorId);
                    const active = selectedOtherId === c.otherDoctorId;
                    return (
                      <button
                        key={c.otherDoctorId}
                        type="button"
                        onClick={() => openConversation(c.otherDoctorId)}
                        className={cn(
                          'group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200',
                          active
                            ? 'bg-brand-dark-blue text-white shadow-lg'
                            : 'hover:bg-gray-100'
                        )}
                      >
                        <div className={cn(
                          "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold shadow-sm",
                          active ? "bg-white/20" : "bg-brand-dark-blue/10 text-brand-dark-blue"
                        )}>
                          {d?.fullName?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className={cn("truncate font-semibold", active ? "text-white" : "text-gray-900")}>
                              {d?.fullName || 'Unknown'}
                            </span>
                            {c.lastMessage?.sentAt && (
                              <span className={cn("text-[10px] whitespace-nowrap", active ? "text-white/70" : "text-gray-400")}>
                                {new Date(c.lastMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn("truncate text-xs", active ? "text-white/80" : "text-gray-500")}>
                              {c.lastMessage?.senderId === doctor.id ? 'You: ' : ''}
                              {c.lastMessage?.content || d?.specialty}
                            </p>
                            {c.unreadCount > 0 && (
                              <div className={cn(
                                "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold shadow-sm",
                                active ? "bg-white text-brand-dark-blue" : "bg-brand-teal text-white"
                              )}>
                                {c.unreadCount}
                              </div>
                            )}
                          </div>
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
      <Card className="flex flex-1 flex-col overflow-hidden border-gray-200 bg-white">
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
            <CardHeader className="flex flex-row items-center gap-3 border-b bg-white px-6 py-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-dark-blue text-sm font-bold text-white shadow-sm">
                {selectedDoctor?.fullName?.charAt(0) || '?'}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-lg font-bold text-gray-900">
                  {selectedDoctor?.fullName}
                </CardTitle>
                <CardDescription className="truncate text-xs text-brand-teal font-medium">
                  {selectedDoctor?.specialty}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                  <UserRound className="h-5 w-5 text-gray-400" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative flex-1 overflow-y-auto p-0" style={{
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
              backgroundColor: '#f0f2f5'
            }}>
              <div className="flex min-h-full flex-col justify-end p-4 md:p-6">
                {threadMessages.length === 0 ? (
                  <div className="mb-auto flex h-full flex-col items-center justify-center p-12 text-center">
                    <div className="mb-4 rounded-xl bg-white/80 px-4 py-2 text-xs font-medium text-gray-500 shadow-sm backdrop-blur-sm">
                      Messages are end-to-end encrypted for demo purposes.
                    </div>
                    <p className="mt-4 text-sm text-gray-400">No messages yet. Send a greeting!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {threadMessages.map((m, idx) => {
                      const mine = m.senderId === doctor.id;
                      const prev = threadMessages[idx - 1];
                      const showDate = !prev || new Date(prev.sentAt).toDateString() !== new Date(m.sentAt).toDateString();

                      return (
                        <div key={m.id} className="space-y-4">
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <span className="rounded-lg bg-white/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 shadow-sm backdrop-blur-sm">
                                {new Date(m.sentAt).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          )}
                          <div className={cn('flex items-end gap-2', mine ? 'justify-end' : 'justify-start')}>
                            {!mine && (
                              <div className="mb-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-dark-blue/20 text-[10px] font-bold text-brand-dark-blue shadow-sm">
                                {selectedDoctor?.fullName?.charAt(0)}
                              </div>
                            )}
                            <div
                              className={cn(
                                'relative max-w-[85%] px-4 py-2.5 shadow-sm md:max-w-[70%]',
                                mine
                                  ? 'rounded-t-2xl rounded-bl-2xl bg-brand-dark-blue text-white'
                                  : 'rounded-t-2xl rounded-br-2xl bg-white text-gray-900'
                              )}
                            >
                              <div className="whitespace-pre-wrap text-[13px] leading-relaxed">{m.content}</div>
                              <div className={cn(
                                'mt-1 flex items-center justify-end gap-1 text-[9px] font-medium opacity-70',
                                mine ? 'text-white' : 'text-gray-500'
                              )}>
                                {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {mine && (
                                  <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                                    <path d="M10.354 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l3.146-3.147a.5.5 0 0 1 .708 0z" />
                                  </svg>
                                )}
                              </div>
                              {/* Tail */}
                              <div className={cn(
                                "absolute bottom-0 h-4 w-4",
                                mine ? "-right-1 text-brand-dark-blue" : "-left-1 text-white"
                              )}>
                                {/* Simplified tail or just use rounded corners for now */}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={threadEndRef} className="h-2" />
                  </div>
                )}
              </div>
            </CardContent>

            <div className="border-t bg-white p-4">
              <div className="flex items-end gap-3 rounded-2xl bg-gray-50 p-2 shadow-inner focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-dark-blue/10 transition-all duration-200">
                <Textarea
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message..."
                  className="min-h-[44px] max-h-[120px] flex-1 resize-none border-0 bg-transparent py-3 focus-visible:ring-0 text-[14px]"
                />
                <Button
                  onClick={handleSend}
                  disabled={!composer.trim()}
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full bg-brand-dark-blue hover:bg-brand-dark-blue/90 shadow-md transition-transform active:scale-95"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-2 flex items-center justify-between px-2">
                <p className="text-[10px] text-gray-400">
                  Press Enter to send
                </p>
                <p className="text-[10px] font-medium text-brand-teal">
                  Secure connection
                </p>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

