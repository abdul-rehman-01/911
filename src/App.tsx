import React, { useState } from 'react';
import { AppProvider, useApp } from './stores';
import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/admin/AdminLayout';
import {
  HomePage,
  ExploreCarsPage,
  VehicleDetailsPage,
  ComparePage,
  ServicesPage,
  ServiceDetailsPage,
  DealersPage,
  DashboardPage,
  FavoritesPage,
  LoginPage,
  RegisterPage,
  AboutPage,
  ContactPage,
  NotFoundPage,
  AdminDashboardPage,
  AdminVehiclesPage,
  AdminBrandsPage,
  AdminCategoriesPage,
  AdminServicesPage,
  AdminDealersPage,
  AdminUsersPage,
  AdminBookingsPage,
  AdminMessagesPage,
  AdminAccessDeniedPage,
} from './pages';
import { Button } from './components/common/Button';
import { Modal } from './components/common/Modal';
import { clearAllDemoStorage } from './utils/storage';
import { RoutePath } from './types';

function AppContent() {
  const {
    currentRoute,
    navigateTo,
    favorites,
    comparedIds,
    toast,
    dismissToast,
    session,
    loginAs,
    logout,
    showToast,
    dealers,
    bookings,
  } = useApp();

  const [diagnosticOpen, setDiagnosticOpen] = useState(false);

  // Check if current active route belongs to the administrative suite
  const isAdminRoute = currentRoute === 'admin' || currentRoute.startsWith('admin/');

  // If attempting to access an admin route without director clearance:
  if (isAdminRoute && session.role !== 'admin') {
    return <AdminAccessDeniedPage onNavigate={navigateTo} />;
  }

  // Render Admin Panels
  if (isAdminRoute && session.role === 'admin') {
    const renderAdminPage = () => {
      switch (currentRoute) {
        case 'admin':
          return <AdminDashboardPage onNavigate={navigateTo} />;
        case 'admin/vehicles':
          return <AdminVehiclesPage onNavigate={navigateTo} />;
        case 'admin/brands':
          return <AdminBrandsPage onNavigate={navigateTo} />;
        case 'admin/categories':
          return <AdminCategoriesPage onNavigate={navigateTo} />;
        case 'admin/services':
          return <AdminServicesPage onNavigate={navigateTo} />;
        case 'admin/dealers':
          return <AdminDealersPage onNavigate={navigateTo} />;
        case 'admin/users':
          return <AdminUsersPage onNavigate={navigateTo} />;
        case 'admin/bookings':
          return <AdminBookingsPage onNavigate={navigateTo} />;
        case 'admin/messages':
          return <AdminMessagesPage onNavigate={navigateTo} />;
        default:
          return <AdminDashboardPage onNavigate={navigateTo} />;
      }
    };

    return (
      <AdminLayout
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        session={session}
        onLogout={logout}
        toast={toast}
        onDismissToast={dismissToast}
      >
        {renderAdminPage()}
      </AdminLayout>
    );
  }

  // Public Showroom and Member Pages
  const renderCurrentPage = () => {
    switch (currentRoute) {
      case 'home':
        return <HomePage />;
      case 'explore-cars':
        return <ExploreCarsPage />;
      case 'vehicle-details':
        return <VehicleDetailsPage />;
      case 'compare':
        return <ComparePage />;
      case 'services':
        return <ServicesPage />;
      case 'service-details':
        return <ServiceDetailsPage />;
      case 'dealers':
        return <DealersPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'favorites':
        return <FavoritesPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'not-found':
        return <NotFoundPage />;
      default:
        return <NotFoundPage />;
    }
  };

  const publicRoutes: { route: RoutePath; label: string }[] = [
    { route: 'home', label: 'Home' },
    { route: 'explore-cars', label: 'Explore Cars' },
    { route: 'vehicle-details', label: 'Vehicle Details' },
    { route: 'compare', label: 'Compare Matrix' },
    { route: 'services', label: 'Services' },
    { route: 'service-details', label: 'Service Details' },
    { route: 'dealers', label: 'Dealers' },
    { route: 'dashboard', label: 'Dashboard' },
    { route: 'favorites', label: 'Favorites' },
    { route: 'login', label: 'Login' },
    { route: 'register', label: 'Register' },
    { route: 'about', label: 'About' },
    { route: 'contact', label: 'Contact' },
    { route: 'not-found', label: '404 Off-Track' },
  ];

  const adminRoutes: { route: RoutePath; label: string }[] = [
    { route: 'admin', label: 'Admin Dashboard' },
    { route: 'admin/vehicles', label: 'Admin Vehicles' },
    { route: 'admin/brands', label: 'Admin Brands' },
    { route: 'admin/categories', label: 'Admin Categories' },
    { route: 'admin/services', label: 'Admin Services' },
    { route: 'admin/dealers', label: 'Admin Dealers' },
    { route: 'admin/users', label: 'Admin Users' },
    { route: 'admin/bookings', label: 'Admin Bookings' },
    { route: 'admin/messages', label: 'Admin Messages' },
  ];

  return (
    <Layout
      currentRoute={currentRoute}
      onNavigate={navigateTo}
      favoritesCount={favorites.length}
      compareCount={comparedIds.length}
      toast={toast}
      onDismissToast={dismissToast}
      userEmail={session.user?.email || null}
      session={session}
      onLogout={logout}
    >
      {renderCurrentPage()}

      {/* Floating Diagnostics / State Hub Trigger (Bottom-Left) */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          type="button"
          onClick={() => setDiagnosticOpen(true)}
          className="bg-[#1a1c20]/90 hover:bg-[#282a2e] text-[#b9c8de] hover:text-white border border-white/10 px-3 py-1.5 rounded-sm font-mono text-[11px] uppercase tracking-wider shadow-xl backdrop-blur-md flex items-center gap-2 cursor-pointer transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-[#4ade80]" />
          <span>Telemetry Hub / State</span>
        </button>
      </div>

      {/* Diagnostic & Testing Modal */}
      <Modal
        isOpen={diagnosticOpen}
        onClose={() => setDiagnosticOpen(false)}
        title="Car 911 Phase 8 Diagnostics & State Console"
        subtitle="Live Platform Inspector"
        maxWidth="lg"
      >
        <div className="flex flex-col gap-4 text-xs font-mono">
          <div className="p-3 bg-[#0c0e12] rounded-sm border border-white/10 flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span className="text-[#b9c8de]">Current Active Route:</span>
              <span className="text-[#ffb3b6] uppercase font-bold">/{currentRoute}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#b9c8de]">Auth Session Role:</span>
              <span className="text-white font-bold uppercase">{session.role} ({session.user?.fullName || 'Guest'})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#b9c8de]">Saved Watchlist (Favorites):</span>
              <span className="text-white font-bold">{favorites.length} vehicles</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#b9c8de]">Compared Vehicles (Max 4):</span>
              <span className="text-white font-bold">{comparedIds.length} vehicles</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#b9c8de]">Active Bookings:</span>
              <span className="text-white font-bold">{bookings.length} reservations</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#b9c8de]">Dealers &amp; Ateliers:</span>
              <span className="text-white font-bold">{dealers.length} locations</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[#b9c8de] uppercase text-[10px]">Switch Demo Persona:</span>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={session.role === 'guest' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => loginAs('guest')}
              >
                Guest
              </Button>
              <Button
                variant={session.role === 'member' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => loginAs('member')}
              >
                VIP Member
              </Button>
              <Button
                variant={session.role === 'admin' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => loginAs('admin')}
              >
                Director Admin
              </Button>
            </div>
          </div>

          {/* Admin Navigation Shortcut if Authorized */}
          {session.role === 'admin' && (
            <div className="flex flex-col gap-2 pt-2 border-t border-[#e11d48]/20 bg-[#e11d48]/5 p-2 rounded-xs">
              <span className="text-[#ffb3b6] uppercase text-[10px] font-bold">
                Admin Console Direct Links (Level 1 Clearance):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {adminRoutes.map((r) => (
                  <button
                    key={r.route}
                    type="button"
                    onClick={() => {
                      navigateTo(r.route);
                      setDiagnosticOpen(false);
                    }}
                    className={`p-1.5 rounded-sm text-center transition-colors text-[11px] truncate ${
                      currentRoute === r.route
                        ? 'bg-[#e11d48] text-white font-bold'
                        : 'bg-[#1e2024] hover:bg-[#282a2e] text-[#ffb3b6] hover:text-white border border-[#e11d48]/30'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <span className="text-[#b9c8de] uppercase text-[10px]">
              Direct Showroom Jump:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-40 overflow-y-auto pr-1">
              {publicRoutes.map((r) => (
                <button
                  key={r.route}
                  type="button"
                  onClick={() => {
                    navigateTo(r.route);
                    setDiagnosticOpen(false);
                  }}
                  className={`p-1.5 rounded-sm text-center transition-colors text-[11px] truncate ${
                    currentRoute === r.route
                      ? 'bg-[#e11d48] text-white font-bold'
                      : 'bg-[#1e2024] hover:bg-[#282a2e] text-[#b9c8de] hover:text-white'
                  }`}
                  title={r.label}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                clearAllDemoStorage();
                showToast({
                  type: 'warning',
                  title: 'Storage Cleared',
                  message: 'Local storage cache purged.',
                });
                setTimeout(() => window.location.reload(), 500);
              }}
              className="text-[#ffb4ab] hover:underline cursor-pointer text-[11px]"
            >
              Reset Local Storage
            </button>
            <Button variant="secondary" size="sm" onClick={() => setDiagnosticOpen(false)}>
              Close Console
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
