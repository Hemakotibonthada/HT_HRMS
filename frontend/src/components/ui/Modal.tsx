import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import clsx from 'clsx';
import type { ReactNode, KeyboardEvent } from 'react';

interface ModalProps {
  open: boolean;
  title?: string;
  description?: string;
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
  footer?: ReactNode;
  className?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-[95vw] max-h-[95vh]',
};

export const Modal = ({ 
  open, 
  title, 
  description, 
  children, 
  onOpenChange, 
  footer, 
  className,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  size = 'md'
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!closeOnEscape) return;
    
    if (event.key === 'Escape') {
      event.preventDefault();
      handleClose();
    }
  }, [closeOnEscape, handleClose]);

  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (!closeOnOverlayClick) return;
    
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }, [closeOnOverlayClick, handleClose]);

  // Focus management
  useEffect(() => {
    if (!open) return;

    // Store the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Prevent body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the modal
    const focusModal = () => {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      } else {
        modalRef.current?.focus();
      }
    };

    // Use setTimeout to ensure modal is rendered
    const timeoutId = setTimeout(focusModal, 10);

    return () => {
      clearTimeout(timeoutId);
      document.body.style.overflow = originalOverflow;
      
      // Restore focus to previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [open]);

  // Trap focus within modal
  useEffect(() => {
    if (!open) return;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey as any);
    return () => document.removeEventListener('keydown', handleTabKey as any);
  }, [open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm animate-slide-up"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <div 
        ref={modalRef}
        className={clsx(
          'w-full rounded-2xl border border-white/20 backdrop-blur-xl shadow-2xl',
          'bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95',
          'p-6 animate-slide-up focus:outline-none',
          sizeClasses[size],
          className
        )}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {title && (
              <h2 
                id="modal-title" 
                className="text-lg font-semibold text-white"
              >
                {title}
              </h2>
            )}
            {description && (
              <p 
                id="modal-description" 
                className="mt-1 text-sm text-slate-300"
              >
                {description}
              </p>
            )}
          </div>
          <Button 
            variant="ghost" 
            onClick={handleClose} 
            className="h-9 w-9 rounded-full p-0 text-white/80 hover:text-white hover:bg-white/10 flex-shrink-0"
            aria-label="Close modal"
            tooltip="Close"
          >
            <span className="text-xl leading-none" aria-hidden="true">×</span>
          </Button>
        </div>
        
        <div className="mt-6 max-h-[70vh] overflow-y-auto pr-1 text-slate-100 focus:outline-none">
          {children}
        </div>
        
        {footer && (
          <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
