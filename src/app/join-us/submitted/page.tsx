'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Mail, Clock, Shield, FileCheck, MailCheck, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDarkMode } from '@/lib/useDarkMode';

export default function SubmittedPage() {
  const { getHomeLink } = useDarkMode();
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [homeLink, setHomeLink] = useState<string>('/');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      setIsVisible(true);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  useEffect(() => {
    setHomeLink(getHomeLink());
  }, [getHomeLink]);

  useEffect(() => {
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
  }, []);

  return (
    <div ref={sectionRef} className="min-h-screen skin-benefits-enhanced">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="max-w-3xl mx-auto">
          <Card 
            className="card-vibrant shadow-xl"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.8s ease-out 0.2s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s',
            }}
          >
            <CardContent className="p-8 md:p-12 text-center">
              {/* Success Icon */}
              <div 
                className="text-green-600 mb-6"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-180deg)',
                  transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.6s ease-out 0.4s, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s',
                }}
              >
                <CheckCircle2 className="h-20 w-20 mx-auto" />
              </div>

              {/* Headline */}
              <h1 
                className="text-3xl md:text-4xl lg:text-3xl font-bold text-brand-dark-blue mb-4"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                  transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 0.5s, transform 0.7s ease-out 0.5s',
                }}
              >
                Your join request has been submitted
              </h1>

              {/* Main Message */}
              <p 
                className="text-lg text-gray-700 mb-8 leading-relaxed"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(15px)',
                  transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 0.6s, transform 0.7s ease-out 0.6s',
                }}
              >
                The join request has been sent to the Admin Panel. Nothing has been charged yet. You will receive an email with further updates.
              </p>

              {/* What Happens Next */}
              <Card 
                className="card-vibrant mb-8 text-left"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                  transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 0.7s, transform 0.7s ease-out 0.7s',
                }}
              >
                <CardContent className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-brand-dark-blue mb-6 flex items-center gap-2">
                  <span className="text-brand-teal">What happens next?</span>
                </h2>
                <div className="space-y-6">
                  {[
                    { 
                      num: 1, 
                      icon: FileCheck,
                      title: 'Admin reviews your request', 
                      desc: 'Our team will review your application and verify your credentials.',
                      gradient: 'from-brand-teal to-brand-teal-dark'
                    },
                    { 
                      num: 2, 
                      icon: MailCheck,
                      title: 'You receive an email with approval/next steps', 
                      desc: 'We\'ll send you an email notification once your request has been reviewed.',
                      gradient: 'from-brand-blue-light to-brand-dark-blue'
                    },
                    { 
                      num: 3, 
                      icon: UserCheck,
                      title: 'After approval, you can activate membership and access your dashboard', 
                      desc: 'Once approved, you\'ll be able to complete payment and access your doctor dashboard.',
                      gradient: 'from-accent-emerald to-brand-teal'
                    },
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={index}
                        className="group relative flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-white to-gray-50/50 border-2 border-transparent hover:border-brand-teal/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                        style={{
                          opacity: isVisible ? 1 : 0,
                          transform: isVisible && !prefersReducedMotion ? 'translateX(0)' : 'translateX(-20px)',
                          transition: prefersReducedMotion
                            ? `opacity 0.3s ease ${index * 100}ms`
                            : `opacity 0.6s ease-out ${0.8 + index * 0.1}s, transform 0.6s ease-out ${0.8 + index * 0.1}s`,
                        }}
                      >
                        {/* Number Badge */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                          <span className="text-white font-bold text-lg">{item.num}</span>
                        </div>
                        
                        {/* Icon */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-teal/10 flex items-center justify-center group-hover:bg-brand-teal/20 transition-all duration-300">
                          <Icon className="h-5 w-5 text-brand-teal" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-brand-dark-blue mb-2 group-hover:text-brand-teal transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                  transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 1.1s, transform 0.7s ease-out 1.1s',
                }}
              >
                <Button
                  asChild
                  variant="gradient"
                >
                  <Link href={homeLink}>Return to Home</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                >
                  <Link href="/contact-us">Contact Support</Link>
                </Button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-muted-foreground">
                  Questions? Contact us at{' '}
                  <a
                    href="mailto:support@aip.com"
                    className="text-brand-teal hover:underline"
                  >
                    support@aip.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
