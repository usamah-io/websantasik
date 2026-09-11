import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'orange' | 'dark';
  className?: string;
}

export function Badge({ children, variant = 'yellow', className = '' }: BadgeProps) {
  const colors = {
    yellow: 'bg-amber-300 !text-black border-black font-black',
    green: 'bg-emerald-300 !text-black border-black font-black',
    blue: 'bg-cyan-300 !text-black border-black font-black',
    pink: 'bg-rose-300 !text-black border-black font-black',
    purple: 'bg-purple-300 !text-black border-black font-black',
    orange: 'bg-orange-300 !text-black border-black font-black',
    dark: 'bg-slate-950 !text-amber-300 border-black font-black',
  };

  return (
    <span
      style={{
        color: variant === 'dark' ? '#fbbf24' : '#000000',
      }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-full border-2 shadow-[1.5px_1.5px_0px_0px_#000] uppercase tracking-wider ${colors[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
