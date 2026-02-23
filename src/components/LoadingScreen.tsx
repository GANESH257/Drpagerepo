'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  onComplete?: () => void;
  minDisplayTime?: number; // Minimum time to show loader (ms)
}

export function LoadingScreen({ onComplete, minDisplayTime = 2000 }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [logoScale, setLogoScale] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; rotation: number }>>([]);
  const [cubes, setCubes] = useState<Array<{ id: number; x: number; y: number; rotationX: number; rotationY: number; rotationZ: number }>>([]);
  const loaderRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());

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

  // Animate logo entrance
  useEffect(() => {
    if (!isVisible) return;
    
    const timer = setTimeout(() => {
      setLogoScale(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [isVisible]);

  // Auto-complete after minimum display time (no progress bar)
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      if (loaderRef.current) {
        // Start exit animation
        loaderRef.current.style.opacity = '0';
        loaderRef.current.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
          setIsVisible(false);
          if (onComplete) onComplete();
        }, 800);
      }
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [isVisible, minDisplayTime, onComplete]);


  if (!isVisible) return null;

  return (
    <div
      ref={loaderRef}
      className="loading-screen fixed inset-0 z-[1000000] overflow-hidden"
      style={{
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      }}
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

      {/* Main content - Centered */}
      <div className="relative z-10 h-full flex flex-col items-center" style={{ justifyContent: 'flex-start', paddingTop: '15vh' }}>
        {/* Circular background container */}
        <div
          className="relative flex flex-col items-center justify-center"
          style={{
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(15, 95, 168, 0.3) 0%, rgba(15, 95, 168, 0.1) 50%, transparent 100%)',
            border: '2px solid rgba(29, 212, 196, 0.2)',
            boxShadow: '0 0 100px rgba(29, 212, 196, 0.3), inset 0 0 100px rgba(29, 212, 196, 0.1)',
            transform: `scale(${logoScale})`,
            transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            opacity: logoScale,
          }}
        >
          {/* Logo container with 3D animation */}
          <div
            className="logo-container relative flex items-center justify-center"
            style={{
              transform: `perspective(1000px) rotateY(${logoScale * 10}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            <div className="relative flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
              {/* 3D Glow effect behind logo */}
              <div className="absolute inset-0 blur-3xl bg-brand-teal/30 animate-pulse-glow" style={{
                transform: 'translateZ(-50px)',
              }}></div>
              
              {/* Logo with 3D effect - Centered */}
              <div className="relative flex items-center justify-center" style={{
                transform: 'perspective(1000px) translateZ(30px)',
                animation: 'logo3DFloat 4s ease-in-out infinite',
              }}>
                <Image
                  src="/logodrpnew.png"
                  alt="Alliance of Independent Physicians"
                  width={400}
                  height={400}
                  className="w-auto object-contain drop-shadow-2xl"
                  style={{ 
                    height: '350px',
                    filter: 'drop-shadow(0 0 30px rgba(29, 212, 196, 0.5)) drop-shadow(0 0 60px rgba(29, 212, 196, 0.3))',
                  }}
                  priority
                />
              </div>

              {/* 3D Rotating rings around logo */}
              <div className="absolute inset-0 -m-8 border-2 border-brand-teal/30 rounded-full animate-spin-slow" style={{
                transform: 'perspective(1000px) rotateX(60deg) translateZ(20px)',
              }}></div>
              <div className="absolute inset-0 -m-12 border border-brand-teal/20 rounded-full animate-spin-reverse" style={{
                transform: 'perspective(1000px) rotateY(60deg) translateZ(10px)',
              }}></div>
              {/* 3D Pulsing outer ring */}
              <div className="absolute inset-0 -m-16 border border-brand-teal/10 rounded-full animate-pulse-ring" style={{
                transform: 'perspective(1000px) rotateZ(45deg) translateZ(-10px)',
              }}></div>
            </div>
          </div>

          {/* Loading text with 3D effect - Inside circle, below logo */}
          <div
            className="text-center mt-8"
            style={{
              opacity: logoScale,
              transition: 'opacity 0.6s ease-out 0.4s',
              transform: `perspective(1000px) rotateX(${logoScale * 5}deg)`,
            }}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 animate-text-shimmer" style={{
              textShadow: '0 0 30px rgba(29, 212, 196, 0.5), 0 0 60px rgba(29, 212, 196, 0.3)',
              transform: 'perspective(1000px) translateZ(20px)',
            }}>
              Alliance of Independent Physicians
            </h2>
            <p className="text-brand-teal/80 text-sm md:text-base font-medium" style={{
              transform: 'perspective(1000px) translateZ(10px)',
            }}>
              Connecting physicians. Empowering care.
            </p>
          </div>
        </div>

        {/* 3D Loading animation - Enhanced rotating rings */}
        <div
          className="relative"
          style={{
            opacity: logoScale,
            transition: 'opacity 0.6s ease-out 0.6s',
            transform: 'perspective(2000px)',
            transformStyle: 'preserve-3d',
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
