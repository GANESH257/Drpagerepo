'use client';

import { useEffect, useRef, useState } from 'react';

interface ClickIndicator {
  x: number;
  y: number;
  id: number;
}

interface TrailPoint {
  x: number;
  y: number;
  id: number;
}

export function HandCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<HTMLDivElement[]>([]);
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [clicks, setClicks] = useState<ClickIndicator[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef<Array<{ x: number; y: number }>>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Check if mobile (768px and below)
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Initialize trail points
  useEffect(() => {
    if (!mounted) return;
    trailRef.current = Array(8).fill(null).map(() => ({ x: 0, y: 0 }));
  }, [mounted]);

  // Smooth cursor following with trail (only on desktop)
  useEffect(() => {
    if (!mounted || !cursorRef.current || isMobile) return;

    const cursor = cursorRef.current;
    const initialX = window.innerWidth / 2;
    const initialY = window.innerHeight / 2;
    targetRef.current = { x: initialX, y: initialY };
    currentRef.current = { x: initialX, y: initialY };
    
    // Initialize trail
    trailRef.current = trailRef.current.map(() => ({ x: initialX, y: initialY }));

    const lerpMain = 0.15; // Main cursor speed
    const lerpTrail = 0.25; // Trail following speed

    const onMove = (e: MouseEvent) => {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
    };

    const tick = () => {
      const target = targetRef.current;
      const current = currentRef.current;
      
      // Update main cursor
      current.x += (target.x - current.x) * lerpMain;
      current.y += (target.y - current.y) * lerpMain;
      cursor.style.left = `${current.x}px`;
      cursor.style.top = `${current.y}px`;

      // Update trail
      let prevX = current.x;
      let prevY = current.y;
      
      trailRef.current = trailRef.current.map((point) => {
        const newX = prevX + (point.x - prevX) * lerpTrail;
        const newY = prevY + (point.y - prevY) * lerpTrail;
        prevX = newX;
        prevY = newY;
        return { x: newX, y: newY };
      });

      // Update trail elements
      trailRefs.current.forEach((trailEl, index) => {
        if (trailEl && trailRef.current[index]) {
          const point = trailRef.current[index];
          trailEl.style.left = `${point.x}px`;
          trailEl.style.top = `${point.y}px`;
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMove);

    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [mounted, isMobile]);

  // Handle hover on interactive elements (only on desktop)
  useEffect(() => {
    if (!mounted || isMobile) return;

    const checkInteractiveElement = (target: EventTarget | null): boolean => {
      // Multiple safety checks
      if (!target) return false;
      if (typeof target !== 'object') return false;
      if (!('tagName' in target)) return false;
      if (!(target instanceof Element)) return false;
      
      const element = target as Element;
      
      // Check if closest method exists
      if (typeof element.closest !== 'function') return false;
      
      // Check tag name
      if (element.tagName === 'A' || element.tagName === 'BUTTON') {
        return true;
      }
      
      // Check if element or parent is interactive
      try {
        if (
          element.closest('a') ||
          element.closest('button') ||
          element.closest('[role="button"]') ||
          element.closest('[onclick]') ||
          (element.hasAttribute && element.hasAttribute('href'))
        ) {
          return true;
        }
      } catch (e) {
        // If closest fails, just return false
        return false;
      }
      
      return false;
    };

    const handleMouseOver = (e: MouseEvent) => {
      if (checkInteractiveElement(e.target)) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseOut = () => {
      setIsHovering(false);
    };

    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
    };
  }, [mounted, isMobile]);

  // Handle click animation and indicator (works on both desktop and mobile)
  useEffect(() => {
    if (!mounted) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (!isMobile) {
        setIsClicking(true);
      }
      // Always show click indicator on both desktop and mobile
      setClicks((prev) => [
        ...prev.slice(-3),
        { x: e.clientX, y: e.clientY, id: Date.now() },
      ]);
    };

    const handleMouseUp = () => {
      if (!isMobile) {
        setIsClicking(false);
      }
    };

    // Handle touch events for mobile
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setClicks((prev) => [
        ...prev.slice(-3),
        { x: touch.clientX, y: touch.clientY, id: Date.now() },
      ]);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [mounted, isMobile]);

  // Remove click indicators after animation
  useEffect(() => {
    if (clicks.length === 0) return;
    const timer = setTimeout(() => {
      setClicks((prev) => prev.slice(1));
    }, 800);
    return () => clearTimeout(timer);
  }, [clicks]);

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!mounted || prefersReducedMotion) return null;

  return (
    <>
      {/* Trail dots - only show on desktop */}
      {!isMobile && Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) trailRefs.current[i] = el;
          }}
          className="cursor-trail"
          style={{
            transform: 'translate(-50%, -50%)',
            opacity: 0.3 - i * 0.03,
            zIndex: 999998 - i,
          }}
          aria-hidden="true"
        />
      ))}

      {/* Main cursor - only show on desktop */}
      {!isMobile && (
        <div
          ref={cursorRef}
          className={`cool-cursor fixed pointer-events-none z-[999999] ${
            isClicking ? 'cursor-clicking' : ''
          } ${isHovering ? 'cursor-hovering' : ''}`}
          style={{ transform: 'translate(-50%, -50%)' }}
          aria-hidden="true"
        >
          <div className="cursor-outer"></div>
          <div className="cursor-inner"></div>
          <div className="cursor-dot"></div>
        </div>
      )}

      {/* Click Indicators - expanding rings (works on both desktop and mobile) */}
      {clicks.map((click) => (
        <div
          key={click.id}
          className="click-ring fixed pointer-events-none z-[999997]"
          style={{
            left: click.x,
            top: click.y,
            transform: 'translate(-50%, -50%)',
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}
