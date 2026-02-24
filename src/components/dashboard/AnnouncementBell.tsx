'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAnnouncements } from '@/lib/api/announcements';
import { getToken } from '@/lib/api/config';

interface AnnouncementBellProps {
    /** Doctor ID (kept for compatibility) */
    doctorId?: string;
    /** Practice ID (kept for compatibility) */
    practiceId?: string;
    /** Href to navigate to when icon is clicked */
    href?: string;
}

export function AnnouncementBell({
    doctorId,
    practiceId,
    href = '/doctor/dashboard/community/announcements',
}: AnnouncementBellProps) {
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);

    const refresh = useCallback(async () => {
        if (!getToken()) {
            setUnreadCount(0);
            return;
        }
        try {
            const list = await getAnnouncements();
            const unread = Array.isArray(list) ? list.filter((a) => a.read !== true).length : 0;
            setUnreadCount(unread);
        } catch {
            setUnreadCount(0);
        }
    }, []);

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 60_000);
        const onFocus = () => refresh();
        window.addEventListener('focus', onFocus);
        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', onFocus);
        };
    }, [refresh]);

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
