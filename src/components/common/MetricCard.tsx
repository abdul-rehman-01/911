import React from 'react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  iconName?: string;
  highlight?: boolean;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  iconName,
  highlight = false,
  className = '',
}) => {
  return (
    <div
      className={`bg-[#1a1c20] hover:bg-[#1e2024] p-3 sm:p-4 rounded-lg flex flex-col justify-between transition-colors border border-white/8 group ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#b9c8de]">
          {label}
        </span>
        {iconName && (
          <span
            className={`material-symbols-outlined text-[18px] transition-transform group-hover:scale-110 ${
              highlight ? 'text-[#e11d48]' : 'text-[#b9c8de]'
            }`}
          >
            {iconName}
          </span>
        )}
      </div>
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-xl sm:text-2xl font-semibold tracking-tight text-white">
            {value}
          </span>
          {unit && (
            <span className="font-mono text-xs font-bold text-[#e11d48] uppercase tracking-wide">
              {unit}
            </span>
          )}
        </div>
        {subtext && (
          <span className="font-body text-xs text-[#b9c8de]/70 truncate mt-0.5">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
