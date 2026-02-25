'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
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
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const [frontVideo, setFrontVideo] = useState<'A' | 'B'>('A');
  const [opacityA, setOpacityA] = useState(1);
  const [opacityB, setOpacityB] = useState(0);
  const crossfadeLock = useRef(false);
  const durationRef = useRef(0);
  const frontVideoRef = useRef<'A' | 'B'>('A');

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

  // Keep ref in sync for use inside event handlers (avoids stale closure on reload)
  useEffect(() => {
    frontVideoRef.current = frontVideo;
  }, [frontVideo]);

  // Seamless loop: crossfade between two video layers so the cut is hidden when source isn't loopable
  const CROSSFADE_TRIGGER_S = 0.6;
  const CROSSFADE_DURATION_MS = 450;

  const triggerCrossfadeTo = useCallback((toFront: 'A' | 'B') => {
    if (crossfadeLock.current) return;
    const back = toFront === 'A' ? videoARef.current : videoBRef.current;
    if (!back) return;
    crossfadeLock.current = true;
    back.playbackRate = 1;
    back.currentTime = 0;
    back.play().catch(() => {});
    if (toFront === 'A') {
      setOpacityA(1);
      setOpacityB(0);
    } else {
      setOpacityA(0);
      setOpacityB(1);
    }
    setTimeout(() => {
      setFrontVideo(toFront);
      crossfadeLock.current = false;
    }, CROSSFADE_DURATION_MS);
  }, []);

  const onTimeUpdate = useCallback(() => {
    if (crossfadeLock.current) return;
    const d = durationRef.current;
    if (!d || d <= 0) return;
    const front = frontVideoRef.current === 'A' ? videoARef.current : videoBRef.current;
    const back = frontVideoRef.current === 'A' ? videoBRef.current : videoARef.current;
    if (!front || !back) return;
    const t = front.currentTime;
    if (t >= d - CROSSFADE_TRIGGER_S) {
      triggerCrossfadeTo(frontVideoRef.current === 'A' ? 'B' : 'A');
    }
  }, []);

  const onEnded = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    if (crossfadeLock.current) return;
    if (v === videoARef.current && frontVideoRef.current === 'A') triggerCrossfadeTo('B');
    if (v === videoBRef.current && frontVideoRef.current === 'B') triggerCrossfadeTo('A');
  }, [triggerCrossfadeTo]);

  const onLoadedMetadata = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    if (v.duration && !isNaN(v.duration)) durationRef.current = v.duration;
  }, []);

  const onPlay = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    if (v.playbackRate !== 1) v.playbackRate = 1;
  }, []);

  // Ensure video A starts on full reload (autoplay can be blocked until interaction).
  // Only call play() when paused to avoid double-play at start (which can cause fast playback).
  useEffect(() => {
    if (!isVisible) return;
    const v = videoARef.current;
    if (!v) return;
    v.playbackRate = 1;
    if (v.paused) {
      const p = v.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
  }, [isVisible]);

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
          className="absolute inset-0 overflow-hidden"
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
        >
        {/* Two video layers with crossfade at loop point to hide glitch when source isn't seamless */}
        <video
          ref={videoARef}
          autoPlay
          loop={false}
          muted
          playsInline
          preload="auto"
          className="absolute h-full w-[200%] max-w-none object-cover transition-opacity duration-[450ms] ease-out"
          style={{
            left: '-79.5%',
            top: 0,
            opacity: isVisible ? opacityA : 0,
            transition: prefersReducedMotion ? 'opacity 0.3s ease' : `opacity ${isVisible ? '450ms' : '1s'} ease-out ${isVisible ? '0ms' : '0.3s'}`,
          }}
          aria-hidden="true"
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onPlay={onPlay}
          onEnded={onEnded}
          onError={() => console.error('Video failed to load:', videoSource)}
        >
          <source src={videoSource} type="video/mp4" />
        </video>
        <video
          ref={videoBRef}
          loop={false}
          muted
          playsInline
          preload="auto"
          className="absolute h-full w-[200%] max-w-none object-cover transition-opacity duration-[450ms] ease-out"
          style={{
            left: '-79.5%',
            top: 0,
            opacity: isVisible ? opacityB : 0,
            transition: prefersReducedMotion ? 'opacity 0.3s ease' : `opacity ${isVisible ? '450ms' : '1s'} ease-out ${isVisible ? '0ms' : '0.3s'}`,
          }}
          aria-hidden="true"
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onPlay={onPlay}
          onEnded={onEnded}
          onError={() => console.error('Video failed to load:', videoSource)}
        >
          <source src={videoSource} type="video/mp4" />
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

      {/* Vertical bars: left & right — hover expands to cover full hero (modern slide-over) */}
      <div className="absolute inset-0 z-20 flex justify-between pointer-events-none [&>*]:pointer-events-auto">
        {/* Left bar — FOR PATIENTS (runs left to right like FOR PHYSICIANS: bar then content) */}
        <div
          className="absolute left-0 top-0 bottom-0 w-14 md:w-16 overflow-hidden transition-[width] duration-500 ease-out hover:w-1/2 group hidden md:block"
        >
          <Link
            href="/patients"
            className="relative flex h-full w-max min-w-full border-r border-white/20 shadow-2xl overflow-hidden"
            aria-label="For Patients - Find independent physicians"
          >
            {/* Background image (same as AudienceSwitchFloating) */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/for_pt.png"
                alt=""
                fill
                className="object-cover"
                sizes="50vw"
              />
            </div>
            {/* Gradient overlay */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-br from-[#10B981]/80 via-[#10B981]/70 to-[#059669]/85 backdrop-blur-sm" />
            {/* Bar on left (inner edge), then content — same order as FOR PHYSICIANS */}
            <div className="relative z-10 w-14 md:w-16 flex-shrink-0 flex items-center justify-center py-8 border-r border-white/10">
              <span className="text-white font-bold text-sm uppercase tracking-[0.35em] [writing-mode:vertical-rl] rotate-180">
                For Patients
              </span>
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-10 lg:px-16 min-w-[320px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 flex-1">
              <h3 className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-3">Find care</h3>
              <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">Find your provider</h4>
              <p className="text-white/90 text-base md:text-lg max-w-sm mb-8 leading-relaxed">
                Experience excellence. Personal care.
              </p>
              <span className="group/btn inline-flex items-center gap-2 text-white font-semibold border-2 border-white rounded-full px-6 py-3 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-white/25 hover:scale-105 hover:shadow-[0_0_28px_rgba(255,255,255,0.3),inset_0_0_20px_rgba(255,255,255,0.05)] hover:border-white transition-all duration-300 ease-out">
                Access Care <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </span>
            </div>
          </Link>
        </div>

        {/* Right bar — FOR PHYSICIANS (expands to center only, symmetric with left) */}
        <div
          className="absolute right-0 top-0 bottom-0 w-14 md:w-16 overflow-hidden transition-[width] duration-500 ease-out hover:w-1/2 group hidden md:block"
        >
          <Link
            href="/physicians"
            className="relative flex h-full w-max min-w-full border-l border-white/20 shadow-2xl overflow-hidden"
            aria-label="For Physicians - Join a trusted alliance"
          >
            {/* Background image (same as AudienceSwitchFloating) */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/for_dr.png"
                alt=""
                fill
                className="object-cover"
                sizes="50vw"
              />
            </div>
            {/* Gradient overlay */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-br from-brand-dark-blue/80 via-brand-dark-blue/70 to-brand-dark-blue/85 backdrop-blur-sm" />
            <div className="relative z-10 w-14 md:w-16 flex-shrink-0 flex items-center justify-center py-8 border-r border-white/10">
              <span className="text-white font-bold text-sm uppercase tracking-[0.35em] [writing-mode:vertical-rl] rotate-180">
                For Physicians
              </span>
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-10 lg:px-16 min-w-[320px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 ml-auto">
              <h3 className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-3">Join the network</h3>
              <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">Empower your practice</h4>
              <p className="text-white/90 text-base md:text-lg max-w-sm mb-8 leading-relaxed">
                Connect with peers. Lead with autonomy.
              </p>
              <span className="group/btn inline-flex items-center gap-2 text-white font-semibold border-2 border-white rounded-full px-6 py-3 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-white/25 hover:scale-105 hover:shadow-[0_0_28px_rgba(255,255,255,0.3),inset_0_0_20px_rgba(255,255,255,0.05)] hover:border-white transition-all duration-300 ease-out">
                Join Us <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Container with flex layout */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 relative z-10">
        <div className="flex flex-col items-center justify-center text-center min-h-[570px] md:min-h-[670px] py-12 md:py-16 lg:py-20">
          {/* Content Area - 40% width with staggered 3D entrance */}
          <motion.div
            className="w-full max-w-3xl lg:w-[40%] flex flex-col items-center h-full mx-auto"
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
            {/* Heading - Top (staggered lines) */}
            <motion.div
              className="mb-8 md:mb-12"
              variants={{
                visible: {
                  transition: { staggerChildren: prefersReducedMotion ? 0 : 0.12, delayChildren: prefersReducedMotion ? 0 : 0.1 },
                },
                hidden: {},
              }}
            >
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] text-white tracking-tight" style={{ transformStyle: 'preserve-3d' }}>
                <motion.span
                  className="whitespace-nowrap block"
                  variants={{
                    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                    hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
                  }}
                >
                  United in Care
                </motion.span>
                <motion.span
                  className="whitespace-normal sm:whitespace-nowrap block mt-1"
                  variants={{
                    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                    hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
                  }}
                >
                  <span className="text-brand-teal drop-shadow-[0_0_20px_rgba(20,184,166,0.4)]">Dedicated to You</span>
                </motion.span>
              </h1>
            </motion.div>

            {/* Subtitle - Middle */}
            {subheadline && (
              <motion.div
                className="my-auto py-8 md:py-12"
                variants={{
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: prefersReducedMotion ? 0 : 0.2 },
                  },
                  hidden: { opacity: 0, y: 16 },
                }}
              >
                <p className="text-lg md:text-xl lg:text-2xl text-white font-medium leading-relaxed max-w-2xl tracking-wide mx-auto">
                  {subheadline}
                </p>
              </motion.div>
            )}

            {/* Stats Strip - Lower Half (staggered + hover) */}
            <motion.div
              className="mt-auto pt-8 md:pt-12"
              variants={{
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { staggerChildren: prefersReducedMotion ? 0 : 0.08, delayChildren: prefersReducedMotion ? 0 : 0.15 },
                },
                hidden: { opacity: 0, y: 20 },
              }}
            >
              <div className="inline-flex flex-nowrap items-center justify-center gap-0 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20 shadow-xl overflow-hidden w-fit mx-auto">
                {homeStats.map((stat, index) => {
                  const numericValue = animatedStats[index] ?? 0;
                  const suffix = stat.value.replace(/\d/g, '');
                  const isNumeric = numericValue > 0;

                  return (
                    <motion.div
                      key={index}
                      className="flex flex-col items-center px-4 py-2.5 md:px-6 md:py-3.5 border-r border-white/10 last:border-r-0 cursor-default transition-all duration-300 ease-out hover:bg-white/15 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                      variants={{
                        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
                        hidden: { opacity: 0, y: 12, scale: 0.96 },
                      }}
                    >
                      <div className="text-sm md:text-lg lg:text-xl font-black text-white leading-tight">
                        {isNumeric ? `${numericValue}${suffix}` : stat.value}
                      </div>
                      <div className="text-[10px] md:text-xs text-brand-teal font-bold uppercase tracking-wider mt-0.5">
                        {stat.label}
                      </div>
                    </motion.div>
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
