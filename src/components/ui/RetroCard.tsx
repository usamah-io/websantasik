'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface RetroCardProps {
  children: ReactNode;
  className?: string;
  badgeBg?: string;
  animateHover?: boolean;
  onClick?: () => void;
}

export function RetroCard({
  children,
  className = '',
  badgeBg = 'bg-white',
  animateHover = true,
  onClick,
}: RetroCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={animateHover ? { y: -5, scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className={`relative rounded-3xl border-3 border-black ${badgeBg} p-6 shadow-[6px_6px_0px_0px_#000] overflow-hidden transition-all ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
