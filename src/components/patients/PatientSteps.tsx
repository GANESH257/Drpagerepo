'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PatientStep {
  number: string;
  title: string;
  description: string;
  image: string;
}

const patientSteps: PatientStep[] = [
  {
    number: '01',
    title: 'Search',
    description: 'Find specialists by specialty and location',
    image: '/for_pt.png',
  },
  {
    number: '02',
    title: 'Compare',
    description: 'Review profiles, credentials, and reviews',
    image: '/for_dr.png',
  },
  {
    number: '03',
    title: 'Onboarding',
    description: 'Request appointments or contact practices',
    image: '/for_dr2.png',
  },
  {
    number: '04',
    title: 'Care',
    description: 'Receive personalized treatment',
    image: '/for_pt2.png',
  },
];

export function PatientSteps() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-20 md:py-32 relative overflow-hidden bg-[#e9f8f8]">
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

          {/* Section Header */}
          <div className="text-center mb-20 md:mb-24">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-px bg-brand-teal/30" />
              <span className="text-brand-teal font-bold text-xs tracking-[0.3em] uppercase">
                Patient Process
              </span>
              <div className="w-12 h-px bg-brand-teal/30" />
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#1a4b7f] leading-tight max-w-3xl mx-auto">
              Your Path to Better Health
            </h2>
            <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
              {patientSteps.map((step, index) => (
                <div
                  key={step.number}
                  className={cn(
                    "flex flex-col items-center group transition-all duration-500",
                    index === 1 ? "lg:translate-y-16" : "",
                    index === 2 ? "lg:translate-y-4" : "",
                    index === 3 ? "lg:translate-y-24" : ""
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
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
