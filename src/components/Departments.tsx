'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { departments } from '@/data/departments';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Simple, modern, professional single color pattern
// Alternates between teal and dark blue for visual variety
const getCardStyle = (index: number) => {
  const isTeal = index % 2 === 0;
  
  return {
    background: isTeal ? '#2EC4B6' : '#1A4B7F', // Solid colors, no gradients
    textColor: 'text-white',
    accentColor: 'text-white',
  };
};

export function Departments() {
  const [isVisible, setIsVisible] = useState(false);
  const [bottomImageVisible, setBottomImageVisible] = useState(false);
  const [topImageVisible, setTopImageVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Animate bottom image first
          setTimeout(() => {
            setBottomImageVisible(true);
            // Then animate top image after significant delay
            setTimeout(() => {
              setTopImageVisible(true);
            }, 800);
          }, 200);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="departments" className="pt-8 pb-12 relative bg-gradient-to-br from-teal-50 via-white to-blue-50 overflow-visible">
      <div className="container mx-auto px-4 relative z-10">
        {/* Title Image - Right Aligned */}
        <div 
          className="flex justify-end mb-12 md:mb-16"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateX(0) scale(1) rotate(0deg)' : 'translateX(80px) scale(0.8) rotate(5deg)',
            transition: 'opacity 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div className="relative w-full max-w-2xl">
            <Image
              src="/title1.png"
              alt="Our Medical Departments"
              width={800}
              height={200}
              className="w-full h-auto"
              unoptimized
            />
          </div>
        </div>

        {/* Two Column Layout: Departments Left, Images Right */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Left Side: Departments Grid */}
          <div 
            className="w-full lg:w-[60%]"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(-30px)',
              transition: 'opacity 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-8">
              {departments.map((dept, index) => {
                const cardStyle = getCardStyle(index);
                const cardDelay = index * 150;

                return (
                  <Link
                    key={dept.slug}
                    href={`/doctors?specialty=${dept.slug}`}
                    className="block group"
                  >
                    <div
                      className={`${cardStyle.textColor} p-3 md:p-4 relative flex flex-col min-h-[80px] md:min-h-[90px] rounded-lg group transition-all duration-300`}
                      style={{
                        backgroundColor: cardStyle.background,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08)',
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible 
                          ? 'translateY(0) scale(1) rotate(0deg) translateZ(0)' 
                          : 'translateY(40px) scale(0.8) rotate(-3deg) translateZ(0)',
                        transition: `opacity 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${cardDelay}ms, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${cardDelay}ms, box-shadow 0.3s ease, background-color 0.3s ease`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-6px) scale(1.05) rotate(1deg) translateZ(0)';
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.2), 0 6px 12px rgba(46, 196, 182, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1) rotate(0deg) translateZ(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08)';
                      }}
                    >
                      {/* Department Name */}
                      <h3 className="text-sm md:text-base font-bold mb-2 uppercase tracking-tight leading-snug flex-shrink-0 break-words line-clamp-2">
                        {dept.name}
                      </h3>

                      {/* View Doctors Button */}
                      <div className={`flex items-center ${cardStyle.accentColor} opacity-90 group-hover:opacity-100 transition-all mt-auto`}>
                        <span className="text-xs md:text-sm font-medium">View Doctors</span>
                        <ArrowRight className="ml-1.5 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div 
              className="text-center lg:text-left"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.9)',
                transition: 'opacity 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 1s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 1s',
              }}
            >
              <Button asChild size="lg" className="bg-brand-teal hover:bg-brand-teal/90 text-white hover:scale-105 transition-transform duration-300">
                <Link href="/doctors">
                  View All Doctors
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Side: Stacked Images */}
          <div ref={imagesRef} className="w-full lg:w-[40%] relative mt-8 lg:mt-16">
            <div className="relative w-full aspect-square max-w-lg lg:max-w-xl mx-auto lg:mx-0">
              {/* Bottom Image - Animates first with elastic bounce */}
              <div 
                className="absolute inset-0 w-full h-full"
                style={{
                  opacity: bottomImageVisible ? 1 : 0,
                  transform: bottomImageVisible 
                    ? 'translateY(0) scale(1) rotate(0deg)' 
                    : 'translateY(100px) scale(0.3) rotate(-15deg)',
                  transition: 'opacity 1s cubic-bezier(0.68, -0.55, 0.265, 1.55), transform 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                }}
              >
                <Image
                  src="/elementDr.png"
                  alt="Medical element"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              {/* Top Image - Animates after with bounce and rotation */}
              <div 
                className="absolute inset-0 w-full h-full"
                style={{
                  opacity: topImageVisible ? 1 : 0,
                  transform: topImageVisible 
                    ? 'translateY(0) scale(1) rotate(0deg)' 
                    : 'translateY(80px) scale(0.7) rotate(10deg)',
                  transition: 'opacity 1s cubic-bezier(0.34, 1.56, 0.64, 1), transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <Image
                  src="/drsec.png"
                  alt="Healthcare professional"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
