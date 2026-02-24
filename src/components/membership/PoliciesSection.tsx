'use client';

import { useEffect, useRef, useState } from 'react';
import { Playfair_Display } from 'next/font/google';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { membershipPolicies } from '@/data/membershipPolicies';
import { FileText, Download } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
});

export function PoliciesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
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
    <section ref={sectionRef} id="policies" className="py-16 md:py-24 bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue/90 to-brand-teal/20">
      <div className="container mx-auto px-4">
        {/* Header – same text design as Mission-style (dark variant) */}
        <div
          className="text-center mb-12 md:mb-16"
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
              'inline-block px-4 py-1.5 bg-white/20 text-white font-black text-base md:text-lg uppercase tracking-[0.2em] rounded-full mb-4 border border-white/30 backdrop-blur-sm',
              playfairDisplay.className
            )}
          >
            Policies
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white leading-[1.1] tracking-tight">
            Membership{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-emerald-400">
              Policies
            </span>
          </h2>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Our membership policies ensure clarity, fairness, and professional standards for all Alliance members.
          </p>
        </div>

        {/* Policies Accordion – standard card design */}
        <div className="max-w-6xl mx-auto mb-12">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {membershipPolicies.map((policyCategory) => (
              <AccordionItem
                key={policyCategory.category}
                value={policyCategory.category}
                className="group relative overflow-hidden border border-gray-200/80 rounded-lg px-6 bg-white/50 backdrop-blur-xl shadow-2xl shadow-black/15 data-[state=open]:shadow-[0_28px_60px_-12px_rgba(15,95,168,0.15)] transition-all duration-500 ease-out data-scroll-exclude"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-brand-teal/10 pointer-events-none z-0" aria-hidden />
                <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/5 via-transparent to-brand-teal/5 pointer-events-none z-0" aria-hidden />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-teal/10 rounded-full blur-3xl pointer-events-none z-0" aria-hidden />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-dark-blue/10 rounded-full blur-3xl pointer-events-none z-0" aria-hidden />
                <AccordionTrigger className="relative z-10 text-xl font-semibold text-brand-dark-blue hover:no-underline py-6">
                  {policyCategory.category} ({policyCategory.items.length})
                </AccordionTrigger>
                <AccordionContent className="relative z-10 pt-4 pb-6">
                  <div className="space-y-4">
                    {policyCategory.items.map((item) => (
                      <Card
                        key={item.id}
                        className="group/card relative overflow-hidden border-0 bg-white/40 backdrop-blur-sm -translate-y-1 shadow-lg shadow-black/10 hover:-translate-y-2 hover:shadow-xl hover:shadow-black/15 transition-all duration-500 ease-out border border-gray-200/60 hover:border-brand-dark-blue/40"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-brand-teal/5 pointer-events-none z-0" aria-hidden />
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/5 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none z-0" aria-hidden />
                        <CardHeader className="relative z-10 pb-3">
                          <CardTitle className="text-lg font-semibold text-brand-dark-blue">
                            {item.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                          <p className="text-gray-700 leading-relaxed">{item.body}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* PDF Download – standard card design */}
        <div className="max-w-3xl mx-auto text-center">
          <Card className="group relative overflow-hidden transition-all duration-500 ease-out data-scroll-exclude bg-white/50 backdrop-blur-xl border border-gray-200/80 -translate-y-3 shadow-2xl shadow-black/15 hover:-translate-y-5 hover:shadow-[0_28px_60px_-12px_rgba(15,95,168,0.25),0_0_0_1px_rgba(15,95,168,0.08)] hover:border-brand-dark-blue/60 hover:scale-[1.02] hover:bg-white/75">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-brand-teal/10 pointer-events-none group-hover:opacity-80 transition-opacity duration-500 z-0" aria-hidden />
            <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/5 via-transparent to-brand-teal/5 pointer-events-none z-0" aria-hidden />
            <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/15 via-brand-teal/10 to-brand-dark-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" aria-hidden />
            <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
              <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/10 via-brand-teal/5 to-transparent animate-gradient-shift" />
              <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-brand-teal/5 to-brand-dark-blue/10 animate-gradient-shift-reverse" />
            </div>
            <div className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500 z-0" aria-hidden>
              <div className="absolute inset-0 floating" style={{ backgroundImage: 'radial-gradient(circle, rgba(15, 95, 168, 0.15) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            </div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-teal/15 group-hover:bg-brand-teal/30 group-hover:scale-150 rounded-full blur-3xl pointer-events-none transition-all duration-500 z-0" aria-hidden />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-dark-blue/15 group-hover:bg-brand-dark-blue/30 group-hover:scale-150 rounded-full blur-3xl pointer-events-none transition-all duration-500 z-0" aria-hidden />
            <CardContent className="relative z-10 p-6">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl text-white relative overflow-hidden bg-gradient-to-br from-brand-dark-blue to-brand-teal group-hover:scale-125 group-hover:shadow-[0_0_30px_rgba(15,95,168,0.4)] transition-all duration-500 ease-out">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" aria-hidden />
                <FileText className="h-12 w-12 relative z-10" />
              </div>
              <h3 className="text-xl font-semibold text-brand-dark-blue mb-2">
                Complete Membership Policy Document
              </h3>
              <p className="text-gray-700 mb-6">
                Download the full membership policy document for detailed information about all policies and procedures.
              </p>
              <Button
                className="bg-brand-teal hover:bg-brand-teal/90 text-white"
                asChild
              >
                <Link href="/policies/membership-policy.pdf" target="_blank">
                  <Download className="mr-2 h-4 w-4" />
                  Download Membership Policy PDF
                </Link>
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                {/* TODO: Replace with actual PDF file */}
                Note: PDF placeholder - replace with actual membership policy document
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
