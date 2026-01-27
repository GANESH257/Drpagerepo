'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-teal via-brand-teal/90 to-brand-dark-blue" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-blue/20 via-transparent to-brand-teal/20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to join the Alliance?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Start your membership journey today and connect with a community of independent physicians dedicated to excellence in healthcare.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              variant="gradient-multi"
              className="bg-white text-brand-teal hover:bg-gray-100 w-full sm:w-auto shadow-lg hover:shadow-xl"
              asChild
            >
              <Link href="/join-us">
                Join as Physician
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-brand-teal w-full sm:w-auto transition-all duration-200"
              asChild
            >
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
