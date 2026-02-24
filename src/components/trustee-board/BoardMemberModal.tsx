'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { TrusteeBoardMember } from '@/types';
import { cn } from '@/lib/utils';

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
  const isChair = member.role === 'Chair';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[560px] p-0 gap-0 rounded-2xl overflow-hidden border-0 shadow-2xl bg-white"
        data-scroll-exclude
      >
        {/* Header: photo + name/role – side-by-side to use space both sides of image */}
        <div className="relative pt-10 pb-8 px-6 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="relative w-40 h-40 shrink-0 rounded-2xl overflow-hidden shadow-md ml-4 sm:ml-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={member.photo}
                alt=""
                width={160}
                height={160}
                className="h-full w-full object-cover"
                style={{ filter: 'none', display: 'block' }}
              />
            </div>
            <DialogHeader className="space-y-2 p-0 flex-1 flex flex-col justify-center items-center text-center min-w-0">
              <DialogTitle className="text-2xl font-bold text-brand-dark-blue pr-8">
                {member.name}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Board member details
              </DialogDescription>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span
                  className={cn(
                    'inline-block w-fit px-3 py-1 rounded-full text-sm font-semibold',
                    isChair
                      ? 'bg-brand-teal text-white'
                      : 'bg-brand-dark-blue/15 text-brand-dark-blue border border-brand-dark-blue/20'
                  )}
                >
                  {member.role}
                </span>
                {member.specialty && (
                  <span className="inline-block w-fit rounded-md border border-brand-dark-blue/25 bg-brand-dark-blue/5 px-3 py-1 text-xs font-semibold text-brand-dark-blue">
                    {member.specialty}
                  </span>
                )}
              </div>
            </DialogHeader>
          </div>
        </div>

        {/* Body: bio + details */}
        <div className="px-6 pb-6">
          <div className="space-y-5">
            <div className="rounded-xl border border-brand-teal/20 bg-gradient-to-br from-white via-gray-50/80 to-brand-teal/10 px-5 py-4 text-center shadow-lg shadow-black/5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark-blue mb-3">
                Biography
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm max-h-32 overflow-y-auto">
                {member.bio}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200/80">
              {member.location && (
                <div className="rounded-xl border border-brand-dark-blue/15 bg-gradient-to-br from-white to-brand-dark-blue/5 px-4 py-3.5 text-center shadow-md shadow-black/5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-dark-blue mb-1">
                    Location
                  </p>
                  <p className="text-gray-900 text-sm font-medium">{member.location}</p>
                </div>
              )}
              {member.term && (
                <div className="rounded-xl border border-brand-teal/20 bg-gradient-to-br from-white to-brand-teal/5 px-4 py-3.5 text-center shadow-md shadow-black/5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-dark-blue mb-1">
                    Term
                  </p>
                  <p className="text-gray-900 text-sm font-medium">{member.term}</p>
                </div>
              )}
            </div>

            {member.email && (
              <div className="flex justify-center mt-2">
                <Button
                  asChild
                  size="lg"
                  className="h-12 py-3 px-6 text-base font-semibold bg-gradient-to-r from-brand-dark-blue to-brand-teal text-white hover:from-brand-dark-blue/90 hover:to-brand-teal/90 shadow-lg hover:shadow-xl transition-all duration-300 focus-ring hover:scale-105 rounded-xl"
                >
                  <a href={`mailto:${member.email}`} className="inline-flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4 shrink-0" aria-hidden />
                    Contact {member.name.split(' ')[0]}
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
