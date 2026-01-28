'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Playfair_Display } from 'next/font/google';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    description: 'Search by specialty, location, or name to quickly find the perfect doctor using our advanced matching system.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    number: '02',
    title: 'Filter by Insurance',
    category: 'COVERAGE',
    description: 'Easily filter doctors by your insurance plan to ensure coverage and minimize out-of-pocket costs. We support all major insurance providers.',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    number: '03',
    title: 'Verified Physician Profiles',
    category: 'TRUST',
    description: 'All doctors are verified with credentials, board certifications, and practice information. We ensure you connect with qualified healthcare providers.',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    number: '04',
    title: 'Real Patient Reviews',
    category: 'REVIEWS',
    description: 'Read authentic reviews from verified patients to help you make informed decisions. Honest feedback from real patient experiences.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    number: '05',
    title: 'Request Appointments Online',
    category: 'BOOKING',
    description: 'Conveniently request appointment times directly through our platform. Easy scheduling that works around your busy lifestyle.',
    image: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    number: '06',
    title: 'Multiple Locations & Medical Specialties',
    category: 'ACCESS',
    description: 'Access doctors across multiple locations and medical specialties all in one place. Find care near you, wherever you are.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  }
];

export function Advantages() {
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
    }, 5000); // Change card every 5 seconds

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
    setIsPaused(true); // Pause auto-play when user interacts
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsPaused(false), 10000);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === features.length - 1 ? 0 : prev + 1));
    setIsPaused(true); // Pause auto-play when user interacts
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsPaused(false), 10000);
  };

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
    setIsPaused(true); // Pause auto-play when user interacts
    // Resume auto-play after 10 seconds
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
      // On mobile/tablet, only show active card
      return state === 'active' 
        ? 'translateX(0) scale(1)' 
        : 'scale(0.8)';
    }
    
    // Desktop: show prev/next cards
    switch (state) {
      case 'active':
        return 'translateX(0) scale(1)';
      case 'prev':
        return 'translateX(-85%) scale(0.9)';
      case 'next':
        return 'translateX(85%) scale(0.9)';
      default:
        return 'scale(0.8)';
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

  return (
    <section 
      ref={sectionRef} 
      className={`py-16 md:py-20 lg:py-24 relative bg-gradient-to-br from-teal-50 via-white to-blue-50 overflow-hidden ${playfairDisplay.variable}`}
      id="features"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section - Centered */}
        <div className="text-center mb-12 md:mb-16">
          <h2 
            className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-brand-dark-blue leading-tight ${playfairDisplay.className}`}
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 1.5s ease-out 0.4s, transform 1.5s ease-out 0.4s',
            }}
          >
            Why Choose Us
          </h2>
          <p 
            className="text-base md:text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 1.5s ease-out 0.8s, transform 1.5s ease-out 0.8s',
            }}
          >
            We make it easy to find and connect with the right healthcare provider for you.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative flex flex-col items-center">
          {/* Cards Wrapper */}
          <div 
            className="relative w-full flex justify-center items-center"
            style={{
              height: isSmallMobile ? '550px' : isMobile ? '600px' : '400px',
              perspective: '1000px',
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
                  className={`absolute flex bg-white rounded-3xl shadow-lg overflow-hidden ${
                    isMobile ? 'flex-col max-w-[500px] w-[90%]' : 'w-[90%] max-w-[900px] h-[360px]'
                  }`}
                  style={{
                    transform,
                    opacity,
                    zIndex,
                    pointerEvents,
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: state === 'active' 
                      ? '0 0 40px rgba(46, 196, 182, 0.1), 0 20px 40px rgba(0, 0, 0, 0.08)'
                      : '0 0 20px rgba(0, 0, 0, 0.05)',
                  }}
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
                      className="w-fit bg-brand-dark-blue hover:bg-brand-teal text-white rounded-lg px-7 py-3 text-sm font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5"
                      onClick={() => {
                        // Placeholder for "READ MORE" functionality
                        console.log(`Read more about: ${feature.title}`);
                      }}
                    >
                      READ MORE <span className="ml-2 text-lg">+</span>
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
                      className="object-cover"
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
              className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-brand-teal hover:text-white hover:border-brand-teal text-gray-700"
              aria-label="Previous feature"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dot Indicators */}
            <div className="flex gap-2.5">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${
                    index === activeIndex
                      ? 'bg-brand-teal scale-125'
                      : 'bg-gray-200 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to feature ${index + 1}`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-brand-teal hover:text-white hover:border-brand-teal text-gray-700"
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
