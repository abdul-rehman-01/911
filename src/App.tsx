import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AppProvider, useApp } from './stores';
import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/admin/AdminLayout';
import { Button } from './components/common/Button';
import { Modal } from './components/common/Modal';
import { LoadingState } from './components/common/LoadingState';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { clearAllDemoStorage } from './utils/storage';
import { updatePageMeta } from './utils/seo';
import { RoutePath } from './types';

// Critical initial pages are statically imported for instant first-contentful-paint
import { HomePage } from './pages/HomePage';
import { ExploreCarsPage } from './pages/ExploreCarsPage';

// Lazy-loaded secondary showroom and member pages
const VehicleDetailsPage = lazy(() =>
  import('./pages/VehicleDetailsPage').then((m) => ({ default: m.VehicleDetailsPage }))
);
const ComparePage = lazy(() =>
  import('./pages/ComparePage').then((m) => ({ default: m.ComparePage }))
);
const ServicesPage = lazy(() =>
  import('./pages/ServicesPage').then((m) => ({ default: m.ServicesPage }))
);
const ServiceDetailsPage = lazy(() =>
  import('./pages/ServiceDetailsPage').then((m) => ({ default: m.ServiceDetailsPage }))
);
const DealersPage = lazy(() =>
  import('./pages/DealersPage').then((m) => ({ default: m.DealersPage }))
);
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const FavoritesPage = lazy(() =>
  import('./pages/FavoritesPage').then((m) => ({ default: m.FavoritesPage }))
);
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const ContactPage = lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

