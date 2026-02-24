'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Playfair_Display } from 'next/font/google';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
});

const HERO_TEXT =
  'The Alliance of Independent Physicians was founded in 2025 by a group of local physicians who saw a need for a better way. Tired of the increasing administrative burdens and the loss of autonomy in modern healthcare, they came together to build a network that would give independent practices the collective power to thrive. Today, we are a growing community with 100s of physicians dedicated to that original vision.';

export function AboutHeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mq.matches);
      const handler = () => setPrefersReducedMotion(mq.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const animationStyle = (delay: number) => {
    if (prefersReducedMotion) {
      return { opacity: isVisible ? 1 : 0, transition: 'opacity 0.3s ease' };
    }
    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 1.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    };
  };

  return (
    <section ref={sectionRef} className="pt-32 md:pt-40 pb-12 md:pb-16 relative overflow-hidden">
      {/* Background image – same as Mission */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/network-bg2.jpeg"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>
      {/* Dark blue overlay – same as Mission */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/60 via-brand-dark-blue/55 to-brand-dark-blue/65 z-10" />

      <div className="container mx-auto px-4 md:px-6 relative z-20">
        <div className="max-w-7xl mx-auto">
          {/* Title block – same layout as Mission */}
          <div className="text-center mb-8 md:mb-10" style={animationStyle(0)}>
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <Image
                src="/logodrpnew.png"
                alt="Alliance of Independent Physicians"
                width={180}
                height={180}
                className="h-24 md:h-28 lg:h-32 w-auto object-contain brightness-0 invert drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
                priority
              />
            </div>
            <span
              className={`inline-block px-4 py-1.5 bg-white/20 text-white font-black text-base md:text-lg uppercase tracking-[0.2em] rounded-full mb-4 backdrop-blur-sm ${playfairDisplay.className}`}
            >
              Our Story
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white leading-[1.1] tracking-tight">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-emerald-300">Us</span>
            </h1>
          </div>

          {/* Founding story – same glass card as Mission statement */}
          <div className="max-w-5xl mx-auto">
            <div
              className="p-8 md:p-10 lg:p-12 bg-black/50 backdrop-blur-md rounded-2xl border border-white/30 shadow-[0_25px_50px_rgba(0,0,0,0.4)]"
              style={animationStyle(200)}
            >
              <p className="text-lg md:text-xl lg:text-2xl text-white font-normal leading-relaxed text-center tracking-normal relative">
                <span className="absolute -left-4 md:-left-6 -top-2 md:-top-4 text-6xl md:text-7xl lg:text-8xl text-brand-teal/40 font-serif leading-none" aria-hidden="true">&ldquo;</span>
                <span className="relative z-10">{HERO_TEXT}</span>
                <span className="absolute -right-4 md:-right-6 -bottom-2 md:-bottom-4 text-6xl md:text-7xl lg:text-8xl text-brand-teal/40 font-serif leading-none" aria-hidden="true">&rdquo;</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
