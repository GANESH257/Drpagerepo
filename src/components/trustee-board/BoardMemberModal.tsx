'use client';

import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Mail } from 'lucide-react';
import { TrusteeBoardMember } from '@/types';

interface BoardMemberModalProps {
  member: TrusteeBoardMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BoardMemberModal({
  member,
  open,
  onOpenChange,
}: BoardMemberModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{member.name}</DialogTitle>
          <DialogDescription>
            <Badge
              variant={member.role === 'Chair' ? 'default' : 'secondary'}
              className={
                member.role === 'Chair'
                  ? 'bg-brand-teal text-white mt-2'
                  : 'bg-brand-dark-blue/10 text-brand-dark-blue mt-2'
              }
            >
              {member.role}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Photo */}
          <div className="flex justify-center">
            <div className="relative w-40 h-40 rounded-full overflow-hidden bg-gray-200 border-4 border-brand-teal/20">
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

          {/* Bio */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-brand-dark-blue">
              Biography
            </h3>
            <p className="text-gray-700 leading-relaxed">{member.bio}</p>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            {member.specialty && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Specialty
                </p>
                <p className="text-gray-900">{member.specialty}</p>
              </div>
            )}
            {member.location && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Location
                </p>
                <p className="text-gray-900">{member.location}</p>
              </div>
            )}
            {member.term && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Term
                </p>
                <p className="text-gray-900">{member.term}</p>
              </div>
            )}
            {member.email && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Contact
                </p>
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center gap-2 text-brand-teal hover:text-brand-dark-blue transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>{member.email}</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
