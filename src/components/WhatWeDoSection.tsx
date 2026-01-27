'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Playfair_Display } from 'next/font/google';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-playfair',
});

interface CarouselFeature {
  number: string;
  title: string;
  category: string;
  description: string;
  image: string;
}

const features: CarouselFeature[] = [
  {
    number: '01',
    title: 'Find the Right Specialist Fast',
    category: 'SEARCH',
    description: 'Search by specialty, location, or name to find the right physician - whether you\'re coordinating care or seeking it.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    number: '02',
    title: 'Filter by Insurance',
    category: 'COVERAGE',
    description: 'Quickly identify coverage-friendly options and reduce friction in care coordination.',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    number: '03',
    title: 'Verified Physician Profiles',
    category: 'TRUST',
    description: 'Credentialed physicians with board certifications and updated practice details.',
    image: '/Dr.png'
  },
  {
    number: '04',
    title: 'Real Reviews & Feedback',
    category: 'REVIEWS',
    description: 'Patient experience insights and professional reputation signals (verification roadmap).',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    number: '05',
    title: 'Requests & Referrals',
    category: 'COORDINATION',
    description: 'Streamline patient requests and physician-to-physician referrals (placeholder now).',
    image: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    number: '06',
    title: 'Multi-Location Access',
    category: 'ACCESS',
    description: 'Find care and coordinate across locations and medical specialties.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  }
];

export function WhatWeDoSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!isVisible || isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev === features.length - 1 ? 0 : prev + 1));
    }, 3000); // Change card every 3 seconds

    return () => clearInterval(interval);
  }, [isVisible, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev === 0 ? features.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev === features.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? features.length - 1 : prev - 1));
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === features.length - 1 ? 0 : prev + 1));
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const getCardState = (index: number) => {
    const isActive = index === activeIndex;
    const isPrev = index === (activeIndex === 0 ? features.length - 1 : activeIndex - 1);
    const isNext = index === (activeIndex === features.length - 1 ? 0 : activeIndex + 1);
    
    if (isActive) return 'active';
    if (isPrev) return 'prev';
    if (isNext) return 'next';
    return 'hidden';
  };

  const getCardTransform = (state: string) => {
    if (isMobile) {
      return state === 'active' 
        ? 'translateX(0) scale(1) rotateY(0deg)' 
        : 'scale(0.8) rotateY(0deg)';
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
    if (isMobile) {
      return state === 'active' ? 1 : 0;
    }
    
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

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className={`py-16 md:py-24 relative skin-slate overflow-hidden ${playfairDisplay.variable}`}
      id="what-we-do"
    >
      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        {/* Header Section - Centered */}
        <div className="text-center mb-12 md:mb-16">
          <h2 
            className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-brand-dark-blue leading-tight ${playfairDisplay.className}`}
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.5s ease-out 0.4s, transform 1.5s ease-out 0.4s',
            }}
          >
            What We Do
          </h2>
          <p 
            className="text-base md:text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(15px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.5s ease-out 0.8s, transform 1.5s ease-out 0.8s',
            }}
          >
            A trusted network that supports referrals, collaboration, and easier access to care.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative flex flex-col items-center">
          {/* Cards Wrapper */}
          <div 
            className="relative w-full flex justify-center items-center"
            style={{
              height: isSmallMobile ? '550px' : isMobile ? '600px' : '400px',
              perspective: '1200px',
              perspectiveOrigin: 'center center',
            }}
          >
            {features.map((feature, index) => {
              const state = getCardState(index);
              const transform = getCardTransform(state);
              const opacity = getCardOpacity(state);
              const zIndex = getCardZIndex(state);
              const pointerEvents = state === 'active' ? 'auto' : 'none';

              return (
                <div
                  key={index}
                  className={`absolute flex bg-white rounded-xl md:rounded-2xl overflow-hidden transition-all duration-500 border-2 ${
                    state === 'active' 
                      ? 'border-brand-teal/50 shadow-xl' 
                      : 'border-transparent shadow-lg'
                  } hover:border-brand-teal/70 hover:shadow-xl ${
                    prefersReducedMotion ? '' : 'hover:-translate-y-2'
                  } ${
                    isMobile ? 'flex-col max-w-[500px] w-[90%]' : 'w-[90%] max-w-[900px] h-[360px]'
                  }`}
                  style={{
                    ...(state === 'active' && {
                      background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, rgba(29, 212, 196, 0.4), rgba(15, 95, 168, 0.3)) border-box',
                    }),
                    transform: prefersReducedMotion && state !== 'active' ? 'none' : `perspective(1200px) ${transform}`,
                    transformStyle: 'preserve-3d',
                    opacity,
                    zIndex,
                    pointerEvents,
                    transition: prefersReducedMotion 
                      ? 'opacity 0.3s ease, box-shadow 0.3s ease' 
                      : 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: state === 'active' 
                      ? 'var(--shadow-colorful), 0px 20px 60px 0px rgba(0, 0, 0, 0.15), 0px 0px 40px rgba(46, 196, 182, 0.1)'
                      : '0px 4px 12px 0px rgba(0, 0, 0, 0.08)',
                  }}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setTimeout(() => setIsPaused(false), 5000)}
                >
                  {/* Card Content - Left Side */}
                  <div className={`flex-1 flex flex-col justify-center ${isMobile ? 'p-6 md:p-8' : 'p-8 md:p-12'}`}>
                    <span className="carousel-card-number mb-3">
                      {feature.number}
                    </span>
                    
                    <div className="flex items-baseline gap-3 mb-3 flex-wrap">
                      <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-brand-dark-blue m-0">
                        {feature.title}
                      </h3>
                      <span className="text-xs md:text-sm text-gray-500 uppercase tracking-wider font-medium">
                        / {feature.category}
                      </span>
                    </div>
                    
                    <p className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed mb-4 max-w-md">
                      {feature.description}
                    </p>
                    
                    <Button
                      className="w-fit bg-brand-teal hover:bg-brand-teal/90 text-white rounded-md px-6 py-2.5 text-sm font-medium tracking-wide transition-all duration-200 focus-ring hover:scale-105 shadow-md"
                      onClick={() => {
                        console.log(`Read more about: ${feature.title}`);
                      }}
                    >
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>

                  {/* Card Image - Right Side */}
                  <div 
                    className={`relative overflow-hidden ${
                      isMobile ? 'h-[250px] flex-none' : 'flex-1'
                    }`}
                  >
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes={isMobile ? '(max-width: 500px) 100vw' : '(max-width: 900px) 50vw'}
                      unoptimized
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center gap-6 mt-10 md:mt-12">
            {/* Prev Button */}
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center cursor-pointer transition-all duration-200 focus-ring hover:bg-brand-teal hover:text-white hover:border-brand-teal text-gray-700 hover:scale-105 shadow-sm"
              aria-label="Previous feature"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dot Indicators */}
            <div className="flex gap-2.5" role="tablist" aria-label="Feature carousel indicators">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  role="tab"
                  aria-selected={index === activeIndex}
                  aria-label={`Go to feature ${index + 1}`}
                  className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-200 focus-ring ${
                    index === activeIndex
                      ? 'bg-brand-teal scale-125 animate-pulse-subtle'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center cursor-pointer transition-all duration-200 focus-ring hover:bg-brand-teal hover:text-white hover:border-brand-teal text-gray-700 hover:scale-105 shadow-sm"
              aria-label="Next feature"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
