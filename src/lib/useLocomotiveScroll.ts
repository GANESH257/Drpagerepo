'use client';

import { useEffect, useRef } from 'react';
import LocomotiveScroll from 'locomotive-scroll';
import 'locomotive-scroll/dist/locomotive-scroll.css';

export function useLocomotiveScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const locomotiveScrollRef = useRef<LocomotiveScroll | null>(null);

  useEffect(() => {
    if (!scrollRef.current) return;

    const scrollEl = scrollRef.current;
    const contentEl = scrollEl.querySelector('[data-scroll-container]') || scrollEl;

    // Initialize Locomotive Scroll
    const locomotiveScroll = new LocomotiveScroll({
      el: contentEl as HTMLElement,
      smooth: true,
      smoothMobile: false, // Disable on mobile for better performance
      multiplier: 1,
      class: 'is-revealed',
      scrollbarContainer: null,
      resetNativeScroll: true,
      lerp: 0.1, // Linear interpolation for smoothness
      getSpeed: true,
      getDirection: true,
    });

    locomotiveScrollRef.current = locomotiveScroll;

    // Update on resize
    const handleResize = () => {
      locomotiveScroll.update();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      locomotiveScroll.destroy();
    };
  }, []);

  return { scrollRef, locomotiveScroll: locomotiveScrollRef.current };
}
