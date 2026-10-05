import React from 'react';
import { RoutePath } from '../../types';
import { useApp } from '../../stores';

export interface AdminAccessDeniedPageProps {
  onNavigate: (route: RoutePath) => void;
}

export const AdminAccessDeniedPage: React.FC<AdminAccessDeniedPageProps> = ({ onNavigate }) => {
  const { session, loginAs, showToast } = useApp();

  const handleEscalateToAdmin = () => {
    loginAs('admin');
    showToast({
      type: 'warning',
      title: 'Privilege Elevated',
      message: 'Switched to Platform Director account. Clearance granted.',
    });
    onNavigate('admin');
  };

  return (
    <div className="min-h-screen bg-[#08090b] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0e1014] border border-[#e11d48]/40 rounded-sm p-6 sm:p-8 flex flex-col gap-6 shadow-[0_0_50px_rgba(225,29,72,0.15)] relative overflow-hidden">
        {/* Top Warning Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#e11d48] to-transparent" />

        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-sm bg-[#e11d48]/15 border border-[#e11d48]/40 text-[#e11d48] flex items-center justify-center shadow-[0_0_24px_rgba(225,29,72,0.3)]">
            <span className="material-symbols-outlined text-[36px]">security</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#e11d48] font-bold">
              Access Denied · 403 Forbidden
            </span>
            <h1 className="font-headline font-bold text-2xl text-white tracking-tight">
              Administrative Clearance Required
            </h1>
          </div>

          <p className="font-body text-xs text-[#869ab8] leading-relaxed max-w-sm">
            The Car 911 Operations Console is reserved for verified Platform Directors. Current session role:{' '}
            <span className="font-mono text-white font-semibold uppercase">{session.role}</span>.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-3 pt-2 border-t border-white/8">
          <button
            type="button"
            onClick={handleEscalateToAdmin}
            className="w-full py-2.5 px-4 rounded-sm bg-[#e11d48] hover:bg-[#be123c] text-white font-headline text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(225,29,72,0.4)] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span>Authenticate as Director Admin</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="w-full py-2 px-4 rounded-sm bg-[#1a1c20] hover:bg-[#252830] text-[#b9c8de] hover:text-white font-mono text-xs border border-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Return to Public Showroom</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-[#869ab8]/60 pt-2 border-t border-white/5">
          <span>SECURITY NODE: US-WEST-01</span>
          <span>PROTOCOL: REST_BEARER_V1</span>
        </div>
      </div>
    </div>
  );
};
