'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useDoctorSession } from '@/lib/useDoctorSession';
import { getAdminSession } from '@/lib/adminSession';
import { getUnreadCount } from '@/lib/api/messages';

const POLL_INTERVAL_MS = 30_000;

export function FloatingMessageIcon() {
    const { getSession } = useDoctorSession();
    const [unreadCount, setUnreadCount] = useState(0);
    const [href, setHref] = useState('/doctor/dashboard/messages');
    const [isVisible, setIsVisible] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchUnread = useCallback(async () => {
        try {
            const count = await getUnreadCount();
            setUnreadCount(count);
        } catch {
            setUnreadCount(0);
        }
    }, []);

    useEffect(() => {
        try {
            const adminSession = getAdminSession();
            if (adminSession) {
                setHref('/admin/messages');
                setIsVisible(true);
                fetchUnread();
                intervalRef.current = setInterval(fetchUnread, POLL_INTERVAL_MS);
                return () => {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                };
            }

            const session = getSession();
            if (session?.doctorId) {
                setHref('/doctor/dashboard/messages');
                setIsVisible(true);
                fetchUnread();
                intervalRef.current = setInterval(fetchUnread, POLL_INTERVAL_MS);
                return () => {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                };
            }

            setIsVisible(false);
        } catch (err) {
            console.warn('[FloatingMessageIcon] Error in useEffect:', err);
            setIsVisible(false);
        }
    }, [getSession, fetchUnread]);

    // Refresh unread when window gains focus (e.g. returning from messages)
    useEffect(() => {
        const onFocus = () => { if (isVisible) fetchUnread(); };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [isVisible, fetchUnread]);

    if (!isVisible) return null;

    return (
        <div
            className="fixed bottom-48 right-4 z-[100] md:bottom-56 md:right-8 pointer-events-auto"
            style={{
                opacity: 1,
                transform: 'translateY(0) scale(1)',
                visibility: 'visible',
            }}
        >
            <Link
                href={href}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-dark-blue text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-brand-dark-blue/90 focus-ring md:h-14 md:w-14"
                aria-label="Messages"
            >
                <MessageSquare className="h-6 w-6 md:h-7 md:w-7" />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-teal text-[10px] font-bold text-white shadow-sm md:h-5 md:w-5 md:text-[11px]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Link>
        </div>
    );
}
