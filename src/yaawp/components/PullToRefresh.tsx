// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDown, Check } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  threshold?: number;
  id?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  className = '',
  disabled = false,
  threshold = 60,
  id
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasRefreshedSuccess, setHasRefreshedSuccess] = useState(false);

  const startYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const MAX_PULL_DISTANCE = 110;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollTop <= 5) {
      startYRef.current = e.touches[0].clientY;
      isDraggingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || isRefreshing || disabled) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;

    if (diff > 0 && scrollTop <= 5) {
      setIsPulling(true);
      const distance = Math.min(MAX_PULL_DISTANCE, Math.pow(diff, 0.82) * 1.8);
      setPullDistance(distance);
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  const triggerRefresh = useCallback(async () => {
    setIsPulling(false);
    setIsRefreshing(true);
    setPullDistance(threshold);
    try {
      await onRefresh();
      setHasRefreshedSuccess(true);
      setTimeout(() => setHasRefreshedSuccess(false), 1600);
    } catch (err) {
      console.error('Pull to refresh error:', err);
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [onRefresh, threshold]);

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      triggerRefresh();
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  // Desktop mouse drag support
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || isRefreshing || e.button !== 0) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollTop <= 5) {
      startYRef.current = e.clientY;
      isDraggingRef.current = true;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || isRefreshing || disabled) return;
    const currentY = e.clientY;
    const diff = currentY - startYRef.current;
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;

    if (diff > 6 && scrollTop <= 5) {
      setIsPulling(true);
      const distance = Math.min(MAX_PULL_DISTANCE, Math.pow(diff, 0.82) * 1.8);
      setPullDistance(distance);
    }
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      triggerRefresh();
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  const isPastThreshold = pullDistance >= threshold;
  const rotationDeg = Math.min(180, (pullDistance / threshold) * 180);

  return (
    <div
      id={id}
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative w-full ${className}`}
    >
      {/* Pull-to-refresh Indicator Banner */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing || hasRefreshedSuccess) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{
              opacity: 1,
              y: Math.min(pullDistance, 70),
              transition: { type: 'spring', damping: 25, stiffness: 350 }
            }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            className="absolute top-2 left-0 right-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <div className="flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-xs font-semibold text-slate-700 dark:text-slate-200 backdrop-blur-xs">
              {hasRefreshedSuccess ? (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Updated</span>
                </div>
              ) : isRefreshing ? (
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600 dark:bg-indigo-400" />
                  </span>
                  <span>Refreshing...</span>
                </div>
              ) : isPastThreshold ? (
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <motion.div animate={{ rotate: 180 }} transition={{ duration: 0.15 }}>
                    <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                  </motion.div>
                  <span>Release to refresh</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <div style={{ transform: `rotate(${rotationDeg}deg)` }}>
                    <ArrowDown className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <span>Pull down to refresh</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content wrapper */}
      <div
        style={{
          transform: isPulling ? `translateY(${pullDistance * 0.38}px)` : 'none',
          transition: isPulling ? 'none' : 'transform 0.25s ease'
        }}
      >
        {children}
      </div>
    </div>
  );
};
