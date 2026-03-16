'use client';

import { useState, useRef } from 'react';
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number; // in seconds
  showBorder?: boolean;
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  pauseOnHover?: boolean;
  yoyo?: boolean;
}

export default function GradientText({
  children,
  className = '',
  colors = ['#5227FF', '#FF9FFC', '#B19EEF', '#5227FF'], // Loop back to first color for seamlessness
  animationSpeed = 8,
  showBorder = false,
  direction = 'horizontal',
  pauseOnHover = false,
  yoyo = true,
}: GradientTextProps) {
  const [isHovered, setIsHovered] = useState(false);
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);

  const animationDuration = animationSpeed * 1000;
  const gradientString = colors.join(', ');

  useAnimationFrame((time) => {
    if (pauseOnHover && isHovered) {
      lastTimeRef.current = null;
      return;
    }

    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      return;
    }

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    elapsedRef.current += deltaTime;

    if (yoyo) {
      const fullCycle = animationDuration * 2;
      const cycleTime = elapsedRef.current % fullCycle;
      if (cycleTime < animationDuration) {
        progress.set((cycleTime / animationDuration) * 100);
      } else {
        progress.set(100 - ((cycleTime - animationDuration) / animationDuration) * 100);
      }
    } else {
      progress.set((elapsedRef.current / animationDuration) * 100 % 100);
    }
  });

  const getDirection = () => {
    switch (direction) {
      case 'vertical': return 'to bottom';
      case 'diagonal': return 'to bottom right';
      default: return 'to right';
    }
  };

  return (
    <div
      className={`relative inline-block font-bold ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showBorder && (
        <motion.div
          className="absolute -inset-[2px] rounded-lg -z-10"
          style={{
            background: `linear-gradient(${getDirection()}, ${gradientString})`,
            backgroundSize: '300% 300%',
            backgroundPosition: progress.get() + '%',
          }}
        />
      )}
      
      <motion.span
        className="bg-clip-text text-transparent"
        style={{
          backgroundImage: `linear-gradient(${getDirection()}, ${gradientString})`,
          backgroundSize: '300% 300%',
          backgroundPosition: progress.get() + '%',
          WebkitBackgroundClip: 'text',
        }}
      >
        {children}
      </motion.span>
    </div>
  );
}
