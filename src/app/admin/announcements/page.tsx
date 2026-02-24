'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Users, Megaphone, CheckCircle2 } from 'lucide-react';
import { getAllDoctorsArray } from '@/lib/api/doctors';
import { getToken } from '@/lib/api/config';
import { Doctor } from '@/types';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { createAnnouncement } from '@/lib/api/announcements';

export default function AdminAnnouncementsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
    const [announcementTitle, setAnnouncementTitle] = useState('System Announcement');

    const [announcementType, setAnnouncementType] = useState<'broadcast' | 'specialty' | 'group'>('broadcast');
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
    const [selectedDoctorIds, setSelectedDoctorIds] = useState<string[]>([]);

    // Handle doctorId query parameter - redirect to messages if needed
    useEffect(() => {
        const doctorIdFromQuery = searchParams?.get('doctorId');
        if (doctorIdFromQuery) {
            router.push(`/admin/messages?otherDoctorId=${encodeURIComponent(doctorIdFromQuery)}`);
        }
    }, [searchParams, router]);

    useEffect(() => {
        const token = getToken();
        if (!token) return;
        getAllDoctorsArray(token)
            .then((list) => setAllDoctors(Array.isArray(list) ? list : []))
            .catch((error) => {
                console.error('Error loading doctors:', error);
                setAllDoctors([]);
            });
    }, []);

    const specialties = useMemo(() => {
        const set = new Set<string>();
        allDoctors.forEach(d => {
            if (d.specialty) set.add(d.specialty);
        });
        return Array.from(set).sort();
    }, [allDoctors]);

    const filteredDoctors = useMemo(() => {
        const q = search.toLowerCase();
        return allDoctors.filter(d => {
            const name = (d.fullName ?? (d as any).full_name ?? '').toString().toLowerCase();
            const specialty = (d.specialty ?? (d as any).specialties?.[0] ?? '').toString().toLowerCase();
            return name.includes(q) || specialty.includes(q);
        });
    }, [allDoctors, search]);

    const handleSend = async () => {
        if (!message.trim()) return;

        setIsSending(true);
        try {
            if (announcementType === 'broadcast') {
                await createAnnouncement({
                    title: announcementTitle,
                    body: message,
                    audience_type: 'all',
                });
                toast.success(`Announcement broadcasted to all ${allDoctors.length} doctors`);
                setMessage('');
                setAnnouncementTitle('System Announcement');
            } else if (announcementType === 'specialty') {
                if (!selectedSpecialty) {
                    toast.error('Please select a specialty');
                    return;
                }
                await createAnnouncement({
                    title: announcementTitle,
                    body: message,
                    audience_type: 'specialty',
                    audience_specialty: selectedSpecialty,
                });
                toast.success(`Announcement sent to all ${selectedSpecialty} specialists`);
                setMessage('');
            } else if (announcementType === 'group') {
                if (selectedDoctorIds.length === 0) {
                    toast.error('Please select at least one doctor');
                    return;
                }
                await createAnnouncement({
                    title: announcementTitle,
                    body: message,
                    audience_type: 'specific',
                    doctor_ids: selectedDoctorIds,
                });
                toast.success(`Announcement sent to ${selectedDoctorIds.length} doctors`);
                setMessage('');
                setSelectedDoctorIds([]);
            }
        } catch (error) {
            console.error('Failed to send announcement:', error);
            toast.error('Failed to send');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] flex-col gap-4 md:gap-6">
            <div className="block">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Announcements Center</h1>
                <p className="text-sm md:text-base text-gray-500 mt-1 md:mt-2">Manage broadcasts and communications with physicians.</p>
            </div>

            <div className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6 min-h-0 overflow-hidden">
                {/* Sidebar - Recipients */}
                <Card className="md:col-span-4 shadow-sm border-gray-200 flex flex-col min-h-0 h-full">
                    <CardHeader className="pb-4 border-b shrink-0">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-[#0F5FA8]" />
                            Targeting & Directory
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
                            {/* Targeting Options */}
                            <div className="px-2 space-y-2">
                                <button
                                    onClick={() => setAnnouncementType('broadcast')}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                                        announcementType === 'broadcast'
                                            ? 'bg-[#0F5FA8] text-white shadow-md'
                                            : 'hover:bg-gray-100 text-gray-700 border border-transparent'
                                    )}
                                >
                                    <Megaphone className={cn("h-5 w-5", announcementType === 'broadcast' ? "text-white" : "text-blue-600")} />
                                    <div className="text-left">
                                        <div className="font-bold text-sm">Broadcast All</div>
                                        <div className={cn("text-[10px]", announcementType === 'broadcast' ? "text-blue-100" : "text-gray-500")}>Message every doctor</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setAnnouncementType('specialty')}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                                        announcementType === 'specialty'
                                            ? 'bg-[#0F5FA8] text-white shadow-md'
                                            : 'hover:bg-gray-100 text-gray-700 border border-transparent'
                                    )}
                                >
                                    <Users className={cn("h-5 w-5", announcementType === 'specialty' ? "text-white" : "text-purple-600")} />
                                    <div className="text-left">
                                        <div className="font-bold text-sm">By Specialty</div>
                                        <div className={cn("text-[10px]", announcementType === 'specialty' ? "text-blue-100" : "text-gray-500")}>Target departments</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setAnnouncementType('group')}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                                        announcementType === 'group'
                                            ? 'bg-[#0F5FA8] text-white shadow-md'
                                            : 'hover:bg-gray-100 text-gray-700 border border-transparent'
                                    )}
                                >
                                    <CheckCircle2 className={cn("h-5 w-5", announcementType === 'group' ? "text-white" : "text-green-600")} />
                                    <div className="text-left">
                                        <div className="font-bold text-sm">Custom Group</div>
                                        <div className={cn("text-[10px]", announcementType === 'group' ? "text-blue-100" : "text-gray-500")}>Multi-select doctors</div>
                                    </div>
                                </button>
                            </div>

                            {/* All Doctors Section */}
                            <div className="px-2 pt-2 pb-4">
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                                    {announcementType === 'group' ? `Select Recipients (${selectedDoctorIds.length})` : 'Directory'}
                                </div>
                                <div className="space-y-1">
                                    {filteredDoctors.map((doc) => {
                                        const isSelected = selectedDoctorIds.includes(doc.id);

                                        return (
                                            <button
                                                key={doc.id}
                                                onClick={() => {
                                                    if (announcementType === 'group') {
                                                        setSelectedDoctorIds(prev =>
                                                            prev.includes(doc.id)
                                                                ? prev.filter(id => id !== doc.id)
                                                                : [...prev, doc.id]
                                                        );
                                                    }
                                                }}
                                                className={cn(
                                                    "w-full flex items-center gap-3 p-2 rounded-lg transition-all",
                                                    (isSelected && announcementType === 'group')
                                                        ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                                        : 'hover:bg-gray-50 text-gray-700'
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                                                    (isSelected && announcementType === 'group') ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                                                )}>
                                                    {isSelected && announcementType === 'group' ? <CheckCircle2 className="h-4 w-4" /> : (doc.fullName ?? (doc as any).full_name ?? '?').charAt(0)}
                                                </div>
                                                <div className="text-left overflow-hidden flex-1">
                                                    <div className="font-medium text-sm truncate">{doc.fullName ?? (doc as any).full_name ?? '—'}</div>
                                                    <div className="text-[10px] opacity-50 truncate">{doc.specialty ?? (doc as any).specialties?.[0] ?? '—'}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Broadcast Area */}
                <Card className="md:col-span-8 shadow-sm border-gray-200 flex flex-col min-h-0 bg-gray-50 overflow-hidden h-full">
                    <CardHeader className="bg-white border-b sticky top-0 z-10 p-4 md:p-6">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center text-white shadow-inner shrink-0",
                                    announcementType === 'broadcast' ? "bg-blue-600" : announcementType === 'specialty' ? "bg-purple-600" : "bg-green-600"
                                )}>
                                    {announcementType === 'broadcast' ? <Megaphone className="h-5 w-5 md:h-6 md:w-6" /> : announcementType === 'specialty' ? <Users className="h-5 w-5 md:h-6 md:w-6" /> : <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />}
                                </div>
                                <div>
                                    <CardTitle className="text-lg md:text-xl">
                                        {announcementType === 'broadcast' ? "Global Broadcast" : announcementType === 'specialty' ? "Specialty Announcement" : "Group Announcement"}
                                    </CardTitle>
                                    <CardDescription className="text-xs md:text-sm">
                                        {announcementType === 'broadcast' ? "Sending to all doctors" : announcementType === 'specialty' ? "Targeting specific department" : `Targeting ${selectedDoctorIds.length} selected doctors`}
                                    </CardDescription>
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col p-0 overflow-hidden relative bg-white">
                        <div className="flex-1 bg-white p-4 md:p-8 flex flex-col overflow-y-auto">
                            <div className="max-w-xl w-full mx-auto space-y-6">
                                <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl text-center space-y-4 shadow-sm">
                                    <div className={cn(
                                        "h-16 w-16 md:h-20 md:w-20 rounded-full flex items-center justify-center mx-auto shadow-sm",
                                        announcementType === 'broadcast' ? "bg-blue-100 text-blue-600" : announcementType === 'specialty' ? "bg-purple-100 text-purple-600" : "bg-green-100 text-green-600"
                                    )}>
                                        {announcementType === 'broadcast' ? <Megaphone className="h-8 w-8 md:h-10 md:w-10" /> : announcementType === 'specialty' ? <Users className="h-8 w-8 md:h-10 md:w-10" /> : <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10" />}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                                            {announcementType === 'broadcast' ? "System-Wide Broadcast" : announcementType === 'specialty' ? "Department Targeting" : "Group Message"}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {announcementType === 'broadcast' ? `Delivered to all ${allDoctors.length} physicians.` : announcementType === 'specialty' ? "Select a department to notify." : `Selected ${selectedDoctorIds.length} physicians.`}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {announcementType === 'specialty' && (
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-gray-700">Select Specialty / Department</Label>
                                            <select
                                                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={selectedSpecialty}
                                                onChange={(e) => setSelectedSpecialty(e.target.value)}
                                            >
                                                <option value="">Choose a specialty...</option>
                                                {specialties.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-gray-700">Announcement Title</Label>
                                        <Input
                                            value={announcementTitle}
                                            onChange={(e) => setAnnouncementTitle(e.target.value)}
                                            placeholder="Title for the announcement..."
                                            className="rounded-xl h-12"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-gray-700">Message Content</Label>
                                        <Textarea
                                            placeholder="Type your announcement content here..."
                                            className="min-h-[180px] text-base rounded-xl focus:ring-blue-500"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button
                                            className={cn(
                                                "flex-1 py-6 rounded-xl text-white font-bold",
                                                announcementType === 'broadcast' ? "bg-blue-600 hover:bg-blue-700" : announcementType === 'specialty' ? "bg-purple-600 hover:bg-purple-700" : "bg-green-600 hover:bg-green-700"
                                            )}
                                            disabled={!message.trim() || isSending || (announcementType === 'specialty' && !selectedSpecialty) || (announcementType === 'group' && selectedDoctorIds.length === 0)}
                                            onClick={handleSend}
                                        >
                                            {isSending ? "Sending..." : "Send Announcement"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
