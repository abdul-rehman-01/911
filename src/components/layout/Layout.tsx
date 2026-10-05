import React, { useState, useEffect } from 'react';
import { RoutePath, ToastMessage, SessionState } from '../../types';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Toast } from '../common/Toast';
import { Modal } from '../common/Modal';

export interface LayoutProps {
  currentRoute: RoutePath;
  onNavigate: (route: RoutePath) => void;
  favoritesCount?: number;
  compareCount?: number;
  toast?: ToastMessage | null;
  onDismissToast?: () => void;
  userEmail?: string | null;
  session?: SessionState;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentRoute,
  onNavigate,
  favoritesCount = 0,
  compareCount = 0,
  toast = null,
  onDismissToast = () => {},
  userEmail,
  session,
  onLogout,
  children,
}) => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Global ⌘K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchModalOpen(false);
    onNavigate('explore-cars');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0e12] text-[#e2e2e8] selection:bg-[#e11d48] selection:text-white">
      {/* Top Fixed Header */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        favoritesCount={favoritesCount}
        compareCount={compareCount}
        onOpenSearch={() => setSearchModalOpen(true)}
        userEmail={userEmail}
        session={session}
        onLogout={onLogout}
      />

      {/* Main Content Stage (pt-20 for sticky navbar offset) */}
      <main className="flex-1 w-full pt-20 flex flex-col">{children}</main>

      {/* Global Footer */}
      <Footer onNavigate={onNavigate} />

      {/* Global Toast System */}
      <Toast toast={toast} onDismiss={onDismissToast} />

      {/* Telemetry Search Dialog (⌘K) */}
      <Modal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        title="Global Telemetry Search"
        subtitle="Live Inventory Stream"
        maxWidth="xl"
      >
        <form onSubmit={handleQuickSearchSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#b9c8de] text-[20px]">
              search
            </span>
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by make, model, chassis (e.g. 992 GT3 RS, Artura, Vantage)..."
              className="w-full bg-[#0c0e12] text-white font-body text-sm pl-10 pr-4 py-3 rounded-sm border border-white/15 focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48] outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="font-mono text-[10px] text-[#b9c8de] uppercase">Quick Filters:</span>
            {['Porsche 911 GT3', 'Aston Martin Vantage', 'McLaren Artura', 'Audi RS e-tron GT'].map(
              (tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    setSearchModalOpen(false);
                    onNavigate('explore-cars');
                  }}
                  className="bg-[#1e2024] hover:bg-[#282a2e] text-[#b9c8de] hover:text-white px-2 py-1 rounded-sm text-xs font-mono border border-white/10 transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              )
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <span className="font-mono text-[10px] text-[#b9c8de]">
              Press <kbd className="px-1.5 py-0.5 bg-[#282a2e] rounded-sm text-white">ESC</kbd> to exit
            </span>
            <button
              type="submit"
              className="bg-[#e11d48] hover:bg-[#db2b4e] text-white font-headline font-semibold text-xs px-4 py-2 rounded-sm cursor-pointer shadow-sm"
            >
              Search Index
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
