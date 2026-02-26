'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Playfair_Display } from 'next/font/google';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { patientBenefits } from '@/data/patientsPage';
import { cn } from '@/lib/utils';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
});

const benefitCards: Array<{
  id: string;
  title: string;
  description: string;
  accentColor: 'teal' | 'blue';
  number: string;
  image: string;
  imageAlt: string;
  link?: string;
  linkText?: string;
}> = [
  {
    ...patientBenefits[0],
    number: '01',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Doctor and patient in consultation',
    link: '/practices',
    linkText: 'Find a Practice',
  },
  {
    ...patientBenefits[1],
    number: '02',
    image: '/doctor-wear-coat-showing-stethoscope-and-clock-2026-01-08-23-59-41-utc.png',
    imageAlt: 'Physician spending time with patient',
  },
  {
    ...patientBenefits[2],
    number: '03',
    image: '/save-money-on-health-insurance-drug-cost-and-medi-2026-01-08-22-01-27-utc.png',
    imageAlt: 'Affordable healthcare',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function BenefitsJumbledGrid() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  const [prefersReducedMotion, setPreferReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const currentFeatures = benefitCards;

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 900);
      setIsSmallMobile(window.innerWidth < 640);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPreferReducedMotion(mq.matches);
      const handler = () => setPreferReducedMotion(mq.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  useEffect(() => {
    if (!isVisible || isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev === currentFeatures.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [isVisible, isPaused, currentFeatures.length]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? currentFeatures.length - 1 : prev - 1));
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 6000);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === currentFeatures.length - 1 ? 0 : prev + 1));
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 6000);
  };

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 6000);
  };

  const getCardState = (index: number) => {
    const isActive = index === activeIndex;
    const isPrev = index === (activeIndex === 0 ? currentFeatures.length - 1 : activeIndex - 1);
    const isNext = index === (activeIndex === currentFeatures.length - 1 ? 0 : activeIndex + 1);
    if (isActive) return 'active';
    if (isPrev) return 'prev';
    if (isNext) return 'next';
    return 'hidden';
  };

  const getCardTransform = (state: string) => {
    if (isMobile) {
      return state === 'active' ? 'translateX(0) scale(1) rotateY(0deg)' : 'scale(0.8) rotateY(0deg)';
    }
    switch (state) {
      case 'active':
        return 'translateX(0) scale(1) rotateY(0deg)';
      case 'prev':
        return 'translateX(-85%) scale(0.9) rotateY(25deg)';
      case 'next':
        return 'translateX(85%) scale(0.9) rotateY(-25deg)';
      default:
        return 'scale(0.8) rotateY(0deg)';
    }
  };

  const getCardOpacity = (state: string) => {
    if (isMobile) return state === 'active' ? 1 : 0;
    switch (state) {
      case 'active':
        return 1;
      case 'prev':
      case 'next':
        return 0.6;
      default:
        return 0;
    }
  };

  const getCardZIndex = (state: string) => {
    switch (state) {
      case 'active':
        return 3;
      case 'prev':
      case 'next':
        return 2;
      default:
        return 1;
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-28 overflow-hidden bg-white"
    >
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(29, 212, 196, 0.25) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(15, 95, 168, 0.2) 0%, transparent 70%)' }}
      />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        {/* Header – same text design as MissionStatementNewHome */}
        <div
          className="text-center mb-8 md:mb-10"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
            transition: prefersReducedMotion
              ? 'opacity 0.3s ease'
              : 'opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1), transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <span
            className={cn(
              'inline-block px-4 py-1.5 bg-brand-dark-blue/10 text-brand-dark-blue font-black text-base md:text-lg uppercase tracking-[0.2em] rounded-full mb-4 border border-brand-dark-blue/20',
              playfairDisplay.className
            )}
          >
            For patients
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-brand-dark-blue leading-[1.1] tracking-tight">
            Why choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-emerald-600">independent physicians?</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Care that's personal, accessible, and transparent.
          </p>
        </div>

        {/* 3D Carousel – 3 cards */}
        <div className="relative flex flex-col items-center" data-scroll-speed="0">
          <div
            className="relative w-full flex justify-center items-center"
            style={{
              height: isSmallMobile ? '520px' : isMobile ? '560px' : '380px',
              perspective: '1200px',
              perspectiveOrigin: 'center center',
            }}
          >
            {currentFeatures.map((card, index) => {
              const state = getCardState(index);
              const transform = getCardTransform(state);
              const opacity = getCardOpacity(state);
              const zIndex = getCardZIndex(state);
              const pointerEvents = state === 'active' ? 'auto' : 'none';
              const isTeal = card.accentColor === 'teal';

              return (
                <div
                  key={card.id}
                  className={cn(
                    'absolute flex bg-white rounded-xl md:rounded-2xl overflow-hidden transition-all duration-500 border-2',
                    state === 'active' ? 'border-brand-teal/50 shadow-xl' : 'border-transparent shadow-lg',
                    'hover:border-brand-teal/70 hover:shadow-xl',
                    prefersReducedMotion ? '' : 'hover:-translate-y-2',
                    isMobile
                      ? 'flex-col max-w-[500px] w-[92%] h-[520px]'
                      : 'flex-row w-[94%] max-w-[1100px] h-[380px]'
                  )}
                  style={{
                    ...(state === 'active' && {
                      background:
                        'linear-gradient(white, white) padding-box, linear-gradient(135deg, rgba(29, 212, 196, 0.4), rgba(15, 95, 168, 0.3)) border-box',
                    }),
                    transform:
                      prefersReducedMotion && state !== 'active'
                        ? 'none'
                        : `perspective(1200px) ${transform}`,
                    transformStyle: 'preserve-3d',
                    opacity,
                    zIndex,
                    pointerEvents,
                    transition: prefersReducedMotion
                      ? 'opacity 0.3s ease, box-shadow 0.3s ease'
                      : 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow:
                      state === 'active'
                        ? 'var(--shadow-colorful), 0px 20px 60px 0px rgba(0, 0, 0, 0.15), 0px 0px 40px rgba(46, 196, 182, 0.1)'
                        : '0px 4px 12px 0px rgba(0, 0, 0, 0.08)',
                  }}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setTimeout(() => setIsPaused(false), 4000)}
                >
                  {/* Left: text content */}
                  <div
                    className={cn(
                      'flex flex-1 flex-col justify-center overflow-hidden min-w-0',
                      isMobile ? 'p-6 order-2' : 'p-8 lg:p-10 flex-[0.45]'
                    )}
                  >
                    <div
                      className={cn(
                        'inline-flex w-12 h-12 items-center justify-center rounded-xl text-xl font-bold text-white shadow-md mb-4',
                        isTeal ? 'bg-brand-teal' : 'bg-brand-dark-blue'
                      )}
                    >
                      {card.number}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-brand-dark-blue tracking-tight mb-3">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm md:text-base mb-5 max-w-md">
                      {card.description}
                    </p>
                    {card.link && card.linkText ? (
                      <Button
                        asChild
                        className="w-fit rounded-md px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-brand-dark-blue to-brand-teal text-white hover:from-brand-dark-blue/90 hover:to-brand-teal/90 shadow-md hover:shadow-lg transition-all duration-300 focus-ring hover:scale-105"
                      >
                        <Link href={card.link}>
                          {card.linkText}
                          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        className="w-fit rounded-md px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-brand-dark-blue to-brand-teal text-white hover:from-brand-dark-blue/90 hover:to-brand-teal/90 shadow-md hover:shadow-lg transition-all duration-300 focus-ring hover:scale-105"
                      >
                        <Link href="/practices">
                          Find a Practice
                          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                    )}
                  </div>
                  {/* Right: image */}
                  <div
                    className={cn(
                      'relative overflow-hidden bg-gray-100',
                      isMobile ? 'h-[240px] flex-none order-1' : 'flex-1 min-h-0'
                    )}
                  >
                    <Image
                      src={card.image}
                      alt={card.imageAlt}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 900px) 92vw, 55vw"
                      unoptimized
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel controls – fixed-size circle buttons with chevron icons */}
          <div className="flex items-center justify-center gap-6 mt-10 md:mt-12 data-scroll-exclude" data-scroll-speed="0">
            <button
              type="button"
              onClick={handlePrev}
              className="shrink-0 w-12 h-12 min-w-12 min-h-12 rounded-full bg-white border border-gray-200 inline-flex items-center justify-center cursor-pointer transition-all duration-200 focus-ring hover:bg-brand-teal hover:text-white hover:border-brand-teal text-gray-700 hover:scale-105 shadow-sm"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5 shrink-0" aria-hidden />
            </button>
            <div className="flex gap-2.5 shrink-0" role="tablist" aria-label="Benefit carousel">
              {currentFeatures.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDotClick(index)}
                  role="tab"
                  aria-selected={index === activeIndex}
                  aria-label={`Go to benefit ${index + 1}`}
                  className={cn(
                    'w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-200 focus-ring',
                    index === activeIndex
                      ? 'bg-brand-teal scale-125 animate-pulse-subtle'
                      : 'bg-gray-300 hover:bg-gray-400'
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="shrink-0 w-12 h-12 min-w-12 min-h-12 rounded-full bg-white border border-gray-200 inline-flex items-center justify-center cursor-pointer transition-all duration-200 focus-ring hover:bg-brand-teal hover:text-white hover:border-brand-teal text-gray-700 hover:scale-105 shadow-sm"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5 shrink-0" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
