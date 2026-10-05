import React from 'react';

export interface TelemetryBadgeProps {
  label: string;
  variant?: 'live' | 'certified' | 'spec' | 'subtle' | 'demo';
  prefix?: string;
  pulse?: boolean;
  className?: string;
}

export const TelemetryBadge: React.FC<TelemetryBadgeProps> = ({
  label,
  variant = 'subtle',
  prefix,
  pulse = false,
  className = '',
}) => {
  const variantStyles = {
    live: 'bg-[#1a1c20]/90 text-[#e2e2e8] border border-white/10 shadow-sm backdrop-blur-md',
    certified:
      'bg-[#1a1c20] text-[#ffb3b6] border border-[#e11d48]/40 shadow-sm',
    spec: 'bg-[#e11d48]/20 text-[#ffdadb] border border-[#e11d48]/30',
    subtle: 'bg-[#1e2024] text-[#b9c8de] border border-white/8',
    demo: 'bg-[#282a2e]/90 text-[#b9c8de] border border-dashed border-[#b9c8de]/40',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-mono text-[11px] font-medium uppercase tracking-[0.08em] ${variantStyles[variant]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e11d48] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e11d48]"></span>
        </span>
      )}
      {!pulse && variant === 'certified' && (
        <span className="material-symbols-outlined text-[13px] text-[#e11d48] material-symbols-filled">
          verified
        </span>
      )}
      {prefix && <span className="text-[#b9c8de]/60">{prefix}</span>}
      <span>{label}</span>
    </div>
  );
};
