import clsx from 'clsx';
import type { PropsWithChildren, ReactNode } from 'react';

type CardProps = PropsWithChildren<{
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}>;

export const Card = ({ className, title, subtitle, action, children }: CardProps) => (
  <div className={clsx('rounded-2xl border border-primary/15 bg-white p-6 shadow-card', className)}>
    {(title || subtitle || action) && (
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          {title && <h3 className="text-lg font-semibold text-neutral-dark">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-neutral-muted">{subtitle}</p>}
        </div>
        {action}
      </header>
    )}
    {children}
  </div>
);
