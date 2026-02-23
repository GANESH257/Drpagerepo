'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import LocomotiveScroll from 'locomotive-scroll';
import 'locomotive-scroll/dist/locomotive-scroll.css';

interface SmoothScrollWrapperProps {
  children: React.ReactNode;
}

export function SmoothScrollWrapper({ children }: SmoothScrollWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const locomotiveScrollRef = useRef<LocomotiveScroll | null>(null);
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize Locomotive Scroll (desktop only)
  useEffect(() => {
    if (!containerRef.current || isMobile) return;

    let locomotiveScroll: LocomotiveScroll | null = null;
    let handleResize: (() => void) | null = null;
    let handleWheel: ((e: WheelEvent) => void) | null = null;
    let handleTouchMove: ((e: TouchEvent) => void) | null = null;

    // Prevent Locomotive Scroll from capturing scroll events on excluded elements
    handleWheel = (e: WheelEvent) => {
      // Get the element at the pointer position (most accurate for hover detection)
      const elementAtPoint = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      
      // Find the closest scrollable excluded element
      let scrollableExcludedElement: HTMLElement | null = null;
      let current: HTMLElement | null = elementAtPoint;
      
      while (current && current !== document.body) {
        if (current.hasAttribute('data-scroll-exclude')) {
          const isScrollable = current.scrollHeight > current.clientHeight;
          if (isScrollable) {
            scrollableExcludedElement = current;
            break;
          }
        }
        current = current.parentElement;
      }
      
      // Only handle if we found a scrollable excluded element
      if (scrollableExcludedElement) {
        // Check if we can scroll in the direction of the wheel event
        const scrollTop = scrollableExcludedElement.scrollTop;
        const scrollHeight = scrollableExcludedElement.scrollHeight;
        const clientHeight = scrollableExcludedElement.clientHeight;
        const isAtTop = scrollTop <= 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
        const scrollingDown = e.deltaY > 0;
        const scrollingUp = e.deltaY < 0;
        
        // If we can scroll in this direction, prevent Locomotive Scroll and allow native scroll
        if ((scrollingDown && !isAtBottom) || (scrollingUp && !isAtTop)) {
          // Prevent Locomotive Scroll from handling this event
          // Don't prevent default - allow native browser scrolling
          e.stopPropagation();
          e.stopImmediatePropagation();
          return;
        }
        // At boundary - prevent Locomotive Scroll to avoid page scrolling when at boundaries
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }
      
      // No scrollable excluded element found - let the event pass through to Locomotive Scroll
      // This allows normal page scrolling when hovering over non-scrollable excluded elements
    };

    handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const excludedElement = target.closest('[data-scroll-exclude]') as HTMLElement;
      if (excludedElement) {
        const isScrollable = excludedElement.scrollHeight > excludedElement.clientHeight;
        if (isScrollable) {
          // Allow native touch scrolling on scrollable excluded elements
          e.stopPropagation();
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      locomotiveScroll = new LocomotiveScroll({
        el: containerRef.current as HTMLElement,
        smooth: true,
        smoothMobile: false,
        multiplier: 1,
        class: 'is-revealed',
        scrollbarContainer: null,
        resetNativeScroll: true,
        lerp: 0.1,
        getSpeed: true,
        getDirection: true,
      } as any);

      locomotiveScrollRef.current = locomotiveScroll;

      // Add event listeners to prevent Locomotive Scroll from capturing scroll on excluded elements
      // Use capture phase to intercept before Locomotive Scroll processes the event
      if (handleWheel) {
        // Add to document in capture phase to catch events before Locomotive Scroll
        document.addEventListener('wheel', handleWheel, { passive: false, capture: true });
      }
      if (handleTouchMove) {
        document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
      }

      // Initialize scroll reveal
      initScrollReveal(locomotiveScroll);

      // Update on resize
      handleResize = () => {
        // Locomotive Scroll v5 handles resize automatically
        initScrollReveal(locomotiveScroll);
      };

      window.addEventListener('resize', handleResize);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
      }
      // Remove event listeners
      if (handleWheel) {
        document.removeEventListener('wheel', handleWheel, { capture: true } as any);
      }
      if (handleTouchMove) {
        document.removeEventListener('touchmove', handleTouchMove, { capture: true } as any);
      }
      if (locomotiveScroll) {
        locomotiveScroll.destroy();
      }
    };
  }, [isMobile]);

  // Initialize scroll reveal with Intersection Observer
  const initScrollReveal = (scrollInstance: LocomotiveScroll | null) => {
    const sections = document.querySelectorAll('[data-scroll-section]');
    
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    sections.forEach((section) => {
      // Check if already visible
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 1.2) {
        section.classList.add('is-revealed');
      } else {
        observer.observe(section);
      }
    });

    // Locomotive Scroll v5 handles updates automatically
    // No need to manually call update
  };

  // Update scroll on route change
  useEffect(() => {
    if (locomotiveScrollRef.current && !isMobile) {
      setTimeout(() => {
        const scroll = locomotiveScrollRef.current;
        if (scroll) {
          // Scroll to top on route change
          if ('scrollTo' in scroll && typeof (scroll as any).scrollTo === 'function') {
            (scroll as any).scrollTo(0, { duration: 0 });
          } else {
            // Fallback: scroll the container directly
            if (containerRef.current) {
              containerRef.current.scrollTop = 0;
            }
          }
          initScrollReveal(scroll);
        }
      }, 200);
    } else if (isMobile) {
      // Use Intersection Observer for mobile
      setTimeout(() => {
        initScrollReveal(null);
      }, 200);
    }
  }, [pathname, isMobile]);

  return (
    <div 
      ref={containerRef} 
      data-scroll-container
      className={isMobile ? '' : 'locomotive-scroll'}
    >
      {children}
    </div>
  );
}
