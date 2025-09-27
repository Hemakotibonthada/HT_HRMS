import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import clsx from 'clsx';
import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title?: string;
  description?: string;
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
  footer?: ReactNode;
  className?: string;
}

export const Modal = ({ open, title, description, children, onOpenChange, footer, className }: ModalProps) => {
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const handleClose = () => onOpenChange(false);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className={clsx('w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-xl backdrop-blur', className)}>
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
            {description && <p className="mt-1 text-sm text-slate-300">{description}</p>}
          </div>
          <Button variant="ghost" onClick={handleClose} className="h-9 w-9 rounded-full p-0 text-white/80">
            <span className="text-xl leading-none">×</span>
          </Button>
        </div>
        <div className="mt-6 max-h-[70vh] overflow-y-auto pr-1 text-slate-100">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
};
