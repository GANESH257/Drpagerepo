'use client';

import Image from 'next/image';
import { Playfair_Display } from 'next/font/google';
import { BoardMemberCard } from './BoardMemberCard';
import { trusteeBoardMembers } from '@/data/trusteeBoardMembers';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
});

export function BoardMemberGrid() {
  return (
    <section id="board" className="py-16 md:py-24 relative overflow-hidden">
      {/* Neurons / network background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/network-bg2.jpeg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      {/* Dark overlay – same as About hero for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/60 via-brand-dark-blue/55 to-brand-dark-blue/65 z-10" aria-hidden />

      <div className="container mx-auto px-4 relative z-20">
        {/* Section Header – same style as Mission (pill + title with gradient) */}
        <div className="text-center mb-12 md:mb-14">
          <span
            className={`inline-block px-4 py-1.5 bg-white/20 text-white font-black text-base md:text-lg uppercase tracking-[0.2em] rounded-full mb-4 backdrop-blur-sm ${playfairDisplay.className}`}
          >
            Our Board
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white leading-[1.1] tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-emerald-300">Leadership</span>
          </h2>
          <p className="text-lg text-white/90 max-w-4xl mx-auto">
            Our organization is led by experienced physicians dedicated to supporting independent practice.
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
