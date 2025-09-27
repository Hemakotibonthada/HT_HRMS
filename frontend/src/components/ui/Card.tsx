import clsx from 'clsx';
import type { PropsWithChildren, ReactNode } from 'react';

type CardProps = PropsWithChildren<{
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  variant?: 'default' | 'glass' | 'gradient' | 'floating';
  glow?: boolean;
  animated?: boolean;
}>;

const variantClasses = {
  default: 'bg-white border border-slate-200 shadow-lg',
  glass: 'glass-effect border border-white/20',
  gradient: 'bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-xl',
  floating: 'bg-white border border-slate-100 shadow-2xl hover:shadow-3xl',
};

export const Card = ({ 
  className, 
  title, 
  subtitle, 
  action, 
  children, 
  variant = 'default',
  glow = false,
  animated = true
}: CardProps) => (
  <div 
    className={clsx(
      'rounded-2xl p-6 transition-all duration-300 group relative overflow-hidden',
      variantClasses[variant],
      animated && 'hover:-translate-y-1 hover:scale-[1.02] transform-gpu',
      glow && 'glow-effect',
      'animate-slide-up',
      className
    )}
  >
    {/* Gradient overlay for hover effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    {/* Top border accent */}
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    
    {/* Content */}
    <div className="relative z-10">
      {(title || subtitle || action) && (
        <header className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-1">
            {title && (
              <h3 className="text-xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors duration-200">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-200">
                {subtitle}
              </p>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </header>
      )}
      
      <div className="relative">
        {children}
      </div>
    </div>
    
    {/* Decorative elements */}
    <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700" />
    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700" />
  </div>
);
