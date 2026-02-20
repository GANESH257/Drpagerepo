'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { subscribeToAnnouncements } from '@/lib/services/announcementService';

interface AnnouncementBellProps {
    /** Doctor ID to filter announcements for */
    doctorId?: string;
    /** Practice ID to filter announcements for */
    practiceId?: string;
    /** Href to navigate to when icon is clicked */
    href?: string;
}

export function AnnouncementBell({
    doctorId,
    practiceId,
    href = '/doctor/dashboard/announcements',
}: AnnouncementBellProps) {
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!doctorId) return;

        const unsubscribe = subscribeToAnnouncements(doctorId, practiceId, (announcements) => {
            // Count actual unread announcements from persistent storage
            const unread = announcements.filter(a => !a.isRead).length;
            setUnreadCount(unread);
        });

        return () => unsubscribe();
    }, [doctorId, practiceId]);

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(href)}
            aria-label={`Announcements${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            className="relative text-gray-600 hover:text-[#0F5FA8] hover:bg-[#0F5FA8]/10"
        >
            <Megaphone className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0F5FA8] text-[10px] font-bold text-white leading-none min-w-[1rem]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </Button>
    );
}
