'use client';

import { MessagesSectionAPI } from '@/components/dashboard/MessagesSectionAPI';

interface AdminMessagesWrapperProps {
  otherDoctorId?: string;
}

export function AdminMessagesWrapper({ otherDoctorId }: AdminMessagesWrapperProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0F5FA8]">Messages</h2>
        <p className="text-gray-600 mt-2">
          Chat with physicians across the alliance
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <MessagesSectionAPI
          basePath="/admin/messages"
          currentDoctorId={undefined}
        />
      </div>
    </div>
  );
}
