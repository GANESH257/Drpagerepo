/**
 * GSAP ScrollTrigger integration with Locomotive Scroll (Lenis).
 * Call this after Locomotive Scroll is initialized so scroll-driven 3D and parallax work.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type LocomotiveScrollInstance = {
  lenisInstance?: {
    animatedScroll?: number;
    targetScroll?: number;
    scrollTo?: (n: number) => void;
    on: (e: string, fn: () => void) => void;
  } | null;
} | null;

/**
 * Connect GSAP ScrollTrigger to Locomotive Scroll so all ScrollTrigger animations
 * use the smooth-scroll position. Call once after Locomotive is created.
 */
export function initGSAPScrollTrigger(
  scrollContainer: HTMLElement,
  locomotiveInstance: LocomotiveScrollInstance
): () => void {
  const lenis = locomotiveInstance?.lenisInstance as any;
  if (!scrollContainer || !lenis) return () => {};

  const getScroll = () => lenis.animatedScroll ?? lenis.targetScroll ?? 0;
  const setScroll = (v: number) => {
    if (typeof lenis.scrollTo === 'function') lenis.scrollTo(v, { immediate: true });
  };

  ScrollTrigger.scrollerProxy(scrollContainer, {
    scrollTop(value) {
      if (arguments.length && setScroll) {
        setScroll(value as number);
      }
      return getScroll();
    },
    getBoundingClientRect() {
      return scrollContainer.getBoundingClientRect();
    },
  });

  const onScroll = () => ScrollTrigger.update();
  const offScroll = (lenis as any).on?.('scroll', onScroll);

  ScrollTrigger.defaults({ scroller: scrollContainer });
  ScrollTrigger.refresh();

  return () => {
    if (typeof offScroll === 'function') offScroll();
    ScrollTrigger.clearScrollMemory();
    ScrollTrigger.killAll();
  };
}

export { gsap, ScrollTrigger };
