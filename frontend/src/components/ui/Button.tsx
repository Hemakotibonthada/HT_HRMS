import { Slot } from '@radix-ui/react-slot';
import clsx from 'clsx';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'gradient' | 'glow';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
  glow?: boolean;
  ripple?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  tooltip?: string;
}>;

const baseClasses =
  'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group active:scale-95 transform-gpu';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/50',
  secondary:
    'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700 hover:shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-500/50',
  ghost:
    'bg-white/10 backdrop-blur-sm text-slate-700 hover:bg-white/20 hover:shadow-md hover:-translate-y-0.5 border border-white/20 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/50',
  outline:
    'border-2 border-blue-500/30 bg-transparent text-blue-600 hover:bg-blue-50 hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/50',
  gradient:
    'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-purple-400 focus-visible:ring-2 focus-visible:ring-purple-500/50',
  glow:
    'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1 animate-pulse-glow focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500/50',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-6 py-3 text-sm md:text-base',
  lg: 'px-8 py-4 text-base',
  xl: 'px-10 py-5 text-lg',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  asChild = false,
  glow = false,
  ripple = true,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  tooltip,
  ...props
}: ButtonProps) => {
  const Component = asChild ? Slot : 'button';
  
  const buttonClasses = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    glow && 'glow-effect',
    className
  );

  const content = (
    <>
      {/* Shine effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
      
      {/* Loading spinner */}
      {loading && (
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      )}
      
      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center">
        {children}
      </span>
      
      {/* Ripple effect */}
      {ripple && (
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-active:scale-100 transition-transform duration-200 ease-out" />
        </div>
      )}
    </>
  );

  if (asChild) {
    return (
      <Component className={buttonClasses} {...props}>
        {content}
      </Component>
    );
  }

  return (
    <Component
      className={buttonClasses}
      disabled={disabled || loading}
      aria-label={ariaLabel || (loading ? 'Loading...' : undefined)}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      title={tooltip}
      role={asChild ? undefined : 'button'}
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      {content}
    </Component>
  );
};
