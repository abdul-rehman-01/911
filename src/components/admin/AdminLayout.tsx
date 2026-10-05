import React, { useState } from 'react';
import { RoutePath, SessionState, ToastMessage } from '../../types';
import { Toast } from '../common/Toast';

export interface AdminLayoutProps {
  currentRoute: RoutePath;
  onNavigate: (route: RoutePath) => void;
  session: SessionState;
  onLogout: () => void;
  toast?: ToastMessage | null;
  onDismissToast?: () => void;
  children: React.ReactNode;
}

interface NavItem {
  id: RoutePath;
  label: string;
  icon: string;
  badge?: number;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentRoute,
  onNavigate,
  session,
  onLogout,
  toast = null,
  onDismissToast = () => {},
  children,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navGroups: NavGroup[] = [
    {
      groupTitle: 'OVERVIEW',
      items: [
        { id: 'admin', label: 'Dashboard', icon: 'dashboard' },
      ],
    },
    {
      groupTitle: 'CATALOG',
      items: [
        { id: 'admin/vehicles', label: 'Vehicles', icon: 'directions_car' },
        { id: 'admin/brands', label: 'Brands', icon: 'workspace_premium' },
        { id: 'admin/categories', label: 'Categories', icon: 'category' },
      ],
    },
    {
      groupTitle: 'OPERATIONS',
      items: [
        { id: 'admin/services', label: 'Services', icon: 'build' },
        { id: 'admin/dealers', label: 'Dealers', icon: 'storefront' },
        { id: 'admin/bookings', label: 'Bookings', icon: 'calendar_month' },
      ],
    },
    {
      groupTitle: 'COMMUNICATIONS & ACCESS',
      items: [
        { id: 'admin/users', label: 'Users', icon: 'group' },
        { id: 'admin/messages', label: 'Contact Messages', icon: 'mail' },
      ],
    },
  ];

  const getPageTitle = (route: RoutePath): { title: string; subtitle: string } => {
    switch (route) {
      case 'admin':
        return { title: 'Executive Operations Dashboard', subtitle: 'Platform Telemetry, Catalog Analytics & Live Bookings' };
      case 'admin/vehicles':
        return { title: 'Hypercar Catalog Registry', subtitle: 'Manage Fleet Inventory, Dyno Telemetry & Valuations' };
      case 'admin/brands':
        return { title: 'Automotive Marque Directory', subtitle: 'Manage Global High-Performance Manufacturers' };
      case 'admin/categories':
        return { title: 'Chassis Classifications', subtitle: 'Aerodynamic Architectures & Body Configurations' };
      case 'admin/services':
        return { title: 'White-Glove Concierge Programs', subtitle: 'Manage Trackside Prep, Transport & Dyno Tuning' };
      case 'admin/dealers':
        return { title: 'Showroom & Atelier Network', subtitle: 'Certified Showrooms, Service Facilities & GPS Nodes' };
      case 'admin/users':
        return { title: 'Client & Admin Accreditation', subtitle: 'VIP Collector Tiers, Security Clearance & Profiles' };
      case 'admin/bookings':
        return { title: 'Service Reservation Dispatch', subtitle: 'Live Workshop Logistics & Status Workflows' };
      case 'admin/messages':
        return { title: 'Concierge Inquiry Transmissions', subtitle: 'Client Inbound Telemetry & Bespoke Requests' };
      default:
        return { title: 'Admin Console', subtitle: 'Car 911 Operations Desk' };
    }
  };

  const { title, subtitle } = getPageTitle(currentRoute);

