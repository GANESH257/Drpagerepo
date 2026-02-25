'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDarkMode } from '@/lib/useDarkMode';
import { useDoctorSession } from '@/lib/useDoctorSession';
import { getAdminSession } from '@/lib/adminSession';
import { LayoutDashboard } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { getHomeLink } = useDarkMode();
  const { isAuthenticated, getSession, getUser } = useDoctorSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [canAccessDashboard, setCanAccessDashboard] = useState(false);

  // Use pathname for initial render to avoid hydration mismatch
  // Then update based on localStorage preference after mount
  const [homeLink, setHomeLink] = useState<string>(() => {
    // Initial value based on current pathname (available on both server and client)
    if (pathname === '/homedark') return '/homedark';
    return '/';
  });

  // Only check scroll on home page
  const isHomePage = pathname === '/' || pathname === '/homedark';

  // Update home link after mount based on localStorage preference
  useEffect(() => {
    setHomeLink(getHomeLink());
  }, [getHomeLink, pathname]);

  // Check authentication status
  useEffect(() => {
    const authenticated = isAuthenticated();
    setIsLoggedIn(authenticated);
    setIsAdminLoggedIn(getAdminSession() !== null);
    
    // Check if user can access dashboard (must be doctor with doctorId)
    if (authenticated) {
      const user = getUser();
      setCanAccessDashboard(user?.role === 'doctor' && !!user?.doctorId);
    } else {
      setCanAccessDashboard(false);
    }

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      const auth = isAuthenticated();
      setIsLoggedIn(auth);
      setIsAdminLoggedIn(getAdminSession() !== null);
      
      if (auth) {
        const user = getUser();
        setCanAccessDashboard(user?.role === 'doctor' && !!user?.doctorId);
      } else {
        setCanAccessDashboard(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check periodically for admin session changes (for same-tab login/logout)
    const checkAdminSession = () => {
      setIsAdminLoggedIn(getAdminSession() !== null);
      
      // Also re-check dashboard access
      if (isAuthenticated()) {
        const user = getUser();
        setCanAccessDashboard(user?.role === 'doctor' && !!user?.doctorId);
      }
    };

    const interval = setInterval(checkAdminSession, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [pathname]);

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

  // Hide public navbar on dashboard, onboard, and admin pages (after all hooks)
  if (pathname.startsWith('/doctor/dashboard') || pathname.startsWith('/doctor/onboard') || pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { href: homeLink, label: 'Home', iconOnly: true },
    { href: '/patients', label: 'Patients' },
    { href: '/physicians', label: 'Physicians' },
    { href: '/about', label: 'About' },
    { href: '/contact-us', label: 'Contact' },
  ];

  const handleSignInClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (canAccessDashboard) {
      const user = getUser();
      if (user?.profileStatus === 'pending_profile') {
        router.push('/doctor/onboard');
      } else {
        router.push('/doctor/dashboard');
      }
    } else {
      router.push('/join-us');
    }
  };

  // Conditional classes based on scroll position and page
  // Always show solid navbar (removed transparent/invisible state)
  // Add shrink effect when scrolled
  const getHeaderClasses = () => {
    const base = 'fixed top-4 md:top-6 z-50 w-full transition-all duration-300';
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
        <div className={`flex items-center justify-between transition-all duration-300 flex-nowrap ${isScrolled ? 'h-20 md:h-24' : 'h-24 md:h-28'}`}>
          {/* Logo */}
          <Link href={homeLink} className="flex items-center space-x-2 flex-shrink-0 mr-4 lg:mr-6">
            <Image
              src="/logodrpnew.png"
              alt="Alliance of Independent Physicians"
              width={200}
              height={200}
              className="h-12 md:h-16 lg:h-20 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation - Right Side */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 flex-shrink-0 ml-auto mr-4">
            {navLinks.map((link, index) => {
              let isActive = false;

              // Check if this is the home link (could be / or /homedark)
              if (link.iconOnly || link.href === homeLink || link.href === '/' || link.href === '/homedark') {
                isActive = pathname === '/' || pathname === '/homedark';
              }
              // Check exact match first
              else if (pathname === link.href) {
                isActive = true;
              }
              // Check for sub-routes (like /join-us/application)
              else if (link.href === '/join-us' && pathname.startsWith('/join-us')) {
                isActive = true;
              }
              // Check if pathname starts with the link href (for nested routes)
              else if (pathname.startsWith(link.href) && link.href !== '/') {
                isActive = true;
              }

              return (
                <div key={link.href} className="flex items-center">
                  {index > 1 && !link.iconOnly && (
                    <span className="text-gray-300 mx-1 xl:mx-2">|</span>
                  )}
                  <Link
                    href={link.href}
                    className={`relative px-3 xl:px-4 py-1.5 xl:py-2 text-xs xl:text-sm font-semibold transition-all duration-200 whitespace-nowrap rounded-md flex items-center justify-center ${isActive
                      ? 'text-brand-dark-blue bg-brand-teal/30 font-bold border border-brand-teal/30'
                      : 'text-gray-700 hover:text-brand-dark-blue hover:bg-gray-50'
                      }`}
                    aria-label={link.iconOnly ? 'Home' : link.label}
                  >
                    {link.iconOnly ? (
                      <Home className={`h-4 w-4 xl:h-5 xl:w-5 ${isActive ? 'text-brand-dark-blue' : 'text-gray-700'}`} />
                    ) : (
                      <span className={isActive ? 'text-brand-dark-blue font-bold' : ''}>{link.label}</span>
                    )}
                    {isActive && (
                      <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 ${link.iconOnly ? 'w-full' : 'w-1/2'} h-1 bg-brand-teal rounded-full`} />
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 flex-shrink-0 mr-2 xl:mr-4">
            <Button
              asChild
              size="sm"
              className="text-xs xl:text-sm bg-brand-teal hover:bg-brand-teal/90 text-white transition-all whitespace-nowrap"
            >
              <Link href="/practices">Find a Practice</Link>
            </Button>
            {isAdminLoggedIn && (
              <Button
                asChild
                size="sm"
                className="text-xs xl:text-sm bg-[#0F5FA8] hover:bg-[#0F5FA8]/90 text-white transition-all whitespace-nowrap flex items-center gap-1.5"
              >
                <Link href="/admin">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Admin Dashboard
                </Link>
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="text-xs xl:text-sm border-brand-dark-blue text-brand-dark-blue hover:bg-brand-dark-blue hover:text-white transition-all whitespace-nowrap"
              onClick={handleSignInClick}
            >
              {canAccessDashboard ? 'Dashboard' : 'Sign In'}
            </Button>
          </div>

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
              {navLinks.map((link) => {
                let isActive = false;

                // Check if this is the home link (could be / or /homedark)
                if (link.iconOnly || link.href === homeLink || link.href === '/' || link.href === '/homedark') {
                  isActive = pathname === '/' || pathname === '/homedark';
                }
                // Check exact match first
                else if (pathname === link.href) {
                  isActive = true;
                }
                // Check for sub-routes (like /join-us/application)
                else if (link.href === '/join-us' && pathname.startsWith('/join-us')) {
                  isActive = true;
                }
                // Check if pathname starts with the link href (for nested routes)
                else if (pathname.startsWith(link.href) && link.href !== '/') {
                  isActive = true;
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors flex items-center gap-2 rounded-md px-3 py-2 ${isActive
                      ? 'text-brand-dark-blue bg-brand-teal/30 font-bold border border-brand-teal/30'
                      : `${mobileTextColorClasses} ${mobileHoverTextColorClasses}`
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.iconOnly && <Home className="h-4 w-4" />}
                    {link.iconOnly ? 'Home' : link.label}
                  </Link>
                );
              })}
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white"
                >
                  <Link href="/practices" onClick={() => setMobileMenuOpen(false)}>Find a Practice</Link>
                </Button>
                {isAdminLoggedIn && (
                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-[#0F5FA8] hover:bg-[#0F5FA8]/90 text-white flex items-center justify-center gap-2"
                  >
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <LayoutDashboard className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-brand-dark-blue text-brand-dark-blue hover:bg-brand-dark-blue hover:text-white"
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleSignInClick(e);
                  }}
                >
                  {canAccessDashboard ? 'Dashboard' : 'Sign In'}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
