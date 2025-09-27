import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const toastIcons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const toastStyles = {
  success: 'border-green-500/30 bg-green-500/10 text-green-200',
  error: 'border-red-500/30 bg-red-500/10 text-red-200',
  warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
};

const ToastItem = ({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) => {
  return (
    <div
      className={`
        relative max-w-md w-full backdrop-blur-md rounded-xl border p-4 shadow-xl 
        transform transition-all duration-300 animate-slide-up hover:scale-105
        ${toastStyles[toast.type]}
      `}
      role="alert"
      aria-live="polite"
      aria-labelledby={`toast-title-${toast.id}`}
      aria-describedby={toast.message ? `toast-message-${toast.id}` : undefined}
    >
      <div className="flex items-start gap-3">
        <div className={`
          flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold
          ${toast.type === 'success' ? 'bg-green-500/20' : ''}
          ${toast.type === 'error' ? 'bg-red-500/20' : ''}
          ${toast.type === 'warning' ? 'bg-yellow-500/20' : ''}
          ${toast.type === 'info' ? 'bg-blue-500/20' : ''}
        `}>
          {toastIcons[toast.type]}
        </div>
        
        <div className="flex-1">
          <h4 id={`toast-title-${toast.id}`} className="font-semibold text-sm">
            {toast.title}
          </h4>
          {toast.message && (
            <p id={`toast-message-${toast.id}`} className="text-xs mt-1 opacity-90">
              {toast.message}
            </p>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-xs font-medium underline hover:no-underline focus:outline-none focus:ring-1 focus:ring-current rounded"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={() => onClose(toast.id)}
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-current"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

const ToastContainer = ({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) => {
  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>,
    document.body
  );
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = {
      id,
      duration: 5000,
      ...toastData,
    };

    setToasts((prev) => [...prev, toast]);

    // Auto-remove toast after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
};

// Convenience hooks for common toast types
export const useSuccessToast = () => {
  const { showToast } = useToast();
  return useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);
};

export const useErrorToast = () => {
  const { showToast } = useToast();
  return useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  }, [showToast]);
};

export const useWarningToast = () => {
  const { showToast } = useToast();
  return useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  }, [showToast]);
};

export const useInfoToast = () => {
  const { showToast } = useToast();
  return useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  }, [showToast]);
};