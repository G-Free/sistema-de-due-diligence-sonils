import React from 'react';
import { Toast } from './Toast';
import { ToastData } from './ToastProvider';

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-0 right-0 p-4 space-y-3 z-[9999] w-full max-w-md"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          title={toast.title}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};
