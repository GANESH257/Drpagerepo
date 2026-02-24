'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getNotifications as getNotificationsAPI } from '@/lib/api/notifications';
import { getToken } from '@/lib/api/config';

interface NotificationBellProps {
    /** Doctor ID (kept for API compatibility; count is for authenticated user) */
    doctorId?: string;
    /** Href to navigate to when bell is clicked */
    href?: string;
}

export function NotificationBell({
    doctorId,
    href = '/doctor/dashboard/notifications',
}: NotificationBellProps) {
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);

    const refresh = useCallback(async () => {
        if (!getToken()) {
            setUnreadCount(0);
            return;
        }
        try {
            const list = await getNotificationsAPI(true);
            setUnreadCount(Array.isArray(list) ? list.length : 0);
        } catch {
            setUnreadCount(0);
        }
    }, []);

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 30_000);
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
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            className="relative text-gray-600 hover:text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/10 rounded-xl"
        >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span
                    className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[var(--aip-teal)] ring-2 ring-white"
                    aria-hidden
                />
            )}
        </Button>
    );
}
