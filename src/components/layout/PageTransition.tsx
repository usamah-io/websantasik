'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';

interface PageTransitionProps {
  children: ReactNode;
}

const easeInOutCubic = [0.65, 0, 0.35, 1] as const;

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className="w-full flex-1">{children}</div>;
  }

  return (
    <>
      {/* Fluid Color-Slide Curtain 1: Dark Slate */}
      <motion.div
        key={`curtain-dark-${pathname}`}
        initial={{ y: '100%' }}
        animate={{ y: ['100%', '0%', '-100%'] }}
        transition={{
          duration: 0.75,
          times: [0, 0.48, 1],
          ease: easeInOutCubic,
        }}
        className="fixed inset-0 bg-slate-950 z-[9999] pointer-events-none rounded-t-[32px] md:rounded-t-[48px] rounded-b-[32px] md:rounded-b-[48px] border-y-4 border-black shadow-none flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.92, 1, 1, 0.96] }}
          transition={{ duration: 0.75, times: [0, 0.35, 0.6, 1], ease: 'easeInOut' }}
          className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/10 border-2 border-white/20 backdrop-blur-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)]"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-400 border border-black flex items-center justify-center font-black text-xs text-black shadow-[2px_2px_0px_0px_#000]">
            SAN
          </div>
          <span className="font-black text-xs sm:text-sm tracking-wider text-amber-300 uppercase">
            San Chapter Tasikmalaya
          </span>
        </motion.div>
      </motion.div>

      {/* Fluid Color-Slide Curtain 2: Amber Brand Accent */}
      <motion.div
        key={`curtain-amber-${pathname}`}
        initial={{ y: '100%' }}
        animate={{ y: ['100%', '0%', '-100%'] }}
        transition={{
          duration: 0.75,
          times: [0, 0.48, 1],
          ease: easeInOutCubic,
          delay: 0.05,
        }}
        className="fixed inset-0 bg-amber-400 z-[9998] pointer-events-none rounded-t-[32px] md:rounded-t-[48px] rounded-b-[32px] md:rounded-b-[48px] border-y-4 border-black shadow-none"
      />

      {/* Page Content with Graceful Easing & Smooth Glide */}
      <motion.div
        key={`page-content-${pathname}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.65,
          ease: easeInOutCubic,
          delay: 0.32,
        }}
        className="w-full flex-1"
      >
        {children}
      </motion.div>
    </>
  );
}
