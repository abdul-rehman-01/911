import React from 'react';
import { Service } from '../../types';

export interface ServiceCardProps {
  service: Service;
  onBookService?: (service: Service) => void;
  className?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onBookService,
  className = '',
}) => {
  return (
    <div
      className={`bg-[#1e2024] hover:bg-[#282a2e] p-6 rounded-xl border border-white/8 shadow-lg flex flex-col justify-between transition-all duration-200 group ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="p-2.5 bg-[#0c0e12] rounded-lg text-[#e11d48] border border-white/5 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[24px]">
              {service.icon || 'build'}
            </span>
          </span>
          <span className="font-mono text-[11px] font-medium text-[#e11d48] bg-[#e11d48]/15 px-2.5 py-0.5 rounded-sm uppercase tracking-wider">
            {service.category}
          </span>
        </div>
        <h3 className="font-headline font-semibold text-lg text-white mb-2 tracking-tight group-hover:text-[#ffb3b6] transition-colors">
          {service.name}
        </h3>
        <p className="font-body text-xs text-[#b9c8de] leading-relaxed mb-6">
          {service.shortDescription}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-[#b9c8de] uppercase">Est. Rate</span>
          <span className="font-mono text-xs font-semibold text-white">
            {service.priceEstimate}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onBookService?.(service)}
          className="inline-flex items-center gap-1 text-[#ffb3b6] hover:text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          <span>Book Assessment</span>
          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
};
