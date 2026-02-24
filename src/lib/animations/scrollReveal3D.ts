/**
 * 3D scroll reveal: animate elements with perspective and rotation when they enter view.
 * Use with GSAP + ScrollTrigger (after gsapLocomotive init).
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const ATTR = 'data-3d-reveal';

export function init3DScrollReveals(scrollContainer: HTMLElement | null): () => void {
  if (!scrollContainer || typeof document === 'undefined') return () => {};

  const els = scrollContainer.querySelectorAll<HTMLElement>(`[${ATTR}]`);
  const triggers: ScrollTrigger[] = [];

  els.forEach((el) => {
    const delay = parseFloat(el.getAttribute(`${ATTR}-delay`) || '0');
    const duration = parseFloat(el.getAttribute(`${ATTR}-duration`) || '0.9');
    const y = parseFloat(el.getAttribute(`${ATTR}-y`) || '48');
    const rotateX = parseFloat(el.getAttribute(`${ATTR}-rotate-x`) || '12');
    const staggerSelector = el.getAttribute(`${ATTR}-stagger`);
    const staggerChildren = staggerSelector ? el.querySelectorAll<HTMLElement>(staggerSelector) : [];

    if (staggerChildren.length > 0) {
      const fromVars = { opacity: 0, y, rotateX, transformPerspective: 800 };
      const toVars = { opacity: 1, y: 0, rotateX: 0, duration, delay, ease: 'power2.out' };
      const st = ScrollTrigger.create({
        trigger: el,
        scroller: scrollContainer,
        start: 'top 88%',
        onEnter: () => {
          gsap.fromTo(
            staggerChildren,
            fromVars,
            { ...toVars, stagger: 0.08, overwrite: true }
          );
        },
        once: true,
      });
      triggers.push(st);
    } else {
      const st = ScrollTrigger.create({
        trigger: el,
        scroller: scrollContainer,
        start: 'top 88%',
        onEnter: () => {
          gsap.fromTo(
            el,
            { opacity: 0, y, rotateX, transformPerspective: 800 },
            { opacity: 1, y: 0, rotateX: 0, duration, delay, ease: 'power2.out', overwrite: true }
          );
        },
        once: true,
      });
      triggers.push(st);
    }
  });

  ScrollTrigger.refresh();

  return () => {
    triggers.forEach((t) => t.kill());
  };
}
