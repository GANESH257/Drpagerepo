'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const SLIDE_DISTANCE = 380;

/** Nav/site order: same-level switches use this to decide slide direction (right = next, left = prev). */
const ROUTE_ORDER = [
  '/',
  '/homedark',
  '/patients',
  '/physicians',
  '/about',
  '/contact-us',
  '/practices',
  '/join-us',
  '/doctors',
  '/medical-students',
  '/public-health',
  '/trustee-board',
  '/admin',
  '/doctor',
];

function pathDepth(path: string): number {
  return path.split('/').filter(Boolean).length;
}

/** Base path (first segment) for route-order comparison: "/patients/123" → "/patients", "/" → "/". */
function basePath(path: string): string {
  if (path === '/' || path === '') return '/';
  const seg = path.split('/').filter(Boolean)[0];
  return seg ? `/${seg}` : '/';
}

function routeOrderIndex(path: string): number {
  const base = basePath(path);
  const i = ROUTE_ORDER.indexOf(base);
  return i >= 0 ? i : ROUTE_ORDER.length;
}

/**
 * Forward = slide from right (deeper, or same level but "next" in nav order).
 * Back = slide from left (shallower, or same level but "previous" in nav order).
 */
function getSlideDirection(prevPath: string | null, nextPath: string): 'forward' | 'back' {
  if (!prevPath || prevPath === nextPath) return 'forward';

  const prevDepth = pathDepth(prevPath);
  const nextDepth = pathDepth(nextPath);

  if (nextDepth > prevDepth) return 'forward';
  if (nextDepth < prevDepth) return 'back';

  // Same depth: use route order (e.g. Patients → About = right, About → Patients = left)
  const prevOrder = routeOrderIndex(prevPath);
  const nextOrder = routeOrderIndex(nextPath);
  return nextOrder >= prevOrder ? 'forward' : 'back';
}

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  const direction = getSlideDirection(prevPathRef.current, pathname);
  const initialX = direction === 'forward' ? SLIDE_DISTANCE : -SLIDE_DISTANCE;

  useEffect(() => {
    prevPathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0.35, x: initialX }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 1.15,
        ease: [0.22, 0.61, 0.36, 1],
      }}
      className="min-h-full"
      style={{ willChange: 'transform' }}
    >
      {children}
    </motion.div>
  );
}
