'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Only check scroll on home page
  const isHomePage = pathname === '/';

  useEffect(() => {
    if (!isHomePage) {
      // Not on home page, always show solid navbar
      setIsScrolledPastHero(true);
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Hero section is approximately 600px-700px tall, use 650px as threshold
      const heroHeight = 650;
      setIsScrolledPastHero(scrollY > heroHeight);
      // Add shrink effect after small scroll
      setIsScrolled(scrollY > 50);
    };

    // Check initial scroll position
    handleScroll();

    // Add scroll event listener with passive option for performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHomePage]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/#departments', label: 'Medical Specialties' },
    { href: '/public-health', label: 'Public Health' },
    { href: '/medical-students', label: 'Students' },
    { href: '/trustee-board', label: 'Trustee Board' },
    { href: '/membership', label: 'Membership' },
    { href: '/contact-us', label: 'Contact' },
  ];

  // Conditional classes based on scroll position and page
  // Always show solid navbar (removed transparent/invisible state)
  // Add shrink effect when scrolled
  const getHeaderClasses = () => {
    const base = 'fixed top-10 md:top-12 z-50 w-full transition-all duration-300';
    const shadow = isScrolled ? 'shadow-md' : 'shadow-sm';
    
    // Always show solid navbar with background
    return `${base} border-b bg-background/95 backdrop-blur ${shadow}`;
  };
  
  const headerClasses = getHeaderClasses();

  // Always use standard text colors (navbar is always visible now)
  const textColorClasses = 'text-foreground/70';
  const hoverTextColorClasses = 'hover:text-primary';

  // Mobile menu always uses standard colors
  const mobileMenuBorderClasses = 'border-t';
  const mobileTextColorClasses = 'text-foreground/70';
  const mobileHoverTextColorClasses = 'hover:text-primary';

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between transition-all duration-300 flex-nowrap ${isScrolled ? 'h-14' : 'h-16'}`}>
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0 mr-4 lg:mr-6">
            <Image
              src="/logodrp.png"
              alt="Alliance of Independent Physicians"
              width={200}
              height={60}
              className="h-10 md:h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-3 xl:space-x-5 flex-shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${textColorClasses} ${hoverTextColorClasses}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 ${textColorClasses}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden ${mobileMenuBorderClasses} py-4`}>
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${mobileTextColorClasses} ${mobileHoverTextColorClasses}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
