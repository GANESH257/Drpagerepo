'use client';

import { useEffect, useState } from 'react';
import { MessagesSection } from './MessagesSection';
import { useDoctorContext } from './DoctorContext';
import { Doctor } from '@/types';

interface MessagesSectionWrapperProps {
    otherDoctorId?: string;
}

export function MessagesSectionWrapper({ otherDoctorId }: MessagesSectionWrapperProps) {
    const [doctor, setDoctor] = useState<Doctor | null>(null);

    try {
        const context = useDoctorContext();
        useEffect(() => {
            setDoctor(context.doctor);
        }, [context.doctor]);
    } catch {
        // Context not available during static export
    }

    if (!doctor) return (
        <div className="flex h-[calc(100vh-140px)] items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading conversation...</div>
        </div>
    );

    return <MessagesSection doctor={doctor} otherDoctorId={otherDoctorId} />;
}
