'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Shield, Users, FileCheck, Settings, Building2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setAdminSession } from '@/lib/adminSession';
import { login } from '@/lib/api/auth';
import { useDarkMode } from '@/lib/useDarkMode';

export default function AdminLoginPage() {
  const router = useRouter();
  const { getHomeLink } = useDarkMode();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [homeLink, setHomeLink] = useState<string>('/');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHomeLink(getHomeLink());
  }, [getHomeLink]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login(email, password);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('aip_doctor_token', response.token);
        localStorage.setItem('aip_doctor_user', JSON.stringify(response.user));
      }

      setAdminSession(email);
      router.replace('/admin');
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Invalid email or password';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={sectionRef} className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden" data-scroll-section>
      {/* Left Panel: Vibrant Promotional Section */}
      <div className="lg:w-1/2 relative min-h-screen flex items-center justify-center p-8 lg:p-12 overflow-hidden">
        {/* Animated Gradient Background - AIP Brand Colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue via-brand-teal to-brand-dark-blue animate-gradient-shift" 
             style={{ backgroundSize: '200% 200%' }} />
        
        {/* Additional gradient layers for depth - AIP Brand Colors */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-teal/40 via-brand-dark-blue/50 to-brand-teal/30 animate-gradient-shift-reverse"
             style={{ backgroundSize: '200% 200%', animationDelay: '1s' }} />
        
        {/* Floating particles/dots pattern */}
        <div className="absolute inset-0 opacity-30 floating">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          } as React.CSSProperties} />
        </div>

        {/* Abstract 3D Shapes - AIP Brand Colors */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Concentric circles (like fingerprint/target) */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-brand-teal/40 to-brand-dark-blue/40 blur-2xl floating pulsate-bck-normal"
               style={{ animationDelay: '0s', transform: 'translate(-50%, -50%)' }} />
          
          {/* Oval floating shape */}
          <div className="absolute top-1/3 right-1/4 w-48 h-72 rounded-full bg-gradient-to-br from-brand-dark-blue/50 to-brand-teal/50 blur-3xl floating"
               style={{ animationDelay: '1.5s', borderRadius: '50% 40%', transform: 'translate(30%, -20%)' }} />
          
          {/* Additional blurred shapes */}
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-brand-teal/30 to-brand-dark-blue/30 blur-3xl floating"
               style={{ animationDelay: '2.5s' }} />
          
          <div className="absolute top-1/2 right-1/3 w-56 h-56 rounded-full bg-gradient-to-br from-brand-dark-blue/40 to-brand-teal/40 blur-2xl floating pulsate-bck-normal"
               style={{ animationDelay: '3s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg text-white" 
             style={{
               opacity: isVisible ? 1 : 0,
               transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
               transition: 'opacity 1s ease-out, transform 1s ease-out',
             }}>
          <div className="mb-8">
            {/* AIP Logo */}
            <div className="mb-8 flex justify-center lg:justify-start"
                 style={{
                   opacity: isVisible ? 1 : 0,
                   transform: isVisible ? 'scale(1)' : 'scale(0.9)',
                   transition: 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s',
                 }}>
              <Image
                src="/logodrpnew.png"
                alt="Alliance of Independent Physicians"
                width={300}
                height={100}
                className="h-16 md:h-20 lg:h-24 w-auto object-contain drop-shadow-2xl brightness-0 invert"
                priority
              />
            </div>

            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full mb-6 border border-white/30 shadow-lg">
              <Shield className="h-5 w-5 text-white pulsate-bck-normal" />
              <span className="text-sm font-semibold text-white">Admin Portal</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="block text-white drop-shadow-lg">
                Let's create
              </span>
              <span className="block text-white drop-shadow-lg">
                something
              </span>
              <span className="block bg-gradient-to-r from-white via-brand-teal to-white bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift text-shimmer">
                amazing
              </span>
              <span className="block text-white drop-shadow-lg">
                Work with Us
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 drop-shadow-md">
              Comprehensive administration tools for managing approval requests, practices, plans, and policies for the Alliance of Independent Physicians.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4">
            {[
              { icon: FileCheck, text: 'Approval Requests Management' },
              { icon: Building2, text: 'Practice Administration' },
              { icon: Users, text: 'Membership Plans' },
              { icon: Settings, text: 'Policy Updates' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index}
                  className="flex items-center gap-3 text-white/90"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateX(0)' : 'translateX(-30px)',
                    transition: `opacity 0.8s ease-out ${0.3 + index * 0.1}s, transform 0.8s ease-out ${0.3 + index * 0.1}s`,
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm md:text-base font-medium">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel: Clean Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white relative min-h-screen">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle, #0F5FA8 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          } as React.CSSProperties} />
        </div>

        <div className="w-full max-w-md relative z-10"
             style={{
               opacity: isVisible ? 1 : 0,
               transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
               transition: 'opacity 1s ease-out 0.3s, transform 1s ease-out 0.3s',
             }}>
          <Card className="w-full bg-white border-2 border-gray-100 rounded-3xl shadow-2xl card-vibrant overflow-hidden" data-scroll-exclude>
            {/* Shimmer effect overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            </div>

            <CardHeader className="pb-6 pt-8 px-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-brand-dark-blue/10 to-brand-teal/10 rounded-2xl relative overflow-hidden group/icon">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/icon:translate-x-full transition-transform duration-1000" />
                  <Shield className="h-7 w-7 text-brand-dark-blue relative z-10 icon-pulse-glow" />
                </div>
                <CardTitle className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-brand-dark-blue via-brand-teal to-brand-dark-blue bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
                    Sign In
                  </span>
                </CardTitle>
              </div>
              <CardDescription className="text-gray-600 text-base">
                Enter your admin credentials to access the portal
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-5" data-scroll-exclude>
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-700 text-sm font-medium animate-pulse">
                    {error}
                  </div>
                )}

                <div className="space-y-2" data-scroll-exclude>
                  <Label htmlFor="email" className="text-gray-700 font-semibold">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@aip.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full h-12 border-2 border-gray-200 focus:ring-2 focus:ring-brand-dark-blue focus:border-brand-dark-blue transition-all hover:border-brand-teal/50"
                    data-scroll-speed="0"
                  />
                </div>

                <div className="space-y-2" data-scroll-exclude>
                  <Label htmlFor="password" className="text-gray-700 font-semibold">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full h-12 pr-12 border-2 border-gray-200 focus:ring-2 focus:ring-brand-dark-blue focus:border-brand-dark-blue transition-all hover:border-brand-teal/50"
                      data-scroll-speed="0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 text-gray-500 hover:text-brand-dark-blue hover:bg-brand-dark-blue/10 rounded-lg transition-all"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      data-scroll-speed="0"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-brand-dark-blue via-brand-dark-blue/95 to-brand-dark-blue hover:from-brand-dark-blue/90 hover:via-brand-dark-blue hover:to-brand-dark-blue/90 text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group/btn"
                  disabled={isSubmitting}
                  data-scroll-speed="0"
                >
                  {/* Button shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Sign In
                      </>
                    )}
                  </span>
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <Link
                  href={homeLink}
                  className="text-sm text-brand-dark-blue hover:text-brand-teal hover:underline inline-flex items-center gap-2 font-medium transition-colors group/link"
                >
                  <span className="group-hover/link:-translate-x-1 transition-transform">←</span>
                  <span>Back to site</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
