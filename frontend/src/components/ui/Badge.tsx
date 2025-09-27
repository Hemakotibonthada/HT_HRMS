import clsx from 'clsx';
import type { ReactNode } from 'react';

const variantStyles: Record<string, string> = {
  default: 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border border-slate-300',
  success: 'bg-gradient-to-r from-emerald-100 to-green-200 text-emerald-800 border border-emerald-300 shadow-sm shadow-emerald-200/50',
  warning: 'bg-gradient-to-r from-amber-100 to-yellow-200 text-amber-800 border border-amber-300 shadow-sm shadow-amber-200/50',
  danger: 'bg-gradient-to-r from-red-100 to-rose-200 text-red-800 border border-red-300 shadow-sm shadow-red-200/50',
  info: 'bg-gradient-to-r from-blue-100 to-cyan-200 text-blue-800 border border-blue-300 shadow-sm shadow-blue-200/50',
  premium: 'bg-gradient-to-r from-purple-100 via-pink-100 to-indigo-200 text-purple-800 border border-purple-300 shadow-sm shadow-purple-200/50',
  glow: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/25 animate-pulse-glow',
};

type BadgeProps = {
  variant?: keyof typeof variantStyles;
  className?: string;
  children: ReactNode;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export const Badge = ({ 
  variant = 'default', 
  className, 
  children, 
  animated = false,
  size = 'sm',
  icon 
}: BadgeProps) => (
  <span 
    className={clsx(
      'inline-flex items-center rounded-full font-semibold transition-all duration-200 hover:scale-105 transform-gpu',
      variantStyles[variant],
      sizeStyles[size],
      animated && 'animate-pulse',
      className
    )}
  >
    {icon && <span className="mr-1.5">{icon}</span>}
    {children}
  </span>
);
