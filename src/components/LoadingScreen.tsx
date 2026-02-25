'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  onComplete?: () => void;
  onExitStart?: () => void; // Called when exit animation starts (for crossfade)
  minDisplayTime?: number; // Minimum time to show loader (ms)
}

export function LoadingScreen({ onComplete, onExitStart, minDisplayTime = 2000 }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [logoScale, setLogoScale] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; rotation: number }>>([]);
  const [cubes, setCubes] = useState<Array<{ id: number; x: number; y: number; rotationX: number; rotationY: number; rotationZ: number }>>([]);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Initialize particles and 3D cubes
  useEffect(() => {
    const particleCount = 60;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);

    // Initialize 3D cubes - more cubes, better distribution
    const cubeCount = 20;
    const newCubes = Array.from({ length: cubeCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotationX: Math.random() * 360,
      rotationY: Math.random() * 360,
      rotationZ: Math.random() * 360,
    }));
    setCubes(newCubes);
  }, []);

  // Staggered entrance: screen fades in, then logo/circle pop in
  useEffect(() => {
    if (!isVisible) return;
    const t1 = setTimeout(() => setLogoScale(1), 180);
    return () => clearTimeout(t1);
  }, [isVisible]);

  // Auto-complete after minimum display time; run exit animation then callback
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      onExitStart?.(); // Start content fade-in now for crossfade (no bright white)
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 380);
    }, minDisplayTime);
    return () => clearTimeout(timer);
  }, [isVisible, minDisplayTime, onComplete, onExitStart]);


  if (!isVisible) return null;

  return (
    <div
      ref={loaderRef}
      className={`loading-screen fixed inset-0 z-[1000000] overflow-hidden ${isExiting ? 'exiting' : ''}`}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue-alt to-brand-dark-blue">
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-teal/20 via-transparent to-brand-teal/10 animate-gradient-shift"></div>
        {/* Animated mesh gradient overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-brand-teal/10 rounded-full blur-3xl" style={{
            animationName: 'pulse-slow',
            animationDuration: '4s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
          }}></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-brand-blue-light/10 rounded-full blur-3xl" style={{
            animationName: 'pulse-slow',
            animationDuration: '4s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: '1s',
          }}></div>
        </div>
      </div>

      {/* 3D Floating Cubes - Enhanced */}
      <div className="absolute inset-0 overflow-hidden" style={{ perspective: '2000px', transformStyle: 'preserve-3d' }}>
        {cubes.map((cube, index) => {
          const size = 25 + Math.random() * 15; // Larger cubes: 25-40px
          const depth = size / 2;
          return (
            <div
              key={cube.id}
              className="loading-3d-cube absolute"
              style={{
                left: `${cube.x}%`,
                top: `${cube.y}%`,
                width: `${size}px`,
                height: `${size}px`,
                transform: `translate(-50%, -50%) rotateX(${cube.rotationX}deg) rotateY(${cube.rotationY}deg) rotateZ(${cube.rotationZ}deg)`,
                animationName: 'cube3DRotateSmooth',
                animationDuration: `${10 + Math.random() * 6}s`,
                animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                animationIterationCount: 'infinite',
                animationDelay: `${Math.random() * 3}s`,
                filter: `brightness(${1 + index * 0.05})`,
                opacity: 0.7 + (index % 3) * 0.1,
              }}
            >
              <div className="cube-face cube-front" style={{ width: `${size}px`, height: `${size}px`, transform: `rotateY(0deg) translateZ(${depth}px)` }}></div>
              <div className="cube-face cube-back" style={{ width: `${size}px`, height: `${size}px`, transform: `rotateY(180deg) translateZ(${depth}px)` }}></div>
              <div className="cube-face cube-right" style={{ width: `${size}px`, height: `${size}px`, transform: `rotateY(90deg) translateZ(${depth}px)` }}></div>
              <div className="cube-face cube-left" style={{ width: `${size}px`, height: `${size}px`, transform: `rotateY(-90deg) translateZ(${depth}px)` }}></div>
              <div className="cube-face cube-top" style={{ width: `${size}px`, height: `${size}px`, transform: `rotateX(90deg) translateZ(${depth}px)` }}></div>
              <div className="cube-face cube-bottom" style={{ width: `${size}px`, height: `${size}px`, transform: `rotateX(-90deg) translateZ(${depth}px)` }}></div>
            </div>
          );
        })}
      </div>

      {/* Floating particles with 3D rotation */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => {
          const duration = 3 + Math.random() * 2;
          return (
            <div
              key={particle.id}
              className="loading-particle absolute rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                background: 'rgba(29, 212, 196, 0.6)',
                animationName: 'particleFloat3D',
                animationDuration: `${duration}s`,
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDelay: `${particle.delay}s`,
                boxShadow: '0 0 10px rgba(29, 212, 196, 0.8)',
                transform: `rotateZ(${particle.rotation}deg)`,
              }}
            />
          );
        })}
      </div>

      {/* Animated grid lines */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(29, 212, 196, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(29, 212, 196, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animationName: 'gridMove',
          animationDuration: '20s',
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
        }}></div>
      </div>

      {/* Animated circles/orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="loading-orb orb-1 absolute"></div>
        <div className="loading-orb orb-2 absolute"></div>
        <div className="loading-orb orb-3 absolute"></div>
      </div>

      {/* Main content - Centered (wrapped for exit animation) */}
      <div className="loading-screen-content relative z-10 h-full flex flex-col items-center" style={{ justifyContent: 'flex-start', paddingTop: '15vh' }}>
        {/* Circular background container - spring-like entrance */}
        <div
          className="relative flex flex-col items-center justify-center"
          style={{
            width: 'min(720px, 90vw)',
            height: 'min(720px, 90vw)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(15, 95, 168, 0.3) 0%, rgba(15, 95, 168, 0.1) 50%, transparent 100%)',
            border: '2px solid rgba(29, 212, 196, 0.2)',
            boxShadow: '0 0 100px rgba(29, 212, 196, 0.3), inset 0 0 100px rgba(29, 212, 196, 0.1)',
            transform: `scale(${logoScale})`,
            transition: 'transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease-out',
            opacity: logoScale,
          }}
        >
          {/* Logo container - perpendicular to view (no 3D tilt) */}
          <div
            className="logo-container relative flex items-center justify-center"
            style={{
              transform: 'none',
              transformStyle: 'flat',
            }}
          >
            <div className="relative flex items-center justify-center">
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 blur-3xl bg-brand-teal/30 animate-pulse-glow" />
              
              {/* Logo - facing viewer, subtle scale/glow pulse only; circular crop */}
              <div className="relative flex items-center justify-center logo-float-perpendicular">
                <div className="relative inline-flex items-center justify-center rounded-full overflow-hidden w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] md:w-[350px] md:h-[350px]">
                  <Image
                    src="/aip%20white%20.png"
                    alt="Alliance of Independent Physicians"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover drop-shadow-2xl"
                    style={{ 
                      filter: 'drop-shadow(0 0 30px rgba(29, 212, 196, 0.5)) drop-shadow(0 0 60px rgba(29, 212, 196, 0.3))',
                    }}
                    priority
                  />
                  {/* Spark cluster to cover broken spot from AI background removal */}
                  <div className="logo-spark-fill absolute pointer-events-none" aria-hidden />
                  <div className="logo-spark-fill logo-spark-outer absolute pointer-events-none" aria-hidden />
                  <div className="logo-spark-fill logo-spark-dot absolute pointer-events-none" aria-hidden />
                  <div className="logo-spark-fill logo-spark-accent absolute pointer-events-none" aria-hidden />
                </div>
              </div>

              {/* Rings around logo - expand in then spin */}
              <div className="absolute inset-0 -m-8 border-2 border-brand-teal/30 rounded-full animate-spin-slow loading-ring-reveal loading-ring-reveal-delay-1" />
              <div className="absolute inset-0 -m-12 border border-brand-teal/20 rounded-full animate-spin-reverse loading-ring-reveal loading-ring-reveal-delay-2" />
              <div className="absolute inset-0 -m-16 border border-brand-teal/10 rounded-full animate-pulse-ring loading-ring-reveal loading-ring-reveal-delay-3" />
            </div>
          </div>

          {/* Loading text - perpendicular, staggered fade-up; wider max width */}
          <div
            className={`text-center -mt-2 w-full max-w-4xl mx-auto px-4 ${logoScale >= 1 ? 'loading-text-reveal' : ''}`}
            style={{
              opacity: logoScale < 1 ? logoScale : undefined,
              transition: logoScale < 1 ? 'opacity 0.5s ease-out' : undefined,
              transform: logoScale < 1 ? 'none' : undefined,
            }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 animate-text-shimmer" style={{
              textShadow: '0 0 30px rgba(29, 212, 196, 0.5), 0 0 60px rgba(29, 212, 196, 0.3)',
            }}>
              Alliance of Independent Physicians
            </h2>
            <p className="text-brand-teal/80 text-lg md:text-xl lg:text-2xl font-medium">
              Connecting physicians. Empowering care.
            </p>
          </div>
        </div>

        {/* 3D Loading animation - rings scale in then rotate (moved up) */}
        <div
          className={`relative loading-rings-entrance -mt-10 md:-mt-14 ${logoScale >= 1 ? '' : 'opacity-0'}`}
          style={{
            opacity: logoScale < 1 ? 0 : undefined,
            transition: logoScale < 1 ? 'opacity 0.3s ease-out' : undefined,
            transformStyle: 'preserve-3d',
            perspective: '2000px',
          }}
        >
          <div className="loading-3d-rings relative w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80">
            <div className="ring-3d ring-1"></div>
            <div className="ring-3d ring-2"></div>
            <div className="ring-3d ring-3"></div>
            <div className="ring-3d ring-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
