'use client';

import { BoardMemberCard } from './BoardMemberCard';
import { trusteeBoardMembers } from '@/data/trusteeBoardMembers';

export function BoardMemberGrid() {
  return (
    <section id="board" className="py-16 md:py-24 relative bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark-blue">
            Board of Trustees
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Our dedicated board members bring diverse expertise and experience to guide the organization's mission and strategic direction.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {trusteeBoardMembers.map((member) => (
            <BoardMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
