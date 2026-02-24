'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Cog } from 'lucide-react';
import { Playfair_Display } from 'next/font/google';
import { cn } from '@/lib/utils';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
});

interface PatientStep {
  number: string;
  title: string;
  description: string;
  image: string;
}

const patientSteps: PatientStep[] = [
  {
    number: '01',
    title: 'Search Our Network',
    description: 'Use our powerful search to filter by specialty, insurance, and location.',
    image: '/for_pt.png',
  },
  {
    number: '02',
    title: 'Compare with Confidence',
    description: 'Review detailed profiles, including credentials, experience, and services offered.',
    image: '/for_dr.png',
  },
  {
    number: '03',
    title: 'Connect Directly',
    description: 'Contact the practice of your choice to schedule your appointment.',
    image: '/for_dr2.png',
  },
];

export function PatientSteps() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-32 relative overflow-hidden bg-[#e9f8f8]">
      {/* 3D animated cog shapes background */}
      <div className="patient-steps-cogs-bg" aria-hidden>
        <div className="patient-steps-cogs-inner">
          <Cog className="patient-cog patient-cog-1" strokeWidth={2.25} />
          <Cog className="patient-cog patient-cog-2" strokeWidth={2.25} />
          <Cog className="patient-cog patient-cog-3" strokeWidth={2.25} />
          <Cog className="patient-cog patient-cog-4" strokeWidth={2.25} />
          <Cog className="patient-cog patient-cog-5" strokeWidth={2.25} />
          <Cog className="patient-cog patient-cog-6" strokeWidth={2.25} />
          <Cog className="patient-cog patient-cog-7" strokeWidth={2.25} />
          <Cog className="patient-cog patient-cog-8" strokeWidth={2.25} />
        </div>
      </div>
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 opacity-60">
          <Image src="/shapes/shape-65.png" alt="" fill className="object-contain" />
        </div>
        <div className="absolute bottom-[10%] right-[5%] w-72 h-72 opacity-60">
          <Image src="/shapes/shape-66.png" alt="" fill className="object-contain" />
        </div>
        <div className="absolute top-[40%] right-[2%] w-48 h-48 opacity-40">
          <Image src="/shapes/shape-61.png" alt="" fill className="object-contain" />
        </div>
        <div className="absolute bottom-[20%] left-[2%] w-40 h-40 opacity-40">
          <Image src="/shapes/shape-62.png" alt="" fill className="object-contain" />
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">

          {/* Section Header – same text design as MissionStatementNewHome */}
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
              Patient Process
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-brand-dark-blue leading-[1.1] tracking-tight">
              How <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-emerald-600">It Works</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Simple steps to connect with the right care provider.
            </p>
          </div>

          {/* Process Content */}
          <div className="relative">

            {/* Curved Path Shape (shape-64.png from reference) */}
            <div className="hidden lg:block absolute top-[15%] left-1/2 -translate-x-1/2 w-[85%] h-[60%] pointer-events-none -z-0 opacity-80">
              <Image
                src="/shapes/shape-64.png"
                alt=""
                fill
                className="object-contain"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 relative z-10">
              {patientSteps.map((step, index) => (
                <div
                  key={step.number}
                  className={cn(
                    "flex flex-col items-center group transition-all duration-500",
                    index === 1 ? "lg:translate-y-16" : ""
                  )}
                >
                  {/* Step Image Box */}
                  <div className="relative mb-8">
                    {/* Main Circle Image */}
                    <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-[12px] border-white shadow-xl transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                      <Image
                        src={step.image}
                        alt={step.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Number Badge */}
                    <div className="absolute -top-1 -left-1 w-12 h-12 md:w-14 md:h-14 bg-brand-teal rounded-full flex items-center justify-center text-white font-bold text-lg border-4 border-white shadow-lg z-20 group-hover:scale-110 transition-transform duration-300">
                      {step.number}
                    </div>

                    {/* Decorative Ring (Subtle) */}
                    <div className="absolute -inset-4 rounded-full border-2 border-brand-teal/10 -z-10 group-hover:scale-110 transition-transform duration-700" />
                  </div>

                  {/* Text Content */}
                  <div className="text-center px-4">
                    <h4 className="text-xl md:text-2xl font-bold text-[#112437] mb-3 leading-tight group-hover:text-brand-teal transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
