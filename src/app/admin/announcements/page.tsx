'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, Send, Users, MessageCircle, Megaphone, CheckCircle2, History, User, ChevronLeft } from 'lucide-react';
import { getAllDoctors } from '@/lib/memberStorage';
import { Doctor, DoctorMessage } from '@/types';
import { sendMessage, subscribeToConversationPartners, subscribeToConversation, markConversationAsRead } from '@/lib/messageStorage';
import { toast } from '@/lib/toast';
import { collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { createAnnouncement, CreateAnnouncementInput } from '@/lib/services/announcementService';
import { getActorFromSession } from '@/lib/services/permissionService';

export default function AdminAnnouncementsPage() {
    const [search, setSearch] = useState('');
    const [selectedDoctorId, setSelectedDoctorId] = useState<string | 'all' | null>(null);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
    const [activePartnerIds, setActivePartnerIds] = useState<string[]>([]);
    const [threadMessages, setThreadMessages] = useState<DoctorMessage[]>([]);
    const [announcementTitle, setAnnouncementTitle] = useState('System Announcement');

    useEffect(() => {
        setAllDoctors(getAllDoctors());

        // Subscribe to anyone who has messaged the admin
        const unsubscribe = subscribeToConversationPartners('admin', (partnerIds) => {
            setActivePartnerIds(partnerIds);
        });

        return () => unsubscribe();
    }, []);

    // Subscribe to active thread
    useEffect(() => {
        if (selectedDoctorId && selectedDoctorId !== 'all') {
            const unsub = subscribeToConversation('admin', selectedDoctorId, (messages) => {
                setThreadMessages(messages);
            });
            markConversationAsRead('admin', selectedDoctorId);
            return () => unsub();
        } else {
            setThreadMessages([]);
        }
    }, [selectedDoctorId]);

    const doctorsById = useMemo(() => {
        const map = new Map<string, Doctor>();
        for (const d of allDoctors) map.set(d.id, d);
        return map;
    }, [allDoctors]);

    const filteredDoctors = useMemo(() => {
        return allDoctors.filter(d =>
            d.fullName.toLowerCase().includes(search.toLowerCase()) ||
            d.specialty.toLowerCase().includes(search.toLowerCase())
        );
    }, [allDoctors, search]);

    const handleSend = async () => {
        if (!message.trim() || !selectedDoctorId) return;

        setIsSending(true);
        try {
            if (selectedDoctorId === 'all') {
                // Send as official announcement
                try {
                    const actor = getActorFromSession();
                    const input: CreateAnnouncementInput = {
                        audience: { kind: 'all_doctors' },
                        title: announcementTitle,
                        message: message,
                    };
                    await createAnnouncement(actor, input);
                    toast.success(`Announcement broadcasted to all ${allDoctors.length} doctors`);
                    setMessage('');
                    setAnnouncementTitle('System Announcement');
                    setSelectedDoctorId(null);
                } catch (err) {
                    console.error('Failed to broadcast announcement:', err);
                    toast.error('Failed to broadcast announcement');
                }
            } else {
                // Send to specific doctor
                await sendMessage('admin', selectedDoctorId, message);
                toast.success('Message sent');
                setMessage('');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const selectedDoctor = selectedDoctorId === 'all'
        ? { fullName: 'All Doctors', specialty: 'Broadcast Announcement' }
        : selectedDoctorId ? doctorsById.get(selectedDoctorId) : null;

    return (
        <div className="flex h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] flex-col gap-4 md:gap-6">
            <div className={cn(selectedDoctorId ? "hidden md:block" : "block")}>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Announcements Center</h1>
                <p className="text-sm md:text-base text-gray-500 mt-1 md:mt-2">Manage broadcasts and communications with physicians.</p>
            </div>

            <div className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6 min-h-0 overflow-hidden">
                {/* Sidebar - Recipients & Threads */}
                <Card className={cn(
                    "md:col-span-4 shadow-sm border-gray-200 flex flex-col min-h-0",
                    selectedDoctorId ? "hidden md:flex" : "flex h-full"
                )}>
                    <CardHeader className="pb-4 border-b shrink-0">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-[#0F5FA8]" />
                            Directory & Conversations
                        </CardTitle>
                        <div className="relative mt-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search doctors..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="px-2 py-4 flex-1 overflow-y-auto">
                        <div className="space-y-4">
                            {/* Broadcast Option */}
                            <div className="px-2">
                                <button
                                    onClick={() => setSelectedDoctorId('all')}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                                        selectedDoctorId === 'all'
                                            ? 'bg-[#0F5FA8] text-white shadow-md'
                                            : 'hover:bg-gray-100 text-gray-700 border border-transparent'
                                    )}
                                >
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center",
                                        selectedDoctorId === 'all' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
                                    )}>
                                        <Megaphone className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold">Broadcast Announcement</div>
                                        <div className={cn("text-xs", selectedDoctorId === 'all' ? "text-blue-100" : "text-gray-500")}>Send to all physicians</div>
                                    </div>
                                </button>
                            </div>

                            {/* Active Conversations Section */}
                            {activePartnerIds.length > 0 && (
                                <div className="px-2 pt-2">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Recent Replies</div>
                                    {activePartnerIds.map(pid => {
                                        const doc = doctorsById.get(pid);
                                        if (!doc) return null;
                                        return (
                                            <button
                                                key={pid}
                                                onClick={() => setSelectedDoctorId(pid)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 p-2 rounded-lg transition-all mb-1",
                                                    selectedDoctorId === pid
                                                        ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                                        : 'hover:bg-gray-50 text-gray-700'
                                                )}
                                            >
                                                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                                    {doc.fullName.charAt(0)}
                                                </div>
                                                <div className="text-left overflow-hidden">
                                                    <div className="font-semibold text-sm truncate">{doc.fullName}</div>
                                                    <div className="text-[10px] opacity-70 truncate">{doc.specialty}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* All Doctors Section */}
                            <div className="px-2 pt-2">
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Directory</div>
                                <div className="space-y-1">
                                    {filteredDoctors.map((doc) => (
                                        <button
                                            key={doc.id}
                                            onClick={() => setSelectedDoctorId(doc.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-2 rounded-lg transition-all",
                                                selectedDoctorId === doc.id
                                                    ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                                    : 'hover:bg-gray-50 text-gray-700'
                                            )}
                                        >
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs shrink-0">
                                                {doc.fullName.charAt(0)}
                                            </div>
                                            <div className="text-left overflow-hidden">
                                                <div className="font-medium text-sm truncate">{doc.fullName}</div>
                                                <div className="text-[10px] opacity-50 truncate">{doc.specialty}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Message / Broadcast Area */}
                <Card className={cn(
                    "md:col-span-8 shadow-sm border-gray-200 flex flex-col min-h-0 bg-gray-50 overflow-hidden",
                    selectedDoctorId ? "flex h-full" : "hidden md:flex"
                )}>
                    <CardHeader className="bg-white border-b sticky top-0 z-10 p-4 md:p-6">
                        {selectedDoctor ? (
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <button
                                        onClick={() => setSelectedDoctorId(null)}
                                        className="md:hidden p-1 -ml-1 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <ChevronLeft className="h-6 w-6 text-gray-600" />
                                    </button>
                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#0F5FA8] flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-inner shrink-0">
                                        {selectedDoctorId === 'all' ? <Megaphone className="h-5 w-5 md:h-6 md:w-6" /> : selectedDoctor.fullName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <CardTitle className="text-lg md:text-xl truncate">{selectedDoctor.fullName}</CardTitle>
                                        <CardDescription className="text-xs md:text-sm truncate">{selectedDoctor.specialty}</CardDescription>
                                    </div>
                                </div>
                                {selectedDoctorId === 'all' && (
                                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px] md:text-xs">Global Broadcast</Badge>
                                )}
                            </div>
                        ) : (
                            <div className="py-4 text-center text-gray-400">
                                <p>Select a recipient or broadcast option</p>
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col p-0 overflow-hidden relative">
                        {!selectedDoctorId ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white">
                                <div className="bg-gray-50 p-6 rounded-full mb-4">
                                    <MessageCircle className="h-12 w-12 opacity-20" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Communication Center</h3>
                                <p className="max-w-xs mx-auto mt-1 px-4 text-center">Select a physician from the directory or use the broadcast tool.</p>
                            </div>
                        ) : selectedDoctorId === 'all' ? (
                            <div className="flex-1 bg-white p-4 md:p-8 flex flex-col items-center justify-center overflow-y-auto">
                                <div className="max-w-md w-full bg-white rounded-2xl md:border p-4 md:p-8 md:shadow-xl text-center space-y-4 md:space-y-6">
                                    <div className="h-16 w-16 md:h-20 md:w-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto">
                                        <Megaphone className="h-8 w-8 md:h-10 md:w-10" />
                                    </div>
                                    <div className="space-y-1 md:space-y-2">
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-900">Broadcast Announcement</h3>
                                        <p className="text-xs md:text-sm text-gray-500">Delivered to all {allDoctors.length} physicians in the network.</p>
                                    </div>

                                    <div className="text-left space-y-2">
                                        <Label className="text-sm font-bold text-gray-700">Title</Label>
                                        <Input
                                            value={announcementTitle}
                                            onChange={(e) => setAnnouncementTitle(e.target.value)}
                                            placeholder="Announcement title..."
                                            className="rounded-xl h-10 md:h-12"
                                        />
                                    </div>

                                    <div className="text-left space-y-2">
                                        <Label className="text-sm font-bold text-gray-700">Content</Label>
                                        <Textarea
                                            placeholder="Type your global announcement here..."
                                            className="min-h-[150px] md:min-h-[200px] text-base md:text-lg rounded-xl focus:ring-orange-500"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex gap-3 md:gap-4 pt-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1 py-4 md:py-6 rounded-xl h-auto"
                                            onClick={() => setSelectedDoctorId(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="flex-1 py-4 md:py-6 rounded-xl bg-orange-600 hover:bg-orange-700 h-auto"
                                            disabled={!message.trim() || isSending}
                                            onClick={handleSend}
                                        >
                                            {isSending ? "Broadcasting..." : "Broadcast Now"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Chat Thread for specific doctor */
                            <div className="flex-1 flex flex-col min-h-0 bg-white">
                                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50/50">
                                    {threadMessages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                                            <History className="h-10 w-10 md:h-12 md:w-12 mb-2" />
                                            <p className="text-sm">Starting conversation thread...</p>
                                        </div>
                                    ) : (
                                        threadMessages.map((m, i) => {
                                            const isAdmin = m.senderId === 'admin';
                                            return (
                                                <div key={m.id} className={cn("flex", isAdmin ? "justify-end" : "justify-start")}>
                                                    <div className={cn(
                                                        "max-w-[85%] md:max-w-[75%] rounded-2xl p-3 md:p-4 shadow-sm",
                                                        isAdmin ? "bg-[#0F5FA8] text-white" : "bg-white border text-gray-800"
                                                    )}>
                                                        <p className="text-sm md:text-base leading-relaxed">{m.content}</p>
                                                        <p className={cn("text-[9px] md:text-[10px] mt-1 opacity-50 text-right", isAdmin ? "text-blue-100" : "text-gray-400")}>
                                                            {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div className="p-3 md:p-4 border-t bg-white shrink-0">
                                    <div className="flex gap-2 md:gap-3 items-end">
                                        <Textarea
                                            placeholder="Type a reply..."
                                            className="resize-none min-h-[44px] max-h-[120px] flex-1 bg-gray-50 border-0 focus:ring-1 focus:ring-blue-100 rounded-xl"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={1}
                                            onInput={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.height = 'auto';
                                                target.style.height = `${target.scrollHeight}px`;
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSend();
                                                }
                                            }}
                                        />
                                        <Button
                                            className="bg-[#0F5FA8] h-11 w-11 md:h-12 md:w-auto md:px-6 rounded-xl shrink-0"
                                            disabled={!message.trim() || isSending}
                                            onClick={handleSend}
                                        >
                                            <Send className="h-4 w-4 md:mr-0" />
                                            <span className="hidden md:ml-2 md:inline">Send</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
