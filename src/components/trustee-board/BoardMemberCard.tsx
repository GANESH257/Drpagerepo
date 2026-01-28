'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail } from 'lucide-react';
import { TrusteeBoardMember } from '@/types';
import { BoardMemberModal } from './BoardMemberModal';

interface BoardMemberCardProps {
  member: TrusteeBoardMember;
}

export function BoardMemberCard({ member }: BoardMemberCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Card
        className="h-full card-vibrant cursor-pointer group"
        onClick={() => setModalOpen(true)}
      >
        <CardContent className="p-6">
          {/* Photo */}
          <div className="mb-4 flex justify-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-brand-teal/20 group-hover:border-brand-teal/40 transition-colors">
              {/* TODO: Replace placeholder.jpg with actual board member photos */}
              <Image
                src={member.photo}
                alt={`${member.name} - ${member.role}`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          {/* Name */}
          <h3 className="text-xl font-bold text-center mb-2 text-brand-dark-blue group-hover:text-brand-teal transition-colors">
            {member.name}
          </h3>

          {/* Role Badge */}
          <div className="flex justify-center mb-3">
            <Badge
              variant={member.role === 'Chair' ? 'gradient' : 'colorful'}
            >
              {member.role}
            </Badge>
          </div>

          {/* Bio (truncated) */}
          <p className="text-sm text-gray-700 text-center mb-4 line-clamp-4 leading-relaxed">
            {member.bio}
          </p>

          {/* Optional Fields */}
          <div className="space-y-2 text-xs text-gray-600 text-center">
            {member.specialty && (
              <p className="font-medium">{member.specialty}</p>
            )}
            {member.location && <p>{member.location}</p>}
            {member.term && <p className="text-gray-500">Term: {member.term}</p>}
          </div>

          {/* Email Link (if available) */}
          {member.email && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <a
                href={`mailto:${member.email}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-2 text-sm text-brand-teal hover:text-brand-dark-blue transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>Contact</span>
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <BoardMemberModal
        member={member}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
