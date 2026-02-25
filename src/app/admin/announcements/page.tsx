'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
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
                    audience_type: 'all_doctors',
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
                    audience_type: 'specialty_doctors',
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
                    audience_type: 'specific_doctors',
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
            <SectionHeader
                title="Announcements Center"
                description="Manage broadcasts and communications with physicians."
            />

            <div className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6 min-h-0 overflow-hidden">
                <div className="glass-card md:col-span-4 flex flex-col min-h-0 h-full overflow-hidden">
                    <div className="pb-4 border-b border-border shrink-0 p-6">
                        <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-2">
                            <Users className="h-5 w-5" style={{ color: 'var(--aip-teal)' }} />
                            Targeting & Directory
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search doctors..."
                                className="pl-9 rounded-lg border border-input"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="px-4 py-4 flex-1 overflow-y-auto">
                        <div className="space-y-4">
                            {/* Targeting Options */}
                            <div className="px-2 space-y-2">
                                <button
                                    onClick={() => setAnnouncementType('broadcast')}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                                        announcementType === 'broadcast'
                                            ? 'text-white shadow-md'
                                            : 'hover:bg-muted text-muted-foreground border border-transparent'
                                    )}
                                    style={announcementType === 'broadcast' ? { background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' } : undefined}
                                >
                                    <Megaphone className={cn("h-5 w-5", announcementType === 'broadcast' ? "text-white" : "")} />
                                    <div className="text-left">
                                        <div className="font-bold text-sm">Broadcast All</div>
                                        <div className={cn("text-[10px]", announcementType === 'broadcast' ? "text-white/80" : "text-muted-foreground")}>Message every doctor</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setAnnouncementType('specialty')}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                                        announcementType === 'specialty'
                                            ? 'text-white shadow-md'
                                            : 'hover:bg-muted text-muted-foreground border border-transparent'
                                    )}
                                    style={announcementType === 'specialty' ? { background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' } : undefined}
                                >
                                    <Users className={cn("h-5 w-5", announcementType === 'specialty' ? "text-white" : "")} />
                                    <div className="text-left">
                                        <div className="font-bold text-sm">By Specialty</div>
                                        <div className={cn("text-[10px]", announcementType === 'specialty' ? "text-white/80" : "text-muted-foreground")}>Target departments</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setAnnouncementType('group')}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                                        announcementType === 'group'
                                            ? 'text-white shadow-md'
                                            : 'hover:bg-muted text-muted-foreground border border-transparent'
                                    )}
                                    style={announcementType === 'group' ? { background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' } : undefined}
                                >
                                    <CheckCircle2 className={cn("h-5 w-5", announcementType === 'group' ? "text-white" : "")} />
                                    <div className="text-left">
                                        <div className="font-bold text-sm">Custom Group</div>
                                        <div className={cn("text-[10px]", announcementType === 'group' ? "text-white/80" : "text-muted-foreground")}>Multi-select doctors</div>
                                    </div>
                                </button>
                            </div>

                            {/* All Doctors Section */}
                            <div className="px-2 pt-2 pb-4">
                                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">
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
                                                        ? 'bg-[var(--aip-teal)]/10 text-[var(--aip-teal)] ring-1 ring-[var(--aip-teal)]/30'
                                                        : 'hover:bg-muted text-foreground'
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                                                    (isSelected && announcementType === 'group') ? "text-white" : "bg-muted text-muted-foreground"
                                                )}
                                                style={(isSelected && announcementType === 'group') ? { background: 'var(--aip-teal)' } : undefined}>
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
                    </div>
                </div>

                <div className="glass-card md:col-span-8 flex flex-col min-h-0 overflow-hidden h-full">
                    <div className="border-b border-border sticky top-0 z-10 p-4 md:p-6 bg-card">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                                <div
                                    className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center text-white shadow-inner shrink-0"
                                    style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }}
                                >
                                    {announcementType === 'broadcast' ? <Megaphone className="h-5 w-5 md:h-6 md:w-6" /> : announcementType === 'specialty' ? <Users className="h-5 w-5 md:h-6 md:w-6" /> : <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />}
                                </div>
                                <div>
                                    <h2 className="text-base md:text-lg font-semibold text-foreground">
                                        {announcementType === 'broadcast' ? "Global Broadcast" : announcementType === 'specialty' ? "Specialty Announcement" : "Group Announcement"}
                                    </h2>
                                    <p className="text-xs md:text-sm text-muted-foreground">
                                        {announcementType === 'broadcast' ? "Sending to all doctors" : announcementType === 'specialty' ? "Targeting specific department" : `Targeting ${selectedDoctorIds.length} selected doctors`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col p-0 overflow-hidden relative">
                        <div className="flex-1 p-4 md:p-8 flex flex-col overflow-y-auto">
                            <div className="max-w-xl w-full mx-auto space-y-6">
                                <div className="p-6 rounded-2xl text-center space-y-4 border border-border bg-muted/30">
                                    <div
                                        className="h-16 w-16 md:h-20 md:w-20 rounded-full flex items-center justify-center mx-auto"
                                        style={{ background: 'rgba(26, 140, 122, 0.15)', color: 'var(--aip-teal)' }}
                                    >
                                        {announcementType === 'broadcast' ? <Megaphone className="h-8 w-8 md:h-10 md:w-10" /> : announcementType === 'specialty' ? <Users className="h-8 w-8 md:h-10 md:w-10" /> : <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10" />}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg md:text-xl font-semibold text-foreground">
                                            {announcementType === 'broadcast' ? "System-Wide Broadcast" : announcementType === 'specialty' ? "Department Targeting" : "Group Message"}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {announcementType === 'broadcast' ? `Delivered to all ${allDoctors.length} physicians.` : announcementType === 'specialty' ? "Select a department to notify." : `Selected ${selectedDoctorIds.length} physicians.`}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {announcementType === 'specialty' && (
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Specialty / Department</Label>
                                            <select
                                                className="w-full h-12 px-4 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none transition-all"
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
                                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Announcement Title</Label>
                                        <Input
                                            value={announcementTitle}
                                            onChange={(e) => setAnnouncementTitle(e.target.value)}
                                            placeholder="Title for the announcement..."
                                            className="rounded-lg h-12 border border-input"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message Content</Label>
                                        <Textarea
                                            placeholder="Type your announcement content here..."
                                            className="min-h-[180px] text-base rounded-lg border border-input focus:ring-2 focus:ring-ring"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button
                                            className="flex-1 py-6 rounded-lg text-white font-bold border-0"
                                            style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }}
                                            disabled={!message.trim() || isSending || (announcementType === 'specialty' && !selectedSpecialty) || (announcementType === 'group' && selectedDoctorIds.length === 0)}
                                            onClick={handleSend}
                                        >
                                            {isSending ? "Sending..." : "Send Announcement"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