  const handleNavClick = (route: RoutePath) => {
    onNavigate(route);
    setMobileSidebarOpen(false);
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="p-5 border-b border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-[#e11d48] flex items-center justify-center text-white shadow-[0_0_16px_rgba(225,29,72,0.45)]">
              <span className="material-symbols-outlined text-[20px]">speed</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-headline font-bold text-base tracking-wider text-white uppercase">
                CAR <span className="text-[#e11d48]">911</span>
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#ffb3b6] font-semibold">
                  ADMIN CONSOLE
                </span>
                <span className="text-[#4ade80] text-[8px] font-mono">● LIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="p-3 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-230px)]">
          {navGroups.map((group) => (
            <div key={group.groupTitle} className="flex flex-col gap-1">
              <span className="px-3 text-[10px] font-mono uppercase tracking-[0.16em] text-[#869ab8]/70">
                {group.groupTitle}
              </span>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive = currentRoute === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-center justify-between px-3 py-2 rounded-sm text-xs transition-colors cursor-pointer text-left ${
                        isActive
                          ? 'bg-[#e11d48] text-white font-semibold shadow-[0_0_12px_rgba(225,29,72,0.35)]'
                          : 'text-[#b9c8de] hover:text-white hover:bg-white/5 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-white' : 'text-[#869ab8]'}`}>
                          {item.icon}
                        </span>
                        <span className="font-body text-xs truncate">{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-xs ${isActive ? 'bg-white text-[#9f1239]' : 'bg-[#e11d48]/20 text-[#ffb3b6]'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer System Status & Public Link */}
      <div className="p-4 border-t border-white/8 bg-[#0a0c0f] flex flex-col gap-3">
        <div className="p-2.5 rounded-sm bg-[#121418] border border-white/5 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#869ab8]">
            <span>ENGINE:</span>
            <span className="text-[#4ade80] font-semibold">PostgreSQL · Drizzle</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#869ab8]">
            <span>CLEARANCE:</span>
            <span className="text-[#ffb3b6] uppercase font-bold">Director Level 1</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-sm bg-[#1a1c20] hover:bg-[#252830] text-[#b9c8de] hover:text-white text-xs font-mono border border-white/10 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Exit to Showroom</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#08090b] text-[#f1f5f9] flex flex-col antialiased">
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Off-Canvas */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0c0e12] border-r border-white/10 transform transition-transform duration-300 lg:hidden flex flex-col ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex justify-end">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1 rounded-sm text-[#b9c8de] hover:text-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {renderSidebarContent()}
        </div>
      </div>

      <div className="flex flex-1 min-h-screen">
        {/* Desktop Fixed Left Sidebar */}
        <aside className="hidden lg:flex w-68 xl:w-72 bg-[#0c0e12] border-r border-white/8 flex-col shrink-0 sticky top-0 h-screen z-30">
          {renderSidebarContent()}
        </aside>

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Admin Header Bar */}
          <header className="sticky top-0 z-20 h-18 bg-[#0c0e12]/92 backdrop-blur-md border-b border-white/8 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile Menu Trigger */}
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-sm bg-[#1a1c20] text-[#b9c8de] hover:text-white border border-white/10 cursor-pointer"
                aria-label="Toggle Navigation"
              >
                <span className="material-symbols-outlined text-[20px]">menu</span>
              </button>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-headline font-bold text-sm sm:text-base text-white truncate tracking-tight">
                    {title}
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-xs bg-[#e11d48]/15 border border-[#e11d48]/30 font-mono text-[9px] uppercase tracking-wider text-[#ffb3b6]">
                    REST API v1
                  </span>
                </div>
                <span className="hidden md:block font-body text-xs text-[#869ab8] truncate">
                  {subtitle}
                </span>
              </div>
            </div>

            {/* Header Right Actions & Identity */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Admin Persona Identity */}
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-sm bg-[#121418] border border-white/8">
                <div className="w-6 h-6 rounded-sm bg-[#e11d48] text-white flex items-center justify-center font-headline font-bold text-xs">
                  {session.user?.fullName?.charAt(0) || 'D'}
                </div>
                <div className="flex flex-col leading-none text-left">
                  <span className="font-headline font-semibold text-xs text-white">
                    {session.user?.fullName || 'Director Admin'}
                  </span>
                  <span className="font-mono text-[9px] text-[#4ade80] uppercase tracking-wider">
                    Superuser Active
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-1.5 rounded-sm bg-[#1e2024] hover:bg-[#282a2e] text-[#ffb4ab] hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Disconnect Administrator Session"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          {/* Main Stage View */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Global Toast Notifications for Admin */}
      {toast && onDismissToast && <Toast toast={toast} onDismiss={onDismissToast} />}
    </div>
  );
};
