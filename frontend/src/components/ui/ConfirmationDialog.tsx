import { useState, useCallback } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import type { ReactNode } from 'react';

interface ConfirmationOptions {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: ConfirmationOptions;
}

const variantConfig = {
  danger: {
    icon: '⚠️',
    confirmVariant: 'primary' as const,
    iconColor: 'text-red-400',
    confirmClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  },
  warning: {
    icon: '⚠️',
    confirmVariant: 'primary' as const,
    iconColor: 'text-yellow-400',
    confirmClass: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
  },
  info: {
    icon: 'ℹ️',
    confirmVariant: 'primary' as const,
    iconColor: 'text-blue-400',
    confirmClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  },
};

export const ConfirmationDialog = ({ open, onOpenChange, options }: ConfirmationDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const config = variantConfig[options.variant || 'info'];

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    try {
      await options.onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [options.onConfirm, onOpenChange]);

  const handleCancel = useCallback(() => {
    if (options.onCancel) {
      options.onCancel();
    }
    onOpenChange(false);
  }, [options.onCancel, onOpenChange]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={options.title}
      size="sm"
      closeOnOverlayClick={false}
      closeOnEscape={!isLoading}
    >
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.iconColor} bg-current bg-opacity-10`}>
          <span className="text-xl" role="img" aria-hidden="true">
            {config.icon}
          </span>
        </div>
        
        <div className="flex-1">
          <div className="text-slate-200 leading-relaxed">
            {options.message}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-8">
        <Button
          variant="ghost"
          onClick={handleCancel}
          disabled={isLoading}
          className="min-w-[80px]"
        >
          {options.cancelLabel || 'Cancel'}
        </Button>
        
        <Button
          onClick={handleConfirm}
          loading={isLoading}
          disabled={isLoading}
          className={`min-w-[80px] ${config.confirmClass}`}
          aria-describedby="confirm-action-description"
        >
          {options.confirmLabel || 'Confirm'}
        </Button>
      </div>
      
      <div id="confirm-action-description" className="sr-only">
        This action {options.variant === 'danger' ? 'cannot be undone' : 'will be performed'}
      </div>
    </Modal>
  );
};

// Hook for using confirmation dialogs
interface UseConfirmationReturn {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
  ConfirmationComponent: () => ReactNode;
}

export const useConfirmation = (): UseConfirmationReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);
  const [resolver, setResolver] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((confirmOptions: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions({
        ...confirmOptions,
        onConfirm: async () => {
          try {
            await confirmOptions.onConfirm();
            resolve(true);
          } catch (error) {
            resolve(false);
            throw error;
          }
        },
        onCancel: () => {
          if (confirmOptions.onCancel) {
            confirmOptions.onCancel();
          }
          resolve(false);
        },
      });
      setResolver({ resolve });
      setIsOpen(true);
    });
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open && resolver) {
      resolver.resolve(false);
      setResolver(null);
      setOptions(null);
    }
  }, [resolver]);

  const ConfirmationComponent = useCallback(() => {
    if (!options) return null;

    return (
      <ConfirmationDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        options={options}
      />
    );
  }, [isOpen, handleOpenChange, options]);

  return { confirm, ConfirmationComponent };
};