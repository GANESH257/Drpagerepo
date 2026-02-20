'use client';

import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useDoctorSession } from '@/lib/useDoctorSession';
import { getAdminSession } from '@/lib/adminSession';
import { subscribeToTotalUnreadCount } from '@/lib/messageStorage';

export function FloatingMessageIcon() {
    const { getSession } = useDoctorSession();
    const [unreadCount, setUnreadCount] = useState(0);
    const [href, setHref] = useState('/doctor/dashboard/messages');

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        try {
            // Check admin session first
            const adminSession = getAdminSession();
            if (adminSession) {
                setHref('/admin/announcements');
                setIsVisible(true);
                try {
                    const unsubscribe = subscribeToTotalUnreadCount('admin', (count) => {
                        setUnreadCount(count);
                    });
                    return () => {
                        try {
                            unsubscribe();
                        } catch (err) {
                            // Ignore unsubscribe errors
                        }
                    };
                } catch (err) {
                    console.warn('[FloatingMessageIcon] Failed to subscribe to unread count:', err);
                    setUnreadCount(0);
                }
                return;
            }

            // Fallback to doctor session
            const session = getSession();
            if (session?.doctorId) {
                setHref('/doctor/dashboard/messages');
                setIsVisible(true);
                try {
                    const unsubscribe = subscribeToTotalUnreadCount(session.doctorId, (count) => {
                        setUnreadCount(count);
                    });
                    return () => {
                        try {
                            unsubscribe();
                        } catch (err) {
                            // Ignore unsubscribe errors
                        }
                    };
                } catch (err) {
                    console.warn('[FloatingMessageIcon] Failed to subscribe to unread count:', err);
                    setUnreadCount(0);
                }
                return;
            }

            setIsVisible(false);
        } catch (err) {
            console.warn('[FloatingMessageIcon] Error in useEffect:', err);
            setIsVisible(false);
        }
    }, [getSession]);

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
