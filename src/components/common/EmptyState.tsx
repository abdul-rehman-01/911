import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'search_off',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`w-full py-16 px-6 bg-[#1a1c20] border border-white/8 rounded-xl flex flex-col items-center justify-center text-center max-w-xl mx-auto my-8 ${className}`}
    >
      <div className="w-14 h-14 rounded-lg bg-[#1e2024] flex items-center justify-center text-[#e11d48] mb-4">
        <span className="material-symbols-outlined text-[32px]">{icon}</span>
      </div>
      <h3 className="font-headline font-semibold text-xl text-white tracking-tight mb-2">
        {title}
      </h3>
      <p className="font-body text-sm text-[#b9c8de] max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
