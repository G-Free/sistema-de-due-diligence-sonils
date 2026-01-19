
import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { ToastContainer } from '../components/ToastContainer';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: number;
  message: string;
  type: ToastType;
  title?: string;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType, title?: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((message: string, type: ToastType, title?: string) => {
    const id = Date.now();
    setToasts((prevToasts) => [{ id, message, type, title }, ...prevToasts]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};
