'use client';

import { useEffect, useState } from 'react';
import { MessagesSection } from './MessagesSection';
import { useDoctorContext } from './DoctorContext';
import { Doctor } from '@/types';

const BASE_PATH = '/doctor/dashboard/messages';

interface MessagesSectionWrapperProps {
    /** Optional thread id from URL (?threadId=) - not used by Firebase MessagesSection */
    threadId?: string;
    /** Open conversation with this doctor (?otherDoctorId=) */
    otherDoctorId?: string;
}

export function MessagesSectionWrapper({ threadId, otherDoctorId }: MessagesSectionWrapperProps) {
    const [doctor, setDoctor] = useState<Doctor | null>(null);

    try {
        const context = useDoctorContext();
        useEffect(() => {
            setDoctor(context.doctor);
        }, [context.doctor]);
    } catch {
        // Context not available during static export
    }

    if (!doctor) {
        return (
            <div className="flex h-[calc(100vh-140px)] items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        );
    }

    return (
        <MessagesSection
            doctor={doctor}
            otherDoctorId={otherDoctorId}
            basePath={BASE_PATH}
        />
    );
}
