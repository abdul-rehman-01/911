import React from 'react';

export const LoadingState: React.FC<{ message?: string; className?: string }> = ({
  message = 'Synchronizing telemetry data...',
  className = '',
}) => {
  return (
    <div
      className={`w-full py-16 flex flex-col items-center justify-center gap-4 text-center ${className}`}
    >
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-white/10 border-t-[#e11d48] animate-spin" />
        <span className="w-3 h-3 rounded-full bg-[#e11d48] animate-pulse" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase tracking-widest text-[#ffb3b6]">
          Car 911 Engine Online
        </span>
        <span className="font-body text-sm text-[#b9c8de]">{message}</span>
      </div>
    </div>
  );
};

export const VehicleCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#1a1c20] rounded-xl overflow-hidden border border-white/8 flex flex-col animate-pulse">
      <div className="w-full h-52 bg-[#1e2024]" />
      <div className="p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="h-3 w-24 bg-[#282a2e] rounded-sm" />
          <div className="h-4 w-16 bg-[#282a2e] rounded-sm" />
        </div>
        <div className="h-5 w-48 bg-[#282a2e] rounded-sm" />
        <div className="grid grid-cols-4 gap-1 p-2 bg-[#0c0e12] rounded-sm">
          <div className="h-8 bg-[#1e2024] rounded-sm" />
          <div className="h-8 bg-[#1e2024] rounded-sm" />
          <div className="h-8 bg-[#1e2024] rounded-sm" />
          <div className="h-8 bg-[#1e2024] rounded-sm" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-4 w-16 bg-[#282a2e] rounded-sm" />
          <div className="h-8 w-24 bg-[#282a2e] rounded-sm" />
        </div>
      </div>
    </div>
  );
};
