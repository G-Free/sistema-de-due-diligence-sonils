import React, { useEffect, useState } from 'react';
import { ToastType } from './ToastProvider';
import { SuccessIcon } from './icons/SuccessIcon';
import { ErrorIcon } from './icons/ErrorIcon';
import { WarningIcon } from './icons/WarningIcon';
import { InfoIcon } from './icons/InfoIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ToastProps {
  id: number;
  message: string;
  type: ToastType;
  title?: string;
  onDismiss: (id: number) => void;
}

const icons: Record<ToastType, React.FC<React.SVGProps<SVGSVGElement>>> = {
  success: SuccessIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  info: InfoIcon,
};

const styles: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: 'bg-success/5', border: 'border-success', icon: 'text-success' },
  error: { bg: 'bg-danger/5', border: 'border-danger', icon: 'text-danger' },
  warning: { bg: 'bg-warning/5', border: 'border-warning', icon: 'text-warning' },
  info: { bg: 'bg-info/5', border: 'border-info', icon: 'text-info' },
};

export const Toast: React.FC<ToastProps> = ({ id, message, type, title, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(id), 300); // Wait for exit animation
  };

  const Icon = icons[type];
  const style = styles[type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`w-full max-w-sm bg-card rounded-xl shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border-l-4 ${style.border} ${isExiting ? 'animate-fade-out-right' : 'animate-fade-in-right'}`}
    >
      <div className={`p-4 ${style.bg}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${style.icon}`} aria-hidden="true" />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            {title && <p className="text-sm font-semibold text-text-main">{title}</p>}
            <p className="text-sm text-text-secondary">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-transparent rounded-md inline-flex text-text-secondary hover:text-text-main focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={handleDismiss}
            >
              <span className="sr-only">Close</span>
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
