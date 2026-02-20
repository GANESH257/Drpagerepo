'use client';

import { useMemo } from 'react';
import { MessagesSection } from '@/components/dashboard/MessagesSection';
import { Doctor } from '@/types';

interface AdminMessagesWrapperProps {
    otherDoctorId?: string;
}

export function AdminMessagesWrapper({ otherDoctorId }: AdminMessagesWrapperProps) {
    // Mock doctor object for admin
    const adminAsDoctor = useMemo<Doctor>(() => ({
        id: 'admin',
        fullName: 'Alliance Admin',
        email: 'admin@alliance.com',
        specialty: 'System Administrator',
        practiceId: 'alliance-hq',
        phone: '555-0100',
        bio: 'System Administrator for the physician alliance.',
        hospitalPrivileges: [],
        boardCertifications: ['Alliance Administration'],
        statesLicensedIn: ['HQ'],
        acceptsNewPatients: false,
        locations: [],
        insurance: [],
        rating: 5,
        reviewCount: 0,
        reviews: [],
        featured: false,
        verified: true,
        availability: [],
        roleInPractice: 'doctor',
        slug: 'alliance-admin',
        firstName: 'Alliance',
        lastName: 'Admin',
        credentials: 'HQ',
        about: 'System Administrator for the physician alliance.',
    }), []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-[#0F5FA8]">Messages</h2>
                <p className="text-gray-600 mt-2">
                    Chat with physicians across the alliance
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <MessagesSection
                    doctor={adminAsDoctor}
                    otherDoctorId={otherDoctorId}
                    basePath="/admin/messages"
                />
            </div>
        </div>
    );
}
