import clsx from 'clsx';
import type { ReactNode } from 'react';

const variantStyles: Record<string, string> = {
  default: 'bg-neutral-light text-neutral-dark',
  success: 'bg-[#E3F4ED] text-[#145A32]',
  warning: 'bg-[#FDF3E3] text-[#8C5A12]',
  danger: 'bg-[#FBE9E7] text-[#8E2C1A]',
  info: 'bg-[#E0F2FA] text-[#1F3B73]',
};

type BadgeProps = {
  variant?: keyof typeof variantStyles;
  className?: string;
  children: ReactNode;
};

export const Badge = ({ variant = 'default', className, children }: BadgeProps) => (
  <span className={clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', variantStyles[variant], className)}>
    {children}
  </span>
);
