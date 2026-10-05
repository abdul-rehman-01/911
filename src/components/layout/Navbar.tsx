import React, { useState, useRef, useEffect } from 'react';
import { RoutePath, SessionState } from '../../types';

export interface NavbarProps {
  currentRoute: RoutePath;
  onNavigate: (route: RoutePath) => void;
  favoritesCount?: number;
  compareCount?: number;
  onOpenSearch?: () => void;
  userEmail?: string | null;
  session?: SessionState;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  favoritesCount = 0,
  compareCount = 0,
  onOpenSearch,
  session,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = session?.isAuthenticated ?? false;
  const role = session?.role ?? 'guest';
  const user = session?.user ?? null;

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  const navItems: { label: string; route: RoutePath }[] = [
    { label: 'Home', route: 'home' },
    { label: 'Explore Cars', route: 'explore-cars' },
    { label: 'Vehicle Details', route: 'vehicle-details' },
    { label: 'Compare', route: 'compare' },
    { label: 'Services', route: 'services' },
    { label: 'Dealers', route: 'dealers' },
    { label: 'About', route: 'about' },
    { label: 'Contact', route: 'contact' },
  ];

  const handleNavClick = (route: RoutePath) => {
    onNavigate(route);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleLogoutClick = () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    onLogout?.();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0c0e12]/92 backdrop-blur-xl border-b border-white/8 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      <div className="h-20 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 cursor-pointer group text-left"
          >
            {/* High Performance Icon Badge */}
            <div className="w-8 h-8 rounded-sm bg-[#e11d48] flex items-center justify-center text-white shadow-[0_0_16px_rgba(225,29,72,0.4)] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">speed</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-headline font-bold text-lg tracking-wider text-white uppercase">
                CAR <span className="text-[#e11d48]">911</span>
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#b9c8de]/70">
                Telemetry Grid
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden xl:flex items-center gap-1 p-1 rounded-md bg-[#1a1c20] border border-white/5">
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => handleNavClick(item.route)}
                className={`px-3 py-1.5 rounded-sm font-headline text-xs tracking-tight transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#e11d48] text-white font-semibold shadow-[0_0_14px_rgba(225,29,72,0.35)]'
                    : 'text-[#b9c8de] hover:text-white hover:bg-white/5 font-medium'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Quick Actions Cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Telemetry Search Button (Command + K) */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2 bg-[#1e2024] hover:bg-[#282a2e] border border-white/10 px-3 py-1.5 rounded-sm cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[#b9c8de] text-[18px]">search</span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#b9c8de]">
              Telemetry Search
            </span>
            <kbd className="bg-[#333539] text-[#b9c8de] font-mono text-[10px] px-1.5 py-0.5 rounded-sm border border-white/10">
              ⌘K
            </kbd>
          </button>

          {/* Comparison Quick Access */}
          {compareCount > 0 && (
            <button
              type="button"
              onClick={() => handleNavClick('compare')}
              className="relative flex items-center justify-center w-9 h-9 rounded-sm bg-[#1e2024] hover:bg-[#282a2e] text-[#e2e2e8] border border-white/10 transition-colors cursor-pointer"
              aria-label={`Comparison items (${compareCount})`}
            >
              <span className="material-symbols-outlined text-[19px]">compare_arrows</span>
              <span className="absolute -top-1 -right-1 bg-[#39485a] text-white font-mono text-[10px] px-1 min-w-[16px] h-4 rounded-full flex items-center justify-center font-bold">
                {compareCount}
              </span>
            </button>
          )}

          {/* Favorites Watchlist Quick Button */}
          <button
            type="button"
            onClick={() => handleNavClick('favorites')}
            className="relative flex items-center justify-center w-9 h-9 rounded-sm bg-[#1e2024] hover:bg-[#282a2e] text-[#e2e2e8] border border-white/10 transition-colors cursor-pointer"
            aria-label={`Saved favorites (${favoritesCount})`}
          >
            <span className="material-symbols-outlined text-[19px]">favorite</span>
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#e11d48] text-white font-mono text-[10px] px-1 min-w-[16px] h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* AUTH STATE CLUSTER */}
          {isAuthenticated && user ? (
            /* Authenticated User Menu (Member or Admin) */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-2 p-1.5 rounded-sm border transition-colors cursor-pointer ${
                  role === 'admin'
                    ? 'bg-[#e11d48]/15 border-[#e11d48]/40 hover:bg-[#e11d48]/25'
                    : 'bg-[#1a1c20] border-white/10 hover:border-white/20'
                }`}
                aria-expanded={userDropdownOpen}
                aria-label="User Account Menu"
              >
                <div
                  className={`w-7 h-7 rounded-sm flex items-center justify-center font-headline text-xs font-bold ${
                    role === 'admin'
                      ? 'bg-[#e11d48] text-white'
                      : 'bg-[#ffb3b6] text-[#68001a]'
                  }`}
                >
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'C'}
                </div>

                <div className="hidden lg:flex flex-col text-left leading-none pr-1">
                  <span className="font-headline font-semibold text-xs text-white truncate max-w-[110px]">
                    {user.fullName.split(' ')[0]}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#b9c8de]/70">
                    {role === 'admin' ? 'Director' : user.membershipTier}
                  </span>
                </div>

                <span className="material-symbols-outlined text-[16px] text-[#b9c8de]">
                  {userDropdownOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#1a1c20] border border-white/10 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1">
                  {/* User Profile Card */}
                  <div className="p-3 bg-[#0c0e12] rounded-lg border border-white/5 flex flex-col gap-1">
                    <span className="font-headline font-bold text-sm text-white truncate">
                      {user.fullName}
                    </span>
                    <span className="font-mono text-[11px] text-[#b9c8de]/70 truncate">
                      {user.email}
                    </span>
                    <div className="flex items-center gap-2 mt-1 pt-1 border-t border-white/5 font-mono text-[10px]">
                      <span className="text-[#b9c8de]">Tier:</span>
                      <span
                        className={`font-semibold uppercase ${
                          role === 'admin' ? 'text-[#e11d48]' : 'text-[#4ade80]'
                        }`}
                      >
                        {role === 'admin' ? 'Platform Director' : user.membershipTier}
                      </span>
                    </div>
                  </div>

                  {/* Links */}
                  <button
                    type="button"
                    onClick={() => handleNavClick('dashboard')}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-body text-[#b9c8de] hover:text-white hover:bg-white/5 text-left transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#e11d48]">
                      dashboard
                    </span>
                    <span>Client Dashboard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('favorites')}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-body text-[#b9c8de] hover:text-white hover:bg-white/5 text-left transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#ffb3b6]">
                      favorite
                    </span>
                    <span>Private Garage Watchlist</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('compare')}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-body text-[#b9c8de] hover:text-white hover:bg-white/5 text-left transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#38bdf8]">
                      compare_arrows
                    </span>
                    <span>Dyno Comparison Matrix</span>
                  </button>

                  <div className="pt-1 border-t border-white/10 mt-1">
                    <button
                      type="button"
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-body text-[#ffb4ab] hover:bg-[#e11d48]/10 text-left transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        logout
                      </span>
                      <span>Disconnect Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated Guest Actions */
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => handleNavClick('login')}
                className="px-3 py-1.5 rounded-sm font-headline text-xs font-medium text-[#b9c8de] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('register')}
                className="hidden sm:inline-flex items-center justify-center bg-[#1e2024] hover:bg-[#282a2e] text-white border border-white/10 font-headline font-semibold text-xs px-3.5 py-1.5 rounded-sm transition-colors cursor-pointer"
              >
                Register
              </button>
            </div>
          )}

          {/* Explore Inventory CTA */}
          <button
            type="button"
            onClick={() => handleNavClick('explore-cars')}
            className="hidden lg:inline-flex items-center justify-center bg-[#e11d48] hover:bg-[#db2b4e] text-white font-headline font-semibold text-xs px-4 py-2 rounded-sm transition-all shadow-[0_0_20px_rgba(225,29,72,0.25)] hover:shadow-[0_0_24px_rgba(225,29,72,0.4)] cursor-pointer"
          >
            Explore Inventory
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-sm text-[#b9c8de] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#111317] border-b border-white/10 px-4 py-4 animate-in slide-in-from-top-4 duration-200">
          {/* User Status Bar in Mobile Menu */}
          {isAuthenticated && user ? (
            <div className="p-3 bg-[#1a1c20] rounded-lg border border-white/10 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-sm bg-[#e11d48] text-white flex items-center justify-center font-bold text-xs">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'C'}
                </div>
                <div className="flex flex-col">
                  <span className="font-headline font-semibold text-xs text-white">
                    {user.fullName}
                  </span>
                  <span className="font-mono text-[10px] text-[#ffb3b6]">
                    {role === 'admin' ? 'Director Admin' : user.membershipTier}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogoutClick}
                className="font-mono text-[11px] text-[#ffb4ab] hover:underline cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => handleNavClick('login')}
                className="w-full py-2 bg-[#1e2024] hover:bg-[#282a2e] text-white rounded-sm font-headline text-xs font-semibold text-center border border-white/10"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('register')}
                className="w-full py-2 bg-[#e11d48] hover:bg-[#db2b4e] text-white rounded-sm font-headline text-xs font-semibold text-center"
              >
                Apply for Access
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1 mb-4">
            {navItems.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => handleNavClick(item.route)}
                  className={`text-left px-4 py-2.5 rounded-sm font-headline text-sm tracking-tight transition-colors ${
                    isActive
                      ? 'bg-[#e11d48] text-white font-semibold'
                      : 'text-[#b9c8de] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/8 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleNavClick('dashboard')}
              className="w-full flex items-center justify-between p-2.5 rounded-sm bg-[#1a1c20] text-xs font-mono text-[#b9c8de] hover:text-white"
            >
              <span>Client Dashboard</span>
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('favorites')}
              className="w-full flex items-center justify-between p-2.5 rounded-sm bg-[#1a1c20] text-xs font-mono text-[#b9c8de] hover:text-white"
            >
              <span>Private Garage Watchlist</span>
              <span className="font-bold text-[#e11d48]">{favoritesCount}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
