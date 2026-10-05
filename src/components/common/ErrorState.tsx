import React from 'react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Telemetry Diagnostic Interruption',
  message = 'An unexpected glitch interrupted communication with the allocation index. Please attempt reconnection.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`w-full py-16 px-6 bg-[#1a1c20] border border-[#ffb4ab]/20 rounded-xl flex flex-col items-center justify-center text-center max-w-xl mx-auto my-8 ${className}`}
    >
      <div className="w-14 h-14 rounded-lg bg-[#93000a]/20 border border-[#ffb4ab]/30 flex items-center justify-center text-[#ffb4ab] mb-4">
        <span className="material-symbols-outlined text-[32px]">warning</span>
      </div>
      <h3 className="font-headline font-semibold text-xl text-white tracking-tight mb-2">
        {title}
      </h3>
      <p className="font-body text-sm text-[#b9c8de] max-w-md mb-6 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" leftIcon={<span className="material-symbols-outlined text-[16px]">refresh</span>} onClick={onRetry}>
          Re-establish Connection
        </Button>
      )}
    </div>
  );
};