// Lazy-loaded administrative suite pages
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminVehiclesPage = lazy(() =>
  import('./pages/admin/AdminVehiclesPage').then((m) => ({ default: m.AdminVehiclesPage }))
);
const AdminBrandsPage = lazy(() =>
  import('./pages/admin/AdminBrandsPage').then((m) => ({ default: m.AdminBrandsPage }))
);
const AdminCategoriesPage = lazy(() =>
  import('./pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage }))
);
const AdminServicesPage = lazy(() =>
  import('./pages/admin/AdminServicesPage').then((m) => ({ default: m.AdminServicesPage }))
);
const AdminDealersPage = lazy(() =>
  import('./pages/admin/AdminDealersPage').then((m) => ({ default: m.AdminDealersPage }))
);
const AdminUsersPage = lazy(() =>
  import('./pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage }))
);
const AdminBookingsPage = lazy(() =>
  import('./pages/admin/AdminBookingsPage').then((m) => ({ default: m.AdminBookingsPage }))
);
const AdminMessagesPage = lazy(() =>
  import('./pages/admin/AdminMessagesPage').then((m) => ({ default: m.AdminMessagesPage }))
);
const AdminAccessDeniedPage = lazy(() =>
  import('./pages/admin/AdminAccessDeniedPage').then((m) => ({ default: m.AdminAccessDeniedPage }))
);

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
    selectedVehicle,
  } = useApp();

  const [diagnosticOpen, setDiagnosticOpen] = useState(false);

  // Synchronize SEO titles, canonical links, and social metadata dynamically per route
  useEffect(() => {
    switch (currentRoute) {
      case 'home':
        updatePageMeta({
          title: 'Car 911 — Performance Automotive & Telemetry Platform',
          description:
            'The premier global ecosystem for hypercar acquisition, telemetry intelligence, dyno spec comparisons, dealer network, and bespoke concierge delivery.',
          canonicalPath: '/',
        });
        break;
      case 'explore-cars':
        updatePageMeta({
          title: 'Explore Performance Cars',
          description:
            'Browse our curated collection of verified hypercars, track specials, and homologation coupes with live dyno telemetry data.',
          canonicalPath: '/explore-cars',
        });
        break;
      case 'vehicle-details':
        updatePageMeta({
          title: selectedVehicle
            ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model} Telemetry`
            : 'Vehicle Telemetry Details',
          description: selectedVehicle
            ? `Comprehensive dyno specs, telemetry matrix, and allocation pricing for the ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}.`
            : 'Detailed vehicle telemetry specifications.',
          canonicalPath: '/vehicle-details',
          ogType: 'product',
          ogImage: selectedVehicle?.primaryImage,
        });
        break;
      case 'compare':
        updatePageMeta({
          title: 'Compare Performance Telemetry Matrix',
          description:
            'Head-to-head horsepower, torque curves, 0-60 mph acceleration times, and chassis dynamics comparison.',
          canonicalPath: '/compare',
        });
        break;
      case 'services':
        updatePageMeta({
          title: 'Automotive Performance Services & Armor',
          description:
            'Explore 360-point track inspections, dyno tuning, enclosed logistics, and race armor detailing.',
          canonicalPath: '/services',
        });
        break;
      case 'dealers':
        updatePageMeta({
          title: 'Performance Dealers & Atelier Network',
          description:
            'Locate authorized showroom ateliers and private vaults across Beverly Hills, Miami, London, Stuttgart, and Tokyo.',
          canonicalPath: '/dealers',
        });
        break;
      case 'about':
        updatePageMeta({
          title: 'About Car 911 Automotive Engineering',
          description:
            'Learn about the philosophy, engineering standards, and telemetry infrastructure behind Car 911.',
          canonicalPath: '/about',
        });
        break;
      case 'contact':
        updatePageMeta({
          title: 'Concierge Acquisition Desk & Support',
          description:
            'Connect with our vehicle acquisition specialists, track technicians, and private showroom representatives.',
          canonicalPath: '/contact',
        });
        break;
      case 'login':
        updatePageMeta({
          title: 'Member Authentication Desk',
          description: 'Access your private garage watchlist and authenticated concierge dashboard.',
          canonicalPath: '/login',
          noIndex: true,
        });
        break;
      case 'register':
        updatePageMeta({
          title: 'VIP Client Accreditation',
          description: 'Request access to the Car 911 private telemetry registry.',
          canonicalPath: '/register',
          noIndex: true,
        });
        break;
      case 'dashboard':
        updatePageMeta({
          title: 'Client Garage Dashboard',
          description: 'Private dashboard for registered telemetry drivers and collectors.',
          canonicalPath: '/dashboard',
          noIndex: true,
        });
        break;
      case 'favorites':
        updatePageMeta({
          title: 'Saved Telemetry Watchlist',
          description: 'Private vehicle watchlist and telemetry tracker.',
          canonicalPath: '/favorites',
          noIndex: true,
        });
        break;
      default:
        if (currentRoute.startsWith('admin')) {
          updatePageMeta({
            title: 'Platform Control Console',
            canonicalPath: '/admin',
            noIndex: true,
          });
        } else {
          updatePageMeta({
            title: 'Off-Track (404)',
            description: 'The requested telemetry route does not exist.',
            canonicalPath: '/404',
            noIndex: true,
          });
        }
        break;
    }
  }, [currentRoute, selectedVehicle]);

  // Check if current active route belongs to the administrative suite
  const isAdminRoute = currentRoute === 'admin' || currentRoute.startsWith('admin/');

  // If attempting to access an admin route without director clearance:
  if (isAdminRoute && session.role !== 'admin') {
    return (
      <Suspense fallback={<LoadingState message="Verifying security credentials..." />}>
        <AdminAccessDeniedPage onNavigate={navigateTo} />
      </Suspense>
    );
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
        <ErrorBoundary fallbackTitle="Admin Console Module Interrupted">
          <Suspense fallback={<LoadingState message="Loading administrative console..." />}>
            {renderAdminPage()}
          </Suspense>
        </ErrorBoundary>
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
        return (
          <Suspense fallback={<LoadingState message="Retrieving telemetry schematics..." />}>
            <VehicleDetailsPage />
          </Suspense>
        );
      case 'compare':
        return (
          <Suspense fallback={<LoadingState message="Constructing dyno matrix..." />}>
            <ComparePage />
          </Suspense>
        );
      case 'services':
        return (
          <Suspense fallback={<LoadingState message="Loading service offerings..." />}>
            <ServicesPage />
          </Suspense>
        );
      case 'service-details':
        return (
          <Suspense fallback={<LoadingState message="Loading service specifications..." />}>
            <ServiceDetailsPage />
          </Suspense>
        );
      case 'dealers':
        return (
          <Suspense fallback={<LoadingState message="Loading showroom ateliers..." />}>
            <DealersPage />
          </Suspense>
        );
      case 'dashboard':
        return (
          <Suspense fallback={<LoadingState message="Accessing VIP garage..." />}>
            <DashboardPage />
          </Suspense>
        );
      case 'favorites':
        return (
          <Suspense fallback={<LoadingState message="Loading watchlist..." />}>
            <FavoritesPage />
          </Suspense>
        );
      case 'login':
        return (
          <Suspense fallback={<LoadingState message="Connecting credentials desk..." />}>
            <LoginPage />
          </Suspense>
        );
      case 'register':
        return (
          <Suspense fallback={<LoadingState message="Preparing accreditation desk..." />}>
            <RegisterPage />
          </Suspense>
        );
      case 'about':
        return (
          <Suspense fallback={<LoadingState message="Loading engineering archives..." />}>
            <AboutPage />
          </Suspense>
        );
      case 'contact':
        return (
          <Suspense fallback={<LoadingState message="Opening concierge frequency..." />}>
            <ContactPage />
          </Suspense>
        );
      case 'not-found':
        return (
          <Suspense fallback={<LoadingState message="Navigating track..." />}>
            <NotFoundPage />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingState message="Navigating track..." />}>
            <NotFoundPage />
          </Suspense>
        );
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
      <ErrorBoundary fallbackTitle="Page Rendering Error">
        {renderCurrentPage()}
      </ErrorBoundary>

      {/* Floating Diagnostics / State Hub Trigger (Bottom-Left) */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          type="button"
          onClick={() => setDiagnosticOpen(true)}
          className="bg-[#1a1c20]/90 hover:bg-[#282a2e] text-[#b9c8de] hover:text-white border border-white/10 px-3 py-1.5 rounded-sm font-mono text-[11px] uppercase tracking-wider shadow-xl backdrop-blur-md flex items-center gap-2 cursor-pointer transition-colors"
          aria-label="Open Telemetry Hub and Diagnostics Modal"
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
