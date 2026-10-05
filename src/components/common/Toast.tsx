import React, { useEffect } from 'react';
import { ToastMessage } from '../../types';

export interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.durationMs || 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const iconMap = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info',
  };

  const borderMap = {
    success: 'border-[#4ade80]/40 text-[#4ade80]',
    error: 'border-[#ffb4ab]/40 text-[#ffb4ab]',
    warning: 'border-[#fbbf24]/40 text-[#fbbf24]',
    info: 'border-[#38bdf8]/40 text-[#38bdf8]',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-4 duration-200">
      <div className="bg-[#1a1c20] border border-white/10 shadow-2xl p-4 rounded-lg flex items-start gap-3 relative">
        <span
          className={`material-symbols-outlined text-[22px] shrink-0 mt-0.5 ${borderMap[toast.type]}`}
        >
          {iconMap[toast.type]}
        </span>
        <div className="flex flex-col flex-1 pr-4">
          <span className="font-headline font-semibold text-sm text-white">
            {toast.title}
          </span>
          <span className="font-body text-xs text-[#b9c8de] mt-0.5">
            {toast.message}
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="text-[#b9c8de] hover:text-white p-1 rounded-sm cursor-pointer transition-colors"
          aria-label="Dismiss toast"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
};
