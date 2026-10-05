import React from 'react';
import { Vehicle } from '../../types';

export interface VehicleCardProps {
  vehicle: Vehicle;
  isFavorite?: boolean;
  isCompared?: boolean;
  onToggleFavorite?: (id: string) => void;
  onToggleCompare?: (id: string) => void;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  className?: string;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  isFavorite = false,
  isCompared = false,
  onToggleFavorite,
  onToggleCompare,
  onSelectVehicle,
  className = '',
}) => {
  return (
    <article
      className={`bg-[#1a1c20] hover:bg-[#1e2024] rounded-xl overflow-hidden border border-white/8 shadow-md flex flex-col group hover:-translate-y-1 transition-all duration-300 ${className}`}
    >
      {/* Image Stage */}
      <div className="relative w-full h-52 bg-[#0c0e12] overflow-hidden">
        <img
          src={vehicle.primaryImage}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1c20] via-transparent to-transparent opacity-85 pointer-events-none" />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 z-10">
          {vehicle.isCertified && (
            <span className="bg-[#e11d48] text-[#fffaf9] font-mono text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <span className="material-symbols-outlined text-[12px] material-symbols-filled">
                verified
              </span>
              911 Certified
            </span>
          )}
          {vehicle.tags?.slice(0, 1).map((tag, idx) => (
            <span
              key={idx}
              className="bg-[#282a2e]/90 text-[#e2e2e8] font-mono text-[10px] px-2 py-0.5 rounded-sm backdrop-blur-md border border-white/10"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Favorite Watchlist Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(vehicle.id);
          }}
          aria-label={isFavorite ? 'Remove from telemetry watchlist' : 'Add to telemetry watchlist'}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-[#0c0e12]/80 backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer z-10 ${
            isFavorite
              ? 'text-[#e11d48] border border-[#e11d48]/40'
              : 'text-[#b9c8de] hover:text-[#e11d48] hover:bg-[#1a1c20]'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              isFavorite ? 'material-symbols-filled' : ''
            }`}
          >
            favorite
          </span>
        </button>

        {/* Price & Monthly in Image Scrim */}
        <div className="absolute bottom-2.5 left-3 right-3 flex justify-between items-baseline z-10">
          <span className="font-mono text-lg font-semibold text-white tracking-tight">
            ${vehicle.priceUsd.toLocaleString()}
          </span>
          <span className="font-mono text-[10px] text-[#b9c8de] uppercase">
            Est. ${vehicle.estMonthlyUsd.toLocaleString()}/mo
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[#b9c8de] font-mono text-[11px] uppercase tracking-wider">
            <span>
              {vehicle.chassisCode ? `Chassis: ${vehicle.chassisCode} • ` : ''}
              {vehicle.year}
            </span>
            <span className="text-[#e5bdbe] font-medium truncate max-w-[130px]">
              {vehicle.exteriorColor}
            </span>
          </div>
          <h3
            onClick={() => onSelectVehicle?.(vehicle)}
            className="font-headline font-semibold text-base text-white group-hover:text-[#ffb3b6] transition-colors cursor-pointer truncate"
          >
            {vehicle.make} {vehicle.model}
          </h3>
        </div>

        {/* 4-Column Micro Tabular Specs Grid */}
        <div className="grid grid-cols-4 gap-1 py-1.5 px-1 bg-[#0c0e12] rounded-sm text-center border border-white/5">
          <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-[13px] text-[#b9c8de]">
              speed
            </span>
            <span className="font-mono text-xs font-semibold text-white">
              {vehicle.telemetry.mileageMiles.toLocaleString()}
            </span>
            <span className="font-mono text-[9px] text-[#b9c8de] uppercase">
              Miles
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-[13px] text-[#b9c8de]">
              bolt
            </span>
            <span className="font-mono text-xs font-semibold text-white">
              {vehicle.telemetry.outputHp}
            </span>
            <span className="font-mono text-[9px] text-[#b9c8de] uppercase">
              BHP
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-[13px] text-[#b9c8de]">
              settings
            </span>
            <span className="font-mono text-xs font-semibold text-white truncate max-w-full">
              {vehicle.telemetry.transmission.split(' ')[0]}
            </span>
            <span className="font-mono text-[9px] text-[#b9c8de] uppercase truncate max-w-full">
              Gearbox
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-[13px] text-[#b9c8de]">
              all_inclusive
            </span>
            <span className="font-mono text-xs font-semibold text-white">
              {vehicle.telemetry.drivetrain}
            </span>
            <span className="font-mono text-[9px] text-[#b9c8de] uppercase">
              Drive
            </span>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="flex items-center justify-between pt-1">
          <label
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 cursor-pointer select-none text-[#b9c8de] hover:text-white font-mono text-[11px] uppercase tracking-wider"
          >
            <input
              type="checkbox"
              checked={isCompared}
              onChange={() => onToggleCompare?.(vehicle.id)}
              className="w-3.5 h-3.5 rounded-sm bg-[#1e2024] accent-[#e11d48] border-white/20 cursor-pointer"
            />
            <span>Compare</span>
          </label>

          <button
            type="button"
            onClick={() => onSelectVehicle?.(vehicle)}
            className="bg-[#1e2024] hover:bg-[#e11d48] text-white font-headline font-semibold text-xs px-3 py-1.5 rounded-sm transition-all duration-200 flex items-center gap-1 cursor-pointer shadow-sm hover:shadow-[0_0_16px_rgba(225,29,72,0.35)]"
          >
            <span>View Telemetry</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </article>
  );
};
