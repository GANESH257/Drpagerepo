'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function StudentsHero() {
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
          src="/bg3.jpg"
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
            Your Journey to Becoming{' '}
            <span className="text-brand-teal">a Physician</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-700 leading-relaxed">
            Comprehensive resources for medical students: prep, exams, finance, research, and residency guidance from experienced physicians.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            <Button
              size="lg"
              variant="gradient"
              className="w-full sm:w-auto"
              onClick={() => handleScroll('main-tracks')}
            >
              Explore Resources
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => handleScroll('quick-tools')}
            >
              Quick Tools
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => handleScroll('articles')}
            >
              Helpful Articles
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
