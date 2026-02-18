'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useDarkMode } from '@/lib/useDarkMode';

export function Footer() {
  const pathname = usePathname();
  const { getHomeLink } = useDarkMode();
  const currentYear = new Date().getFullYear();
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);
  
  // Use pathname for initial render to avoid hydration mismatch
  const [homeLink, setHomeLink] = useState<string>(() => {
    if (pathname === '/homedark') return '/homedark';
    return '/';
  });

  // Update home link after mount based on localStorage preference
  useEffect(() => {
    setHomeLink(getHomeLink());
  }, [getHomeLink, pathname]);

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

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={footerRef} className="skin-footer">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link 
              href={homeLink} 
              className="inline-block mb-6 focus-ring rounded-md p-1 -ml-1 transition-all duration-300 hover:scale-110"
              style={{
                opacity: isVisible ? 1 : 1,
                transform: isVisible ? 'scale(1)' : 'scale(1)',
                transition: 'opacity 0.6s ease-out 0.2s, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s',
              }}
            >
              <Image
                src="/logodrpnew.png"
                alt="Alliance of Independent Physicians"
                width={200}
                height={200}
                className="h-16 md:h-20 lg:h-24 w-auto drop-shadow-lg brightness-0 invert object-contain"
              />
            </Link>
            <p className="text-sm md:text-base text-white/80 max-w-md leading-relaxed mb-6">
              A trusted physician network and patient directory that supports referrals, collaboration, and easier access to quality care across specialties.
            </p>
            {/* Social Media Icons */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/70 font-medium">Follow Us:</span>
              <div className="flex items-center gap-3">
                {[
                  { 
                    icon: Facebook, 
                    href: 'https://facebook.com', 
                    label: 'Facebook',
                    ariaLabel: 'Follow us on Facebook'
                  },
                  { 
                    icon: Twitter, 
                    href: 'https://twitter.com', 
                    label: 'Twitter',
                    ariaLabel: 'Follow us on Twitter'
                  },
                  { 
                    icon: Linkedin, 
                    href: 'https://linkedin.com', 
                    label: 'LinkedIn',
                    ariaLabel: 'Follow us on LinkedIn'
                  },
                  { 
                    icon: Instagram, 
                    href: 'https://instagram.com', 
                    label: 'Instagram',
                    ariaLabel: 'Follow us on Instagram'
                  },
                ].map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.ariaLabel}
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-brand-teal flex items-center justify-center text-white/80 hover:text-white transition-all duration-300 focus-ring hover:scale-110 hover:shadow-lg"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'scale(1)' : 'scale(0)',
                        transition: `opacity 0.5s ease-out ${0.8 + index * 0.1}s, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.8 + index * 0.1}s`,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 md:mb-6 text-white text-base md:text-lg">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/practices"
                  className="text-sm md:text-base text-white/80 hover:text-brand-teal transition-colors duration-200 focus-ring rounded-md px-1 -ml-1 inline-block"
                >
                  Find a Practice
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm md:text-base text-white/80 hover:text-brand-teal transition-colors duration-200 focus-ring rounded-md px-1 -ml-1 inline-block"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/about#departments"
                  className="text-sm md:text-base text-white/80 hover:text-brand-teal transition-colors duration-200 focus-ring rounded-md px-1 -ml-1 inline-block"
                >
                  Medical Specialties
                </Link>
              </li>
              <li>
                <Link
                  href="/about#how-it-works"
                  className="text-sm md:text-base text-white/80 hover:text-brand-teal transition-colors duration-200 focus-ring rounded-md px-1 -ml-1 inline-block"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/about#faq"
                  className="text-sm md:text-base text-white/80 hover:text-brand-teal transition-colors duration-200 focus-ring rounded-md px-1 -ml-1 inline-block"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 md:mb-6 text-white text-base md:text-lg">Contact</h3>
            <ul className="space-y-3">
              {[
                { href: 'mailto:info@alliancephysicians.com', label: 'info@alliancephysicians.com' },
                { href: 'tel:+15551234567', label: '(555) 123-4567' },
              ].map((link, index) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm md:text-base text-white/80 hover:text-brand-teal transition-all duration-300 focus-ring rounded-md px-1 -ml-1 inline-block hover:translate-x-1"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                      transition: `opacity 0.5s ease-out ${0.6 + index * 0.1}s, transform 0.5s ease-out ${0.6 + index * 0.1}s`,
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 md:mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm md:text-base text-white/70">
            &copy; {currentYear} Alliance of Independent Physicians. All rights
            reserved.
          </p>
          <div className="flex gap-6 text-sm md:text-base">
            {[
              { href: '/privacy', label: 'Privacy Policy' },
              { href: '/terms', label: 'Terms of Service' },
            ].map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/70 hover:text-brand-teal transition-all duration-300 focus-ring rounded-md px-1 -ml-1 hover:translate-y-[-2px]"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                  transition: `opacity 0.5s ease-out ${0.8 + index * 0.1}s, transform 0.5s ease-out ${0.8 + index * 0.1}s`,
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
