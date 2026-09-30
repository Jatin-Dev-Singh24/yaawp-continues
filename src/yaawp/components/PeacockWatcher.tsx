// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useEffect, useState, useId, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

export interface PeacockWatcherProps {
  activeField: 'idle' | 'username' | 'email' | 'password' | 'confirmPassword';
  isTyping: boolean;
  isPasswordVisible: boolean;
  isConfirmPasswordVisible?: boolean;
}

// Data model for each radiating tail feather in the magnificent fan
interface TailFeatherConfig {
  id: number;
  angle: number; // In degrees from vertical (0 = straight up, negative = left, positive = right)
  length: number; // Length of quill from pivot
  ocellusScale: number;
  swayDelay: number;
  layer: 'back' | 'front';
}

export const PeacockWatcher: React.FC<PeacockWatcherProps> = ({
  activeField,
  isTyping,
  isPasswordVisible,
  isConfirmPasswordVisible = false,
}) => {
  const filterId = useId().replace(/:/g, '');
  const [isBlinking, setIsBlinking] = useState(false);
  const [ambientGlance, setAmbientGlance] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFlapped, setIsFlapped] = useState(false);
  const [peacockMood, setPeacockMood] = useState<'normal' | 'happy' | 'shy' | 'curious'>('normal');

  // Check user motion preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Track mouse position over peacock when idle for natural eye contact
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeField !== 'idle' || prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;
    const dx = Math.max(-5, Math.min(5, (e.clientX - centerX) / 24));
    const dy = Math.max(-4, Math.min(4, (e.clientY - centerY) / 20));
    setMouseOffset({ x: dx, y: dy });
  };

  // Natural spontaneous blinking when not sleeping/hidden
  useEffect(() => {
    if (prefersReducedMotion) return;
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.25) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 170);
      }
    }, 3800);

    return () => clearInterval(blinkInterval);
  }, [prefersReducedMotion]);

  // Subtle ambient micro-glances occasionally when idle
  useEffect(() => {
    if (prefersReducedMotion || activeField !== 'idle') {
      setAmbientGlance({ x: 0, y: 0 });
      return;
    }
    const glanceInterval = setInterval(() => {
      const rx = (Math.random() - 0.5) * 4;
      const ry = (Math.random() - 0.5) * 3;
      setAmbientGlance({ x: rx, y: ry });
      setTimeout(() => setAmbientGlance({ x: 0, y: 0 }), 1600);
    }, 4500);

    return () => clearInterval(glanceInterval);
  }, [activeField, prefersReducedMotion]);

  const isPasswordField = activeField === 'password' || activeField === 'confirmPassword';
  const currentPasswordVisible =
    activeField === 'confirmPassword' ? isConfirmPasswordVisible : isPasswordVisible;

  // React to field changes with mood
  useEffect(() => {
    if (isPasswordField) {
      if (!currentPasswordVisible) {
        setPeacockMood('shy');
      } else {
        setPeacockMood('curious');
      }
    } else if (activeField === 'username' || activeField === 'email') {
      setPeacockMood(isTyping ? 'happy' : 'curious');
    } else {
      setPeacockMood('normal');
    }
  }, [activeField, isPasswordField, currentPasswordVisible, isTyping]);

  // Click on peacock triggers a happy strut / tail fan flourish
  const handlePeacockClick = () => {
    setIsFlapped(true);
    setTimeout(() => setIsFlapped(false), 1400);
  };

  // Determine state of the eyes, head, and wings
  let leftEyeClosed = false;
  let rightEyeClosed = false;
  let pupilOffsetX = 0;
  let pupilOffsetY = 0;
  let headRotate = 0;
  let headTranslateX = 0;
  let headTranslateY = 0;
  let leftWingCovering = false;
  let rightWingCovering = false;

  if (isPasswordField) {
    if (!currentPasswordVisible) {
      // Hidden password: Both eyes tightly closed, wings raised to shield eyes respectfully ("No peeking!")
      leftEyeClosed = true;
      rightEyeClosed = true;
      leftWingCovering = true;
      rightWingCovering = true;
      headRotate = -6;
      headTranslateX = -4;
      headTranslateY = 2;
      pupilOffsetX = 0;
      pupilOffsetY = 0;
    } else {
      // Visible password: One wing lowered, head peeking around mischievously, right eye looking sideways
      leftEyeClosed = true; // Far eye stays shut
      rightEyeClosed = false; // Near eye peeks out curiously!
      leftWingCovering = true;
      rightWingCovering = false;
      headRotate = 7;
      headTranslateX = 5;
      headTranslateY = 2;
      pupilOffsetX = isTyping ? 5 : 3.5;
      pupilOffsetY = 3;
    }
  } else if (activeField === 'username' || activeField === 'email') {
    // Both eyes wide open, curious, looking downward toward the input field
    leftEyeClosed = isBlinking;
    rightEyeClosed = isBlinking;
    headRotate = -2.5;
    headTranslateX = 0;
    headTranslateY = 3.5;
    pupilOffsetX = isTyping ? -1 : 0;
    pupilOffsetY = isTyping ? 4.5 : 3.2;
    leftWingCovering = false;
    rightWingCovering = false;
  } else {
    // Idle state: Poised, calm, friendly gaze following user or ambient
    leftEyeClosed = isBlinking;
    rightEyeClosed = isBlinking;
    headRotate = (mouseOffset.x * 0.4);
    headTranslateX = (mouseOffset.x * 0.2);
    headTranslateY = (mouseOffset.y * 0.2);
    pupilOffsetX = mouseOffset.x !== 0 ? mouseOffset.x : ambientGlance.x;
    pupilOffsetY = mouseOffset.y !== 0 ? mouseOffset.y : ambientGlance.y;
    leftWingCovering = false;
    rightWingCovering = false;
  }

  // 15 Magnificent Radiating Feathers arranged in a full semicircular fanning arch
  const tailFeathers: TailFeatherConfig[] = useMemo(() => {
    return [
      // Outer back layer (spread wider)
      { id: 1, angle: -68, length: 132, ocellusScale: 0.88, swayDelay: 0.1, layer: 'back' },
      { id: 2, angle: -56, length: 142, ocellusScale: 0.94, swayDelay: 0.2, layer: 'back' },
      { id: 3, angle: -42, length: 152, ocellusScale: 1.0, swayDelay: 0.3, layer: 'back' },
      { id: 4, angle: -28, length: 160, ocellusScale: 1.04, swayDelay: 0.4, layer: 'back' },
      { id: 5, angle: -14, length: 164, ocellusScale: 1.06, swayDelay: 0.5, layer: 'back' },
      { id: 6, angle: 0, length: 166, ocellusScale: 1.08, swayDelay: 0.6, layer: 'back' },
      { id: 7, angle: 14, length: 164, ocellusScale: 1.06, swayDelay: 0.7, layer: 'back' },
      { id: 8, angle: 28, length: 160, ocellusScale: 1.04, swayDelay: 0.8, layer: 'back' },
      { id: 9, angle: 42, length: 152, ocellusScale: 1.0, swayDelay: 0.9, layer: 'back' },
      { id: 10, angle: 56, length: 142, ocellusScale: 0.94, swayDelay: 1.0, layer: 'back' },
      { id: 11, angle: 68, length: 132, ocellusScale: 0.88, swayDelay: 1.1, layer: 'back' },

      // Inner front layer (interspersed, slightly shorter to create rich depth)
      { id: 12, angle: -48, length: 120, ocellusScale: 0.85, swayDelay: 0.25, layer: 'front' },
      { id: 13, angle: -22, length: 128, ocellusScale: 0.92, swayDelay: 0.45, layer: 'front' },
      { id: 14, angle: 22, length: 128, ocellusScale: 0.92, swayDelay: 0.75, layer: 'front' },
      { id: 15, angle: 48, length: 120, ocellusScale: 0.85, swayDelay: 0.95, layer: 'front' },
    ];
  }, []);

  // Spring physics transition
  const smoothTransition: any = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 140, damping: 18, mass: 0.85 };

  // Wing transition: multi-keyframe flutter uses easeInOut tween, while eye cover/rest uses spring
  const wingTransition: any = prefersReducedMotion
    ? { duration: 0 }
    : isFlapped
    ? { duration: 0.65, ease: 'easeInOut' }
    : { type: 'spring', stiffness: 140, damping: 18, mass: 0.85 };

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none w-full max-w-[340px] sm:max-w-[380px] mx-auto overflow-visible cursor-pointer group"
      onClick={handlePeacockClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMouseOffset({ x: 0, y: 0 });
      }}
      title="Click to flutter peacock tail!"
      aria-label="Interactive Peacock Companion"
      role="img"
    >
      <svg
        viewBox="0 0 360 270"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto overflow-visible drop-shadow-[0_10px_28px_rgba(0,0,0,0.55)] transition-transform duration-300 group-hover:scale-[1.02]"
      >
        <defs>
          {/* Rich Royal Cobalt Peacock Body Gradient */}
          <linearGradient id={`${filterId}-royal-body`} x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="35%" stopColor="#1d4ed8" />
            <stop offset="70%" stopColor="#0f766e" />
            <stop offset="100%" stopColor="#042f2e" />
          </linearGradient>

          {/* S-Neck Gradient with Specular Sheen */}
          <linearGradient id={`${filterId}-royal-neck`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="70%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Shimmering Metallic Gold */}
          <linearGradient id={`${filterId}-pure-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="85%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>

          {/* Emerald Plumage Leaf / Covert Gradient */}
          <linearGradient id={`${filterId}-emerald-plume`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="35%" stopColor="#059669" />
            <stop offset="80%" stopColor="#047857" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>

          {/* Feather Vane Iridescent Fringe */}
          <linearGradient id={`${filterId}-feather-vane`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="40%" stopColor="#0d9488" />
            <stop offset="80%" stopColor="#065f46" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>

          {/* Multi-layered Feather Eye (Ocellus) Radial Gradient */}
          <radialGradient id={`${filterId}-ocellus-iris`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="30%" stopColor="#1e1b4b" />
            <stop offset="55%" stopColor="#312e81" />
            <stop offset="72%" stopColor="#eab308" />
            <stop offset="85%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#065f46" />
          </radialGradient>

          {/* Wing Specular Layer */}
          <linearGradient id={`${filterId}-wing-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="30%" stopColor="#0369a1" />
            <stop offset="70%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>

          {/* Soft Shadow Filter for Natural Perch and Plumage */}
          <filter id={`${filterId}-drop-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.4" />
          </filter>

          {/* Glowing Aura for Grand Tail Spread */}
          <radialGradient id={`${filterId}-aura`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* --- Aura Radiance Behind Majestic Fan --- */}
        <circle cx="180" cy="185" r="145" fill={`url(#${filterId}-aura)`} pointerEvents="none" />

        {/* =========================================================================
            SECTION 1: THE GRAND FANNING TAIL (15 Radiant Iridescent Feathers)
            Pivot origin at base (180, 215)
           ========================================================================= */}
        <motion.g
          id="peacock-tail-fan"
          animate={
            prefersReducedMotion
              ? {}
              : isFlapped
              ? { scale: [1, 1.08, 0.98, 1.04, 1], rotate: [0, -2, 2, -1, 0] }
              : isHovered
              ? { scale: 1.04, y: -3 }
              : isTyping
              ? {
                  scale: [1, 1.025, 0.99, 1.02, 1],
                  rotate: [0, -0.8, 0.8, -0.4, 0],
                }
              : {
                  scale: [1, 1.015, 1],
                  rotate: [0, 0.5, 0, -0.5, 0],
                }
          }
          transition={{
            duration: isFlapped ? 1.2 : isTyping ? 1.8 : 5.5,
            repeat: isFlapped ? 0 : Infinity,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: '180px 215px' }}
        >
          {tailFeathers.map((feather, idx) => {
            const rad = (feather.angle * Math.PI) / 180;
            const tipX = 180 + Math.sin(rad) * feather.length;
            const tipY = 215 - Math.cos(rad) * feather.length;
            const midX = 180 + Math.sin(rad) * (feather.length * 0.55);
            const midY = 215 - Math.cos(rad) * (feather.length * 0.55);

            // Perpendicular vector for feather vane fullness
            const perpX = -Math.cos(rad);
            const perpY = -Math.sin(rad);
            const vaneWidth = 14 * feather.ocellusScale;

            return (
              <motion.g
                key={feather.id}
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        rotate: [
                          0,
                          (idx % 2 === 0 ? 1.8 : -1.8) * (isHovered ? 1.5 : 1),
                          0,
                        ],
                      }
                }
                transition={{
                  duration: 3.8 + (idx % 4) * 0.4,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                  delay: feather.swayDelay,
                }}
                style={{ transformOrigin: '180px 215px' }}
              >
                {/* 1. Feather Quill Shaft */}
                <line
                  x1="180"
                  y1="215"
                  x2={tipX}
                  y2={tipY}
                  stroke="#fbbf24"
                  strokeWidth="1.2"
                  strokeOpacity="0.75"
                />

                {/* 2. Feather Vane Leaf Plume (Curved blade surrounding the shaft) */}
                <path
                  d={`
                    M 180 215
                    Q ${midX + perpX * vaneWidth} ${midY + perpY * vaneWidth} ${tipX} ${tipY}
                    Q ${midX - perpX * vaneWidth} ${midY - perpY * vaneWidth} 180 215
                    Z
                  `}
                  fill={`url(#${filterId}-feather-vane)`}
                  stroke={`url(#${filterId}-pure-gold)`}
                  strokeWidth="0.6"
                  strokeOpacity="0.5"
                  opacity={feather.layer === 'back' ? 0.92 : 0.98}
                />

                {/* Fine Barbule Ribs / Texture Details */}
                <line
                  x1={midX - perpX * (vaneWidth * 0.6)}
                  y1={midY - perpY * (vaneWidth * 0.6)}
                  x2={midX + perpX * (vaneWidth * 0.6)}
                  y2={midY + perpY * (vaneWidth * 0.6)}
                  stroke="#fef08a"
                  strokeWidth="0.4"
                  strokeOpacity="0.45"
                />

                {/* 3. The Grand Peacock Eye (Ocellus) at the feather tip */}
                <g transform={`translate(${tipX}, ${tipY}) rotate(${feather.angle}) scale(${feather.ocellusScale})`}>
                  {/* Outer Emerald Vane Halo */}
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="14"
                    ry="18"
                    fill={`url(#${filterId}-emerald-plume)`}
                    stroke={`url(#${filterId}-pure-gold)`}
                    strokeWidth="1.2"
                  />

                  {/* Golden Bronze Ring */}
                  <ellipse cx="0" cy="-1" rx="10.5" ry="13.5" fill={`url(#${filterId}-pure-gold)`} />

                  {/* Turquoise Inner Aura */}
                  <ellipse cx="0" cy="-1" rx="8" ry="10.5" fill="#06b6d4" />

                  {/* Deep Sapphire Midnight Pupil */}
                  <ellipse cx="0" cy="0" rx="5.5" ry="7.5" fill="#1e1b4b" />

                  {/* Sparkling Violet Center & Catchlight */}
                  <circle cx="0" cy="1" r="3.2" fill="#4338ca" />
                  <circle cx="-1.5" cy="-2" r="1.6" fill="#ffffff" opacity="0.9" />
                  <circle cx="1.8" cy="2" r="0.9" fill="#93c5fd" opacity="0.8" />
                </g>
              </motion.g>
            );
          })}
        </motion.g>

        {/* Covert Body Tuft Behind Lower Back */}
        <g id="peacock-covert-tuft" opacity="0.95">
          <ellipse cx="180" cy="214" rx="42" ry="16" fill={`url(#${filterId}-emerald-plume)`} />
          <path
            d="M 148 214 Q 180 226 212 214 Q 180 206 148 214 Z"
            fill={`url(#${filterId}-pure-gold)`}
            opacity="0.6"
          />
        </g>

        {/* =========================================================================
            SECTION 2: WOODEN PERCH & CUTE GOLDEN CLAWS
           ========================================================================= */}
        <g id="peacock-perch">
          {/* Ambient Perch Shadow */}
          <ellipse cx="180" cy="242" rx="72" ry="9" fill="#000000" opacity="0.45" />

          {/* Polished Perch Bar */}
          <rect
            x="110"
            y="232"
            width="140"
            height="10"
            rx="5"
            fill="#1e293b"
            stroke={`url(#${filterId}-pure-gold)`}
            strokeWidth="1"
            strokeOpacity="0.6"
          />
          <line x1="120" y1="237" x2="240" y2="237" stroke="#334155" strokeWidth="1" />

          {/* Left Foot Claws */}
          <g transform="translate(162, 230)">
            <path d="M -6 0 L -8 6 M -1 0 L -1 7 M 4 0 L 6 6" stroke={`url(#${filterId}-pure-gold)`} strokeWidth="2.2" strokeLinecap="round" />
          </g>

          {/* Right Foot Claws */}
          <g transform="translate(198, 230)">
            <path d="M -4 0 L -6 6 M 1 0 L 1 7 M 6 0 L 8 6" stroke={`url(#${filterId}-pure-gold)`} strokeWidth="2.2" strokeLinecap="round" />
          </g>
        </g>

        {/* =========================================================================
            SECTION 3: PEACOCK BODY (BREAST, CHEST SCALES, AND FLAPPABLE WINGS)
           ========================================================================= */}
        <motion.g
          id="peacock-torso"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  scaleY: [1, 1.018, 1],
                  y: [0, -1, 0],
                }
          }
          transition={{
            duration: 4.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: '180px 225px' }}
        >
          {/* Main Rounded Royal Body Oval */}
          <ellipse
            cx="180"
            cy="195"
            rx="36"
            ry="40"
            fill={`url(#${filterId}-royal-body)`}
            stroke={`url(#${filterId}-pure-gold)`}
            strokeWidth="1"
            strokeOpacity="0.7"
          />

          {/* Breast Feathers / Iridescent Chest Chevron Scales */}
          <g opacity="0.85">
            {/* Tier 1 Scales */}
            <path d="M 166 182 Q 180 190 194 182" stroke={`url(#${filterId}-pure-gold)`} strokeWidth="1.3" strokeLinecap="round" fill="none" />
            <path d="M 162 192 Q 180 202 198 192" stroke={`url(#${filterId}-pure-gold)`} strokeWidth="1.3" strokeLinecap="round" fill="none" />
            <path d="M 166 202 Q 180 212 194 202" stroke={`url(#${filterId}-pure-gold)`} strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M 172 212 Q 180 219 188 212" stroke={`url(#${filterId}-pure-gold)`} strokeWidth="1.1" strokeLinecap="round" fill="none" />

            {/* Shimmering Center Crest Medallion on Chest */}
            <ellipse cx="180" cy="186" rx="4" ry="5.5" fill={`url(#${filterId}-ocellus-iris)`} stroke={`url(#${filterId}-pure-gold)`} strokeWidth="0.8" />
          </g>

          {/* --- LEFT WING (Interactive: Folds on side OR lifts to cover eyes) --- */}
          <motion.g
            id="peacock-left-wing"
            animate={
              leftWingCovering
                ? {
                    // Wing reaches up adorably to cover the left eye
                    rotate: 46,
                    x: 18,
                    y: -65,
                    scale: 1.08,
                  }
                : isFlapped
                ? {
                    rotate: [-15, 20, -10, 15, 0],
                    x: [0, -6, 2, -4, 0],
                  }
                : {
                    rotate: 0,
                    x: 0,
                    y: 0,
                    scale: 1,
                  }
            }
            transition={wingTransition}
            style={{ transformOrigin: '150px 185px' }}
          >
            {/* Wing Base */}
            <path
              d="M 152 170 C 130 180 132 212 148 226 C 158 218 160 195 158 175 Z"
              fill={`url(#${filterId}-wing-gradient)`}
              stroke={`url(#${filterId}-pure-gold)`}
              strokeWidth="0.9"
            />
            {/* Primary Flight Feather Lines */}
            <path d="M 142 190 Q 146 210 152 220" stroke="#fef08a" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.6" />
            <path d="M 136 198 Q 140 212 148 218" stroke="#fef08a" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.6" />
            {/* Wing Tip Ocellus Accent */}
            <circle cx="145" cy="214" r="3.2" fill={`url(#${filterId}-ocellus-iris)`} stroke="#fbbf24" strokeWidth="0.6" />
          </motion.g>

          {/* --- RIGHT WING (Interactive: Folds on side OR lifts to cover eyes) --- */}
          <motion.g
            id="peacock-right-wing"
            animate={
              rightWingCovering
                ? {
                    // Wing reaches up adorably to cover the right eye
                    rotate: -46,
                    x: -18,
                    y: -65,
                    scale: 1.08,
                  }
                : isFlapped
                ? {
                    rotate: [15, -20, 10, -15, 0],
                    x: [0, 6, -2, 4, 0],
                  }
                : {
                    rotate: 0,
                    x: 0,
                    y: 0,
                    scale: 1,
                  }
            }
            transition={wingTransition}
            style={{ transformOrigin: '210px 185px' }}
          >
            {/* Wing Base */}
            <path
              d="M 208 170 C 230 180 228 212 212 226 C 202 218 200 195 202 175 Z"
              fill={`url(#${filterId}-wing-gradient)`}
              stroke={`url(#${filterId}-pure-gold)`}
              strokeWidth="0.9"
            />
            {/* Primary Flight Feather Lines */}
            <path d="M 218 190 Q 214 210 208 220" stroke="#fef08a" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.6" />
            <path d="M 224 198 Q 220 212 212 218" stroke="#fef08a" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.6" />
            {/* Wing Tip Ocellus Accent */}
            <circle cx="215" cy="214" r="3.2" fill={`url(#${filterId}-ocellus-iris)`} stroke="#fbbf24" strokeWidth="0.6" />
          </motion.g>
        </motion.g>

        {/* =========================================================================
            SECTION 4: GRACEFUL S-NECK, HEAD ASSEMBLY, EXPRESSIVE EYES & CROWN
           ========================================================================= */}
        <motion.g
          id="peacock-head-neck-assembly"
          animate={{
            rotate: headRotate + (isFlapped ? 6 : 0),
            x: headTranslateX,
            y: headTranslateY,
          }}
          transition={smoothTransition}
          style={{ transformOrigin: '180px 170px' }}
        >
          {/* Graceful S-Curved Royal Blue Neck */}
          <path
            d="
              M 172 170
              C 168 140 166 115 171 96
              C 174 95 186 95 189 96
              C 194 115 192 140 188 170
              Z
            "
            fill={`url(#${filterId}-royal-neck)`}
            stroke={`url(#${filterId}-pure-gold)`}
            strokeWidth="0.8"
            strokeOpacity="0.6"
          />

          {/* Neck Specular Highlight */}
          <path
            d="M 178 105 Q 180 135 178 160"
            stroke="#93c5fd"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.45"
            fill="none"
          />

          {/* Cute Head Shape */}
          <ellipse
            cx="180"
            cy="88"
            rx="18"
            ry="19"
            fill={`url(#${filterId}-royal-neck)`}
            stroke={`url(#${filterId}-pure-gold)`}
            strokeWidth="1"
          />

          {/* --- MAGNIFICENT CROWN AIGRETTE (5 Fan Plumes with Jewel Tips) --- */}
          <g id="peacock-crest-crown">
            {[
              { angle: -24, length: 26, delay: 0 },
              { angle: -12, length: 30, delay: 0.1 },
              { angle: 0, length: 32, delay: 0.2 },
              { angle: 12, length: 30, delay: 0.3 },
              { angle: 24, length: 26, delay: 0.4 },
            ].map((plume, i) => {
              const rad = (plume.angle * Math.PI) / 180;
              const px = 180 + Math.sin(rad) * plume.length;
              const py = 72 - Math.cos(rad) * plume.length;

              return (
                <motion.g
                  key={i}
                  animate={
                    prefersReducedMotion
                      ? {}
                      : {
                          rotate: [0, (i % 2 === 0 ? 3 : -3), 0],
                        }
                  }
                  transition={{
                    duration: 2.8 + i * 0.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: plume.delay,
                  }}
                  style={{ transformOrigin: '180px 72px' }}
                >
                  {/* Delicate Golden Plume Shaft */}
                  <line x1="180" y1="72" x2={px} y2={py} stroke="#fbbf24" strokeWidth="1.1" />

                  {/* Luminous Fanette Jewel at Plume Tip */}
                  <circle cx={px} cy={py} r="3.4" fill={`url(#${filterId}-pure-gold)`} stroke="#047857" strokeWidth="0.6" />
                  <circle cx={px} cy={py} r="2.2" fill="#06b6d4" />
                  <circle cx={px - 0.7} cy={py - 0.7} r="0.8" fill="#ffffff" />
                </motion.g>
              );
            })}
          </g>

          {/* White Facial Feather Mask Contour Around Eyes */}
          <path
            d="M 165 86 Q 170 82 175 86"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
          <path
            d="M 185 86 Q 190 82 195 86"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />

          {/* --- CUTE SHY BLUSH MARKS (Visible when shy / hiding) --- */}
          <motion.g
            animate={{
              opacity: peacockMood === 'shy' ? 0.85 : 0.2,
              scale: peacockMood === 'shy' ? 1.1 : 0.9,
            }}
            transition={{ duration: 0.3 }}
          >
            <ellipse cx="166" cy="94" rx="4" ry="2.2" fill="#fb7185" />
            <ellipse cx="194" cy="94" rx="4" ry="2.2" fill="#fb7185" />
          </motion.g>

          {/* --- LEFT EYE (Almond Cartoon Eye with Shiny Catchlight) --- */}
          <g id="peacock-left-eye" transform="translate(170, 86)">
            {leftEyeClosed ? (
              // Shy Curved Closed Eyelash
              <motion.path
                d="M -5 1 Q 0 5 5 1"
                stroke={`url(#${filterId}-pure-gold)`}
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.15 }}
              />
            ) : (
              // Wide Expressive Open Eye
              <g>
                {/* White Sclera */}
                <ellipse cx="0" cy="0" rx="6" ry="6.8" fill="#ffffff" stroke="#0f172a" strokeWidth="0.9" />

                {/* Sparkling Turquoise / Indigo Iris */}
                <motion.circle
                  cx={pupilOffsetX * 0.4}
                  cy={pupilOffsetY * 0.35}
                  r="3.8"
                  fill="#0284c7"
                  stroke="#1e1b4b"
                  strokeWidth="0.8"
                  animate={{
                    cx: pupilOffsetX * 0.4,
                    cy: pupilOffsetY * 0.35,
                  }}
                  transition={{ duration: 0.2 }}
                />

                {/* Deep Pupil */}
                <motion.circle
                  cx={pupilOffsetX * 0.4}
                  cy={pupilOffsetY * 0.35}
                  r="2.4"
                  fill="#09090b"
                  animate={{
                    cx: pupilOffsetX * 0.4,
                    cy: pupilOffsetY * 0.35,
                  }}
                  transition={{ duration: 0.2 }}
                />

                {/* Big Glossy Catchlights (Gives life and warmth to character) */}
                <circle cx={(pupilOffsetX * 0.4) - 1.2} cy={(pupilOffsetY * 0.35) - 1.2} r="1.2" fill="#ffffff" />
                <circle cx={(pupilOffsetX * 0.4) + 1.2} cy={(pupilOffsetY * 0.35) + 1.2} r="0.6" fill="#ffffff" />
              </g>
            )}
          </g>

          {/* --- RIGHT EYE (Almond Cartoon Eye with Shiny Catchlight) --- */}
          <g id="peacock-right-eye" transform="translate(190, 86)">
            {rightEyeClosed ? (
              // Shy Curved Closed Eyelash
              <motion.path
                d="M -5 1 Q 0 5 5 1"
                stroke={`url(#${filterId}-pure-gold)`}
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.15 }}
              />
            ) : (
              // Wide Expressive Open Eye
              <g>
                {/* White Sclera */}
                <ellipse cx="0" cy="0" rx="6" ry="6.8" fill="#ffffff" stroke="#0f172a" strokeWidth="0.9" />

                {/* Sparkling Turquoise / Indigo Iris */}
                <motion.circle
                  cx={pupilOffsetX * 0.55}
                  cy={pupilOffsetY * 0.4}
                  r="3.8"
                  fill="#0284c7"
                  stroke="#1e1b4b"
                  strokeWidth="0.8"
                  animate={{
                    cx: pupilOffsetX * 0.55,
                    cy: pupilOffsetY * 0.4,
                  }}
                  transition={{ duration: 0.2 }}
                />

                {/* Deep Pupil */}
                <motion.circle
                  cx={pupilOffsetX * 0.55}
                  cy={pupilOffsetY * 0.4}
                  r="2.4"
                  fill="#09090b"
                  animate={{
                    cx: pupilOffsetX * 0.55,
                    cy: pupilOffsetY * 0.4,
                  }}
                  transition={{ duration: 0.2 }}
                />

                {/* Big Glossy Catchlights */}
                <circle cx={(pupilOffsetX * 0.55) - 1.2} cy={(pupilOffsetY * 0.4) - 1.2} r="1.2" fill="#ffffff" />
                <circle cx={(pupilOffsetX * 0.55) + 1.2} cy={(pupilOffsetY * 0.4) + 1.2} r="0.6" fill="#ffffff" />
              </g>
            )}
          </g>

          {/* Golden Curving Beak */}
          <g transform="translate(180, 94)">
            {/* Upper Mandible */}
            <path
              d="M -3.5 -1 Q 0 7 3.5 -1 Q 0 -3 -3.5 -1 Z"
              fill={`url(#${filterId}-pure-gold)`}
              stroke="#b45309"
              strokeWidth="0.6"
            />
            {/* Beak Highlight */}
            <line x1="-1" y1="0" x2="0" y2="4" stroke="#fef08a" strokeWidth="0.6" strokeLinecap="round" />
          </g>
        </motion.g>
      </svg>

      {/* Playful Interactive Caption Badge */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.92 }}
            className="absolute -bottom-3 bg-zinc-900/90 text-amber-300 border border-amber-500/30 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide flex items-center gap-1.5 shadow-lg pointer-events-none"
          >
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Click to flutter tail feathers!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
