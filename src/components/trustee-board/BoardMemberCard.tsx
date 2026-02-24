'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

          {/* Optional Fields – specialty in a box (distinct from role badge) */}
          <div className="space-y-2 text-xs text-gray-600 text-center">
            {member.specialty && (
              <div className="flex justify-center">
                <span className="inline-flex items-center rounded-md border border-brand-dark-blue/25 bg-brand-dark-blue/5 px-3 py-1.5 text-xs font-semibold text-brand-dark-blue">
                  {member.specialty}
                </span>
              </div>
            )}
            {member.location && <p>{member.location}</p>}
            {member.term && <p className="text-gray-500">Term: {member.term}</p>}
          </div>

          {/* Contact button – gradient CTA style */}
          {member.email && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center" onClick={(e) => e.stopPropagation()}>
              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-brand-dark-blue to-brand-teal text-white hover:from-brand-dark-blue/90 hover:to-brand-teal/90 shadow-lg hover:shadow-xl transition-all duration-300 focus-ring hover:scale-105 [&_span]:text-white [&_svg]:text-white"
              >
                <a href={`mailto:${member.email}`} className="inline-flex items-center justify-center gap-2 text-white font-semibold [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]">
                  <Mail className="h-4 w-4 shrink-0 text-white" aria-hidden />
                  <span className="text-white">Contact</span>
                </a>
              </Button>
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
