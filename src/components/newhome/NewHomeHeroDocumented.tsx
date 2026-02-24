'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { homeStats } from '@/data/homeStats';

interface NewHomeHeroDocumentedProps {
  subheadline?: string;
  videoSource?: string;
  darkOverlay?: boolean; // If true, use darker/blacker overlay instead of blue
}

export function NewHomeHeroDocumented({ subheadline, videoSource = '/bg.mp4', darkOverlay = false }: NewHomeHeroDocumentedProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [animatedStats, setAnimatedStats] = useState<Record<number, number>>({});
  const videoWrapRef = useRef<HTMLDivElement>(null);

  // 3D mouse-follow tilt (smooth spring)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(mouseY, { stiffness: 80, damping: 20 });
  const rotateY = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (prefersReducedMotion) return;
      const el = videoWrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const normX = (e.clientX - centerX) / (rect.width / 2);
      const normY = (e.clientY - centerY) / (rect.height / 2);
      mouseX.set(Math.max(-1, Math.min(1, normX)) * 8);
      mouseY.set(Math.max(-1, Math.min(1, normY)) * -6);
    },
    [mouseX, mouseY, prefersReducedMotion]
  );
  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      setIsVisible(true);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Animate stats counter
  useEffect(() => {
    if (!isVisible) return;

    const timers: NodeJS.Timeout[] = [];

    if (!prefersReducedMotion) {
      homeStats.forEach((stat, index) => {
        const numericValue = parseInt(stat.value.replace(/\D/g, '')) || 0;
        if (numericValue > 0) {
          const duration = 2000;
          const steps = 60;
          const increment = numericValue / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
              setAnimatedStats(prev => ({ ...prev, [index]: numericValue }));
              clearInterval(timer);
            } else {
              setAnimatedStats(prev => ({ ...prev, [index]: Math.floor(current) }));
            }
          }, duration / steps);
          timers.push(timer);
        } else {
          // For non-numeric values like "Verified", set immediately
          setAnimatedStats(prev => ({ ...prev, [index]: 0 }));
        }
      });
    } else {
      // Set final values immediately if reduced motion
      const finalStats: Record<number, number> = {};
      homeStats.forEach((stat, index) => {
        const numericValue = parseInt(stat.value.replace(/\D/g, '')) || 0;
        finalStats[index] = numericValue;
      });
      setAnimatedStats(finalStats);
    }

    return () => {
      timers.forEach(timer => clearInterval(timer));
    };
  }, [isVisible, prefersReducedMotion]);

  return (
    <section
      id="main-content"
      className="relative w-full min-h-[570px] md:min-h-[670px] overflow-hidden mt-32 md:mt-28 bg-black"
      aria-label="Hero section"
    >
      {/* Full Background Video with 3D tilt – exclude from scroll/transition so effect isn’t broken */}
      <div
        ref={videoWrapRef}
        className="absolute top-0 left-0 right-0 bottom-0 z-0 w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: '1200px' }}
        data-scroll-exclude
        data-scroll-speed="0"
      >
        <motion.div
          className="absolute inset-0"
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
        >
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1s ease-out 0.3s',
          }}
          onError={(e) => {
            console.error('Video failed to load:', videoSource, e);
          }}
          onLoadedData={() => {
            console.log('Video loaded successfully:', videoSource);
          }}
        >
          <source src={videoSource} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Overlay - Dark/Black for dark mode, Blue for regular */}
        <div 
          className={`absolute inset-0 z-[1] ${
            darkOverlay 
              ? 'bg-gradient-to-br from-black/70 via-black/65 to-black/75' 
              : 'bg-gradient-to-br from-brand-dark-blue/60 via-brand-dark-blue/55 to-brand-dark-blue/65'
          }`}
        />
        </motion.div>
      </div>

      {/* Container with flex layout */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 relative z-10">
        <div className="flex flex-col items-start min-h-[570px] md:min-h-[670px] py-12 md:py-16 lg:py-20">
          {/* Content Area - 40% width with staggered 3D entrance */}
          <motion.div
            className="w-full lg:w-[40%] flex flex-col h-full"
            initial={false}
            animate={isVisible ? 'visible' : 'hidden'}
            variants={{
              visible: {
                transition: {
                  staggerChildren: prefersReducedMotion ? 0 : 0.12,
                  delayChildren: prefersReducedMotion ? 0 : 0.15,
                },
              },
              hidden: {},
            }}
          >
            {/* Heading - Top */}
            <motion.div
              className="mb-8 md:mb-12"
              variants={{
                visible: {
                  opacity: 1,
                  x: 0,
                  rotateY: 0,
                  filter: 'blur(0px)',
                  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                },
                hidden: {
                  opacity: 0,
                  x: -32,
                  rotateY: -12,
                  filter: 'blur(8px)',
                },
              }}
            >
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] text-white tracking-tight" style={{ transformStyle: 'preserve-3d' }}>
                <span className="whitespace-nowrap">United in Care</span>
                <br />
                <span className="whitespace-normal sm:whitespace-nowrap"><span className="text-brand-teal">Dedicated to You</span></span>
              </h1>
            </motion.div>

            {/* Subtitle - Middle */}
            {subheadline && (
              <motion.div
                className="my-auto py-8 md:py-12"
                variants={{
                  visible: {
                    opacity: 1,
                    x: 0,
                    rotateY: 0,
                    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                  },
                  hidden: { opacity: 0, x: -28, rotateY: -8 },
                }}
              >
                <p className="text-lg md:text-xl lg:text-2xl text-white font-medium leading-relaxed max-w-2xl tracking-wide">
                  {subheadline}
                </p>
              </motion.div>
            )}

            {/* Stats Strip - Lower Half */}
            <motion.div
              className="mt-auto pt-8 md:pt-12"
              variants={{
                visible: {
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                },
                hidden: { opacity: 0, y: 24, rotateX: 10 },
              }}
            >
              <div className="inline-flex flex-nowrap items-center justify-start gap-0 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20 shadow-xl overflow-hidden w-fit">
                {homeStats.map((stat, index) => {
                  const numericValue = animatedStats[index] ?? 0;
                  const suffix = stat.value.replace(/\d/g, '');
                  const isNumeric = numericValue > 0;

                  return (
                    <div key={index} className="flex flex-col items-start px-4 py-2.5 md:px-6 md:py-3.5 border-r border-white/10 last:border-r-0 hover:bg-white/5 transition-colors cursor-default">
                      <div className="text-sm md:text-lg lg:text-xl font-black text-white leading-tight">
                        {isNumeric ? `${numericValue}${suffix}` : stat.value}
                      </div>
                      <div className="text-[10px] md:text-xs text-brand-teal font-bold uppercase tracking-wider mt-0.5">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
