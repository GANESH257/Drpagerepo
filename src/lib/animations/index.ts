/**
 * Animation utilities: GSAP + Locomotive, 3D scroll reveal, and re-exports.
 * Use initGSAPScrollTrigger from SmoothScrollWrapper (already wired).
 * Add data-3d-reveal to any section for 3D scroll-in; optional attributes:
 *   data-3d-reveal-delay, data-3d-reveal-duration, data-3d-reveal-y, data-3d-reveal-rotate-x,
 *   data-3d-reveal-stagger=".child-selector" for staggered children.
 */

export { gsap, ScrollTrigger, initGSAPScrollTrigger } from './gsapLocomotive';
export { init3DScrollReveals } from './scrollReveal3D';
