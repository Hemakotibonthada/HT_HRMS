import { Slot } from '@radix-ui/react-slot';
import clsx from 'clsx';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
}>;

const baseClasses =
  'inline-flex items-center justify-center rounded-lg font-medium transition disabled:opacity-60 disabled:cursor-not-allowed';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-[#182f5a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-[#4fa4af] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary',
  ghost:
    'bg-transparent text-primary hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
  outline:
    'border border-primary/40 bg-transparent text-primary hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm md:text-base',
  lg: 'px-5 py-3 text-base',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  asChild = false,
  ...props
}: ButtonProps) => {
  const Component = asChild ? Slot : 'button';
  const content = (
    <>
      {loading && (
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      )}
      {children}
    </>
  );

  if (asChild) {
    return (
      <Component
        className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], className, 'shadow-sm')}
        {...props}
      >
        {content}
      </Component>
    );
  }

  return (
    <Component
      className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], className, 'shadow-sm')}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </Component>
  );
};
