'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

const certificates = [
  { src: '/logo-1.svg', alt: 'Certificate 1' },
  { src: '/logo-2.png', alt: 'Certificate 2' },
  { src: '/logo-3.png', alt: 'Certificate 3' },
  { src: '/logo-4.avif', alt: 'Certificate 4' },
  { src: '/logo-5.png', alt: 'Certificate 5' },
  { src: '/logo-6.jpg', alt: 'Certificate 6' },
  { src: '/logo-7.jpg', alt: 'Certificate 7' },
  { src: '/logo-8.jpg', alt: 'Certificate 8' },
];

export function CertificateMarquee() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      if (sectionRef.current) {
        observer.observe(sectionRef.current);
      }

      return () => observer.disconnect();
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-6 md:py-8 skin-paper relative overflow-hidden"
      aria-label="Certifications and accreditations"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(30px)',
        transition: prefersReducedMotion
          ? 'opacity 0.3s ease'
          : 'opacity 1.5s ease-out 0.4s, transform 1.5s ease-out 0.4s',
      }}
    >
      <div className="container mx-auto px-4">
        {/* Marquee Container */}
        <div className="overflow-hidden relative w-full">
          <div
            className={`flex gap-8 md:gap-12 items-center w-max ${prefersReducedMotion ? '' : 'animate-marquee'}`}
          >
            {/* First set of logos */}
            {certificates.map((cert, index) => (
              <div
                key={`cert-1-${index}`}
                className="flex-shrink-0 flex items-center justify-center"
              >
                <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 transition-all duration-300 opacity-80 hover:opacity-100">
                  <Image
                    src={cert.src}
                    alt={cert.alt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 96px, (max-width: 1024px) 128px, 144px"
                  />
                </div>
              </div>
            ))}

            {/* Duplicate set for seamless loop */}
            {certificates.map((cert, index) => (
              <div
                key={`cert-2-${index}`}
                className="flex-shrink-0 flex items-center justify-center"
              >
                <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 transition-all duration-300 opacity-80 hover:opacity-100">
                  <Image
                    src={cert.src}
                    alt={cert.alt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 96px, (max-width: 1024px) 128px, 144px"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
