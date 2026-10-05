import React from 'react';
import { Dealer } from '../../types';

export interface DealerCardProps {
  dealer: Dealer;
  onContactDealer?: (dealer: Dealer) => void;
  onVideoTour?: (dealer: Dealer) => void;
  className?: string;
}

export const DealerCard: React.FC<DealerCardProps> = ({
  dealer,
  onContactDealer,
  onVideoTour,
  className = '',
}) => {
  return (
    <div
      className={`bg-[#1a1c20] hover:bg-[#1e2024] p-6 rounded-xl border border-white/8 shadow-md flex flex-col justify-between gap-5 transition-all duration-200 ${className}`}
    >
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-mono text-[10px] font-bold text-[#e11d48] uppercase tracking-wider">
                {dealer.isFlagship ? 'Car 911 Flagship Partner' : 'Authorized Partner'}
              </span>
              <span className="font-mono text-[9px] text-[#b9c8de]/60 border border-white/10 px-1 rounded-sm uppercase">
                Demo
              </span>
            </div>
            <h3 className="font-headline font-semibold text-lg text-white tracking-tight">
              {dealer.name}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-sm bg-[#1e2024] flex items-center justify-center text-[#e11d48] border border-white/5">
            <span className="material-symbols-outlined text-[20px]">storefront</span>
          </div>
        </div>

        {/* Info List */}
        <div className="flex flex-col gap-2 font-body text-xs text-[#b9c8de]">
          <div className="flex items-start gap-2 text-[#e2e2e8]">
            <span className="material-symbols-outlined text-[#e11d48] text-[16px] shrink-0 mt-0.5">
              location_on
            </span>
            <span>
              {dealer.address}, {dealer.city}, {dealer.state} {dealer.postalCode}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b9c8de] text-[16px] shrink-0">
              schedule
            </span>
            <span>{dealer.hours}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b9c8de] text-[16px] shrink-0">
              call
            </span>
            <a
              href={`tel:${dealer.phone}`}
              className="hover:text-white transition-colors font-mono"
            >
              {dealer.phone}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b9c8de] text-[16px] shrink-0">
              directions_car
            </span>
            <span>
              <strong className="text-white font-mono">{dealer.allocatedInventoryCount}</strong> allocated vehicles on floor
            </span>
          </div>
        </div>

        {/* Map preview with dark luxury cartography style */}
        <div
          className="w-full h-32 bg-cover bg-center rounded-sm relative overflow-hidden border border-white/5 flex items-end p-2"
          style={{ backgroundImage: `url('${dealer.mapStaticImage}')` }}
        >
          <div className="bg-[#0c0e12]/90 backdrop-blur-md px-2 py-0.5 rounded-sm font-mono text-[10px] text-white uppercase flex items-center gap-1.5 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48] animate-pulse" />
            <span>Showroom Coordinates Synced</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
        <button
          type="button"
          onClick={() => onContactDealer?.(dealer)}
          className="bg-[#e11d48] hover:bg-[#db2b4e] text-white font-headline font-semibold text-xs py-2 px-3 rounded-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow-[0_0_16px_rgba(225,29,72,0.3)]"
        >
          <span className="material-symbols-outlined text-[15px]">chat</span>
          <span>Contact Dealer</span>
        </button>
        <button
          type="button"
          onClick={() => onVideoTour?.(dealer)}
          className="bg-[#1e2024] hover:bg-[#282a2e] text-[#e2e2e8] border border-white/10 font-headline font-semibold text-xs py-2 px-3 rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[15px] text-[#b9c8de]">videocam</span>
          <span>Video Walkaround</span>
        </button>
      </div>
    </div>
  );
};
