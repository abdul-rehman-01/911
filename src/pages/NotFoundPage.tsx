import React from 'react';
import { useApp } from '../stores';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-160px)] items-center justify-center px-4 sm:px-6 lg:px-12 py-16">
      <div className="w-full max-w-2xl bg-[#1a1c20] p-8 sm:p-12 rounded-xl border border-white/8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Subtle Crimson Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#e11d48] to-transparent" />

        <div className="w-16 h-16 rounded-xl bg-[#0c0e12] border border-white/10 flex items-center justify-center text-[#e11d48] mb-6 shadow-xl">
          <span className="material-symbols-outlined text-[36px]">sensors_off</span>
        </div>

        <span className="font-mono text-xs text-[#ffb3b6] uppercase tracking-widest bg-[#e11d48]/10 px-3 py-1 rounded-sm border border-[#e11d48]/20 mb-3">
          Error 404 // Off-Track
        </span>

        <h1 className="font-headline font-bold text-3xl sm:text-4xl text-white uppercase tracking-tight mb-3">
          Telemetry Signal Lost
        </h1>

        <p className="font-body text-sm text-[#b9c8de] max-w-md leading-relaxed mb-8">
          The requested coordinate, vehicle chassis record, or route parameter is not registered in the Car 911 telemetry database.
        </p>

        {/* Technical Diagnostic Terminal Box */}
        <div className="w-full bg-[#0c0e12] p-4 rounded-lg border border-white/10 font-mono text-xs text-left mb-8 flex flex-col gap-1.5">
          <div className="flex justify-between border-b border-white/5 pb-1 text-[#b9c8de]/70">
            <span>DIAGNOSTIC STATUS:</span>
            <span className="text-[#ffb4ab] font-bold">404_COORDINATE_UNRESOLVED</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-1 text-[#b9c8de]/70">
            <span>GRID VECTOR:</span>
            <span className="text-white">SECTOR_OUT_OF_BOUNDS</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-1 text-[#b9c8de]/70">
            <span>TELEMETRY PROTOCOL:</span>
            <span className="text-[#4ade80]">CAR911_v2.4_NOMINAL</span>
          </div>
          <div className="flex justify-between text-[#b9c8de]/70 pt-0.5">
            <span>RECOVERY ACTION:</span>
            <span className="text-white">ROUTE_TO_ORIGIN_TERMINAL</span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="primary"
            onClick={() => navigateTo('home')}
            leftIcon={<span className="material-symbols-outlined text-[18px]">home</span>}
          >
            Return to Grid (Home)
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigateTo('explore-cars')}
            leftIcon={<span className="material-symbols-outlined text-[18px]">speed</span>}
          >
            Explore Inventory
          </Button>
          <Button
            variant="outline"
            onClick={() => navigateTo('compare')}
            leftIcon={<span className="material-symbols-outlined text-[18px]">compare_arrows</span>}
          >
            Compare Matrix
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigateTo('contact')}
            leftIcon={<span className="material-symbols-outlined text-[18px]">support_agent</span>}
          >
            Contact Concierge
          </Button>
        </div>
      </div>
    </div>
  );
};
