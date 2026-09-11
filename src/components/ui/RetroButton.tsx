'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface RetroButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function RetroButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  ...props
}: RetroButtonProps) {
  const variantStyles = {
    primary: 'bg-amber-400 text-slate-950 hover:bg-amber-300 border-black',
    secondary: 'bg-emerald-400 text-slate-950 hover:bg-emerald-300 border-black',
    accent: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300 border-black',
    outline: 'bg-white text-slate-900 hover:bg-slate-100 border-black',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 border-black',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-black rounded-xl border-2 shadow-[2px_2px_0px_0px_#000]',
    md: 'px-5 py-2.5 text-sm font-black rounded-2xl border-3 shadow-[4px_4px_0px_0px_#000]',
    lg: 'px-7 py-3.5 text-base font-black rounded-2xl border-3 shadow-[5px_5px_0px_0px_#000]',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.03, translateY: -2 }}
      whileTap={disabled ? {} : { scale: 0.96, translateY: 2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`inline-flex items-center justify-center gap-2 cursor-pointer font-sans transition-colors active:shadow-[1px_1px_0px_0px_#000] disabled:opacity-60 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
