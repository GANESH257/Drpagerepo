'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface HelperNavProps {
  items: NavItem[];
  className?: string;
}

export function HelperNav({ items, className }: HelperNavProps) {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isSticky, setIsSticky] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Set up Intersection Observer to track which section is in view
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px', // Trigger when section is 20% from top
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe all sections
    items.forEach((item) => {
      const sectionId = item.href.replace('#', '');
      const element = document.getElementById(sectionId);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    // Track sticky state
    const handleScroll = () => {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 100); // Adjust based on header height
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [items]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const sectionId = href.replace('#', '');
    const element = document.getElementById(sectionId);
    
    if (element) {
      const headerOffset = 120; // Adjust based on header + nav height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav
      ref={navRef}
      className={cn(
        'sticky top-24 md:top-28 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 transition-shadow duration-200',
        isSticky && 'shadow-sm',
        className
      )}
      aria-label="Page navigation"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-4 py-3 md:py-4 overflow-x-auto scrollbar-hide">
          {items.map((item) => {
            const sectionId = item.href.replace('#', '');
            const isActive = activeSection === sectionId;
            
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleClick(e, item.href)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm md:text-base font-medium whitespace-nowrap transition-all duration-200',
                  'hover:bg-brand-teal/10 hover:text-brand-teal',
                  isActive
                    ? 'bg-brand-teal text-white shadow-md'
                    : 'text-gray-700 hover:text-brand-teal'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
