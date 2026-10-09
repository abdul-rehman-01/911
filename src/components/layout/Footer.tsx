import React, { useState } from 'react';
import { RoutePath } from '../../types';

export interface FooterProps {
  onNavigate: (route: RoutePath) => void;
  onSubscribeNewsletter?: (email: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onSubscribeNewsletter,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    onSubscribeNewsletter?.(emailInput);
    setSubscribed(true);
    setEmailInput('');
  };

  return (
    <footer className="w-full bg-[#111317] border-t border-white/8 pt-12 pb-8 mt-auto shadow-2xl">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand & Protocol */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-sm bg-[#e11d48] flex items-center justify-center text-white shadow-md">
                <span className="material-symbols-outlined text-[18px]">speed</span>
              </div>
              <span className="font-headline font-bold text-lg text-white tracking-wider uppercase">
                CAR <span className="text-[#e11d48]">911</span>
              </span>
            </div>
            <p className="font-body text-xs text-[#b9c8de] leading-relaxed">
              The premier global ecosystem for hypercar acquisition, telemetry intelligence, dyno comparison matrices, and elite vehicle authentication.
            </p>
            {/* Replaced unverified ISO claim with verified Telemetry Protocol Demo badge */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#1a1c20] rounded-sm border border-white/10 w-fit">
              <span className="material-symbols-outlined text-[#e11d48] text-[16px] material-symbols-filled">
                verified
              </span>
              <span className="font-mono text-[10px] text-[#b9c8de] uppercase tracking-wider">
                Telemetry Protocol • Interactive Demo Platform
              </span>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[11px] font-semibold text-[#e11d48] uppercase tracking-widest">
              Quick Navigation
            </span>
            <nav className="flex flex-col gap-2 font-body text-xs text-[#b9c8de]">
              <button
                type="button"
                onClick={() => onNavigate('explore-cars')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Explore Cars Inventory
              </button>
              <button
                type="button"
                onClick={() => onNavigate('compare')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Compare Spec Tool
              </button>
              <button
                type="button"
                onClick={() => onNavigate('dealers')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Dealership &amp; Atelier Locator
              </button>
              <button
                type="button"
                onClick={() => onNavigate('services')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Performance Services &amp; Armor
              </button>
              <button
                type="button"
                onClick={() => onNavigate('about')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                About Car 911 Engineering
              </button>
            </nav>
          </div>

          {/* Column 3: Ownership Solutions */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[11px] font-semibold text-[#e11d48] uppercase tracking-widest">
              Services &amp; Ownership
            </span>
            <nav className="flex flex-col gap-2 font-body text-xs text-[#b9c8de]">
              <button
                type="button"
                onClick={() => onNavigate('services')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                360-Point Telemetry Inspection
              </button>
              <button
                type="button"
                onClick={() => onNavigate('services')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Bespoke Detailing &amp; Track PPF
              </button>
              <button
                type="button"
                onClick={() => onNavigate('services')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Exotic Lease &amp; Financing Calculator
              </button>
              <button
                type="button"
                onClick={() => onNavigate('services')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                VIP Enclosed Transport Logistics
              </button>
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Concierge Acquisition Desk
              </button>
            </nav>
          </div>

          {/* Column 4: Newsletter & Dispatch */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[11px] font-semibold text-[#e11d48] uppercase tracking-widest">
              Newsletter &amp; Dispatch
            </span>
            <p className="font-body text-xs text-[#b9c8de]">
              Receive technical allocations and private track dispatch telemetry updates directly.
            </p>
            {subscribed ? (
              <div className="p-2.5 bg-[#1e2024] border border-[#4ade80]/30 rounded-sm text-xs text-[#4ade80] font-mono">
                ✓ Dispatch frequency confirmed.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-1.5">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="driver@car911.com"
                  aria-label="Email address for dispatch telemetry updates"
                  className="bg-[#1e2024] text-white font-body text-xs px-3 py-2 rounded-sm border border-white/10 placeholder:text-[#39485a] focus:outline-none focus:border-[#e11d48] flex-1"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#e11d48] hover:bg-[#db2b4e] text-white font-headline font-semibold text-xs px-3 py-2 rounded-sm transition-colors cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}

            <div className="flex flex-col gap-1 pt-2">
              <span className="font-mono text-[10px] text-[#b9c8de] uppercase">
                24/7 Roadside VIP Dispatch
              </span>
              <a
                href="tel:18009112886"
                className="font-mono text-sm font-semibold text-white hover:text-[#ffb3b6] transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[#e11d48] text-[16px]">call</span>
                +1 (800) 911-AUTO
              </a>
            </div>
          </div>
        </div>

        {/* Legal Demo Disclaimer Banner */}
        <div className="p-3 bg-[#16181d] rounded-sm border border-white/5 mb-8 text-center text-[#b9c8de]/70 font-body text-[11px] leading-relaxed">
          <strong className="text-[#e2e2e8]">Demonstration Platform Notice:</strong> Vehicle telemetry metrics, dynamic pricing allocations, dealer partner locations, and financing simulations shown in Car 911 are for product presentation and preview purposes.
        </div>

        {/* Bottom Line Bar */}
        <div className="pt-6 border-t border-white/8 flex flex-col md:flex-row items-center justify-between gap-4 font-body text-xs text-[#b9c8de]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#e11d48] animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#b9c8de]">
              Telemetry Online • All Systems Active
            </span>
          </div>

          <div>© {new Date().getFullYear()} Car 911 Automotive Technologies Inc. All rights reserved.</div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Security Protocol
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
