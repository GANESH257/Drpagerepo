'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getNotifications } from '@/lib/storage/notificationStorage';

interface NotificationBellProps {
    /** Doctor ID whose notifications should be counted */
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

    const refresh = useCallback(() => {
        if (!doctorId) return;
        const notifications = getNotifications(doctorId);
        const unread = notifications.filter((n) => !n.readAt).length;
        setUnreadCount(unread);
    }, [doctorId]);

    useEffect(() => {
        refresh();

        // Re-check every 30 seconds (notifications can be added in other tabs)
        const interval = setInterval(refresh, 30_000);

        // Also respond to localStorage changes (cross-tab)
        const handleStorage = () => refresh();
        window.addEventListener('storage', handleStorage);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleStorage);
        };
    }, [refresh]);

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(href)}
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            className="relative text-gray-600 hover:text-[#0F5FA8] hover:bg-[#0F5FA8]/10"
        >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none min-w-[1rem]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </Button>
    );
}
