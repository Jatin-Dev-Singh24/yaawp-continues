// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'motion/react';

export const AmbientCursor: React.FC = () => {
  const [hasMoved, setHasMoved] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const cursorX = useSpring(-500, { stiffness: 100, damping: 22 });
  const cursorY = useSpring(-500, { stiffness: 100, damping: 22 });

  useEffect(() => {
    // Check user preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);

    const handlePointerMove = (e: PointerEvent) => {
      if (mediaQuery.matches) return;
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!hasMoved) setHasMoved(true);

      // Update CSS variables for any elements using radial gradients
      const xPercent = ((e.clientX / window.innerWidth) * 100).toFixed(1) + '%';
      const yPercent = ((e.clientY / window.innerHeight) * 100).toFixed(1) + '%';
      document.documentElement.style.setProperty('--mouse-x', xPercent);
      document.documentElement.style.setProperty('--mouse-y', yPercent);

      // Local precision tracking on hovered ambient-glow cards and containers
      const targetGlow = (e.target as HTMLElement | null)?.closest?.('.ambient-glow') as HTMLElement | null;
      if (targetGlow) {
        const rect = targetGlow.getBoundingClientRect();
        targetGlow.style.setProperty('--local-mouse-x', `${(e.clientX - rect.left).toFixed(1)}px`);
        targetGlow.style.setProperty('--local-mouse-y', `${(e.clientY - rect.top).toFixed(1)}px`);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      mediaQuery.removeEventListener('change', listener);
    };
  }, [cursorX, cursorY, hasMoved]);

  if (reducedMotion || !hasMoved) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none transition-opacity duration-700"
    >
      {/* Primary soft atmospheric indigo-violet glow */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%'
        }}
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-500/12 via-purple-500/8 to-cyan-500/5 blur-3xl pointer-events-none"
      />

      {/* Secondary trailing subtle celestial ambient orb */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-40%',
          translateY: '-40%'
        }}
        transition={{ delay: 0.05 }}
        className="absolute w-[260px] h-[260px] rounded-full bg-indigo-400/8 blur-2xl pointer-events-none"
      />
    </div>
  );
};
