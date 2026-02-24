'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { subscribeToTotalUnreadCount } from '@/lib/messageStorage';

interface MessageBellProps {
    /** Doctor ID — required to subscribe to the correct Firestore unread count */
    userId?: string;
    /** Href to navigate to when icon is clicked */
    href?: string;
}

export function MessageBell({
    userId,
    href = '/doctor/dashboard/messages',
}: MessageBellProps) {
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!userId) return;
        // Real-time Firestore subscription — updates instantly when new messages arrive
        const unsubscribe = subscribeToTotalUnreadCount(userId, (count) => {
            setUnreadCount(count);
        });
        return unsubscribe;
    }, [userId]);

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(href)}
            aria-label={`Messages${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            className="relative text-gray-600 hover:text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/10 rounded-xl"
        >
            <MessageCircle className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none min-w-[1rem]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </Button>
    );
}
