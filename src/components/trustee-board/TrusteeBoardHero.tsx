'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function TrusteeBoardHero() {
  const handleScroll = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Bg1.jpg"
          alt=""
          fill
          className="object-cover"
          priority
          unoptimized
          aria-hidden="true"
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-white/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-brand-dark-blue">
            Trustee Board
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-700 leading-relaxed">
            Meet our Board of Trustees and stay informed on key announcements, policies, and upcoming meetings.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            <Button
              size="lg"
              variant="gradient"
              className="w-full sm:w-auto"
              onClick={() => handleScroll('board')}
            >
              View Board Members
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => handleScroll('announcements')}
            >
              Latest Announcements
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => handleScroll('meeting')}
            >
              Next Meeting
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
