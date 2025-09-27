import { useCallback, useState } from 'react';

interface ModalState<T> {
  isOpen: boolean;
  data: T | undefined;
}

export const useModal = <T = undefined>() => {
  const [state, setState] = useState<ModalState<T>>({ isOpen: false, data: undefined });

  const open = useCallback((data?: T) => {
    setState({ isOpen: true, data });
  }, []);

  const close = useCallback(() => {
    setState({ isOpen: false, data: undefined });
  }, []);

  return [state, open, close] as const;
};
