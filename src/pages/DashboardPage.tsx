import React, { useState, useEffect } from 'react';
import { useApp } from '../stores';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { VehicleCard } from '../components/domain/VehicleCard';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { UserProfile } from '../types';

export const DashboardPage: React.FC = () => {
  const {
    session,
    loginAs,
    logout,
    updateProfile,
    favorites,
    favoriteVehicles,
    toggleFavorite,
    comparedIds,
    comparedVehicles,
    removeFromCompare,
    addToCompare,
    bookings,
    updateBookingStatus,
    cancelBooking,
    recentlyViewedVehicles,
    clearRecentlyViewed,
    dealers,
    navigateTo,
    setSelectedVehicleId,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'garage' | 'comparison' | 'bookings' | 'history' | 'profile'>('garage');

  // Cancel Booking Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  // If Guest, display clean guest invitation with one-click demo login
  if (session.role === 'guest' || !session.user) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-xl bg-[#1a1c20] border border-white/10 flex items-center justify-center text-[#e11d48] mb-4 shadow-xl">
          <span className="material-symbols-outlined text-[36px]">lock</span>
        </div>
        <h1 className="font-headline font-bold text-3xl text-white uppercase tracking-tight mb-2">
          Car 911 Private Client Garage
        </h1>
        <p className="font-body text-sm text-[#b9c8de] max-w-lg mb-8 leading-relaxed">
          The dashboard terminal provides private watchlist telemetry, side-by-side dyno matrix comparison, and white-glove service scheduling. Authenticate your terminal to enter.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary" onClick={() => navigateTo('login')}>
            Sign In with Credentials
          </Button>
          <Button variant="secondary" onClick={() => navigateTo('register')}>
            Apply for Membership
          </Button>
          <Button variant="outline" onClick={() => loginAs('member')}>
            One-Click VIP Member Access
          </Button>
          <Button variant="ghost" onClick={() => loginAs('admin')}>
            Director Admin Access
          </Button>
        </div>

        <div className="mt-8 p-3 bg-[#111317] rounded-sm border border-white/5 font-mono text-[11px] text-[#b9c8de]/70 max-w-md">
          Demonstration Client-Side Protection: Sign in with any demonstration account to review private garage features.
        </div>
      </div>
    );
  }

  const user = session.user;
  const isAdmin = session.role === 'admin';

  // Profile Form State
  const [editName, setEditName] = useState(user.fullName || '');
  const [editPhone, setEditPhone] = useState(user.phone || '');
  const [editTier, setEditTier] = useState<UserProfile['membershipTier']>(user.membershipTier || 'Platinum');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.fullName);
      setEditPhone(user.phone);
      setEditTier(user.membershipTier);
    }
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Client name cannot be empty.',
      });
      return;
    }

    setIsSavingProfile(true);
    setTimeout(() => {
      setIsSavingProfile(false);
      updateProfile({
        fullName: editName,
        phone: editPhone,
        membershipTier: editTier,
      });
    }, 300);
  };

  const handleOpenCancel = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (bookingToCancel) {
      cancelBooking(bookingToCancel);
    }
    setCancelModalOpen(false);
    setBookingToCancel(null);
  };

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Top Profile Strip */}
      <section className="w-full bg-[#111317] border-b border-white/8 py-8">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#e11d48] text-white font-headline font-bold text-xl flex items-center justify-center shadow-lg border border-white/20">
              {user.fullName ? user.fullName.charAt(0) : 'C'}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-headline font-bold text-2xl text-white tracking-tight">
                  {user.fullName}
                </h1>
                <span className="bg-[#1e2024] text-[#ffb3b6] px-2.5 py-0.5 rounded-sm font-mono text-[10px] uppercase font-bold border border-white/10">
                  {user.membershipTier}
                </span>
                {isAdmin && (
                  <span className="bg-[#e11d48]/20 text-[#ffdadb] px-2.5 py-0.5 rounded-sm font-mono text-[10px] uppercase font-bold border border-[#e11d48]/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48]" />
                    Platform Director
                  </span>
                )}
              </div>
              <span className="font-mono text-xs text-[#b9c8de]">
                {user.email} • Terminal ID: {user.id}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<span className="material-symbols-outlined text-[16px]">directions_car</span>}
              onClick={() => navigateTo('explore-cars')}
            >
              Explore Inventory
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<span className="material-symbols-outlined text-[16px]">person</span>}
              onClick={() => setActiveTab('profile')}
            >
              Client Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </section>

      {/* Main Dashboard Stage */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 flex flex-col gap-8">
        {/* Admin Overview Banner (Only if role === admin) */}
        {isAdmin && (
          <div className="p-4 bg-[#1a1c20] rounded-xl border border-[#e11d48]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#e11d48] text-[24px]">
                admin_panel_settings
              </span>
              <div>
                <h3 className="font-headline font-semibold text-sm text-white uppercase">
                  Director Administration Mode Active
                </h3>
                <span className="font-body text-xs text-[#b9c8de]">
                  Platform simulation controls enabled: You can confirm pending reservations and inspect global atelier capacity.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#0c0e12] px-3 py-1 rounded-sm text-xs font-mono text-[#ffb3b6] border border-white/10">
                {dealers.length} Ateliers Indexed
              </span>
              <span className="bg-[#0c0e12] px-3 py-1 rounded-sm text-xs font-mono text-[#4ade80] border border-white/10">
                {bookings.length} Total Bookings
              </span>
            </div>
          </div>
        )}

        {/* 5 Metric Summary Cards / Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div
            onClick={() => setActiveTab('garage')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'garage'
                ? 'bg-[#1e2024] border-[#e11d48] shadow-md ring-1 ring-[#e11d48]'
                : 'bg-[#1a1c20] hover:bg-[#1e2024] border-white/8'
            }`}
          >
            <span className="font-mono text-[10px] text-[#b9c8de] uppercase">Private Garage</span>
            <div className="font-mono text-2xl font-bold text-white mt-1">{favorites.length}</div>
            <span className="font-body text-[11px] text-[#b9c8de]/70 mt-1 block">Saved Vehicles</span>
          </div>

          <div
            onClick={() => setActiveTab('comparison')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-[#1e2024] border-[#e11d48] shadow-md ring-1 ring-[#e11d48]'
                : 'bg-[#1a1c20] hover:bg-[#1e2024] border-white/8'
            }`}
          >
            <span className="font-mono text-[10px] text-[#b9c8de] uppercase">Dyno Compare</span>
            <div className="font-mono text-2xl font-bold text-white mt-1">{comparedIds.length} / 4</div>
            <span className="font-body text-[11px] text-[#b9c8de]/70 mt-1 block">Active Staves</span>
          </div>

          <div
            onClick={() => setActiveTab('bookings')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-[#1e2024] border-[#e11d48] shadow-md ring-1 ring-[#e11d48]'
                : 'bg-[#1a1c20] hover:bg-[#1e2024] border-white/8'
            }`}
          >
            <span className="font-mono text-[10px] text-[#b9c8de] uppercase">Reservations</span>
            <div className="font-mono text-2xl font-bold text-white mt-1">{bookings.length}</div>
            <span className="font-body text-[11px] text-[#b9c8de]/70 mt-1 block">Scheduled Slots</span>
          </div>

          <div
            onClick={() => setActiveTab('history')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#1e2024] border-[#e11d48] shadow-md ring-1 ring-[#e11d48]'
                : 'bg-[#1a1c20] hover:bg-[#1e2024] border-white/8'
            }`}
          >
            <span className="font-mono text-[10px] text-[#b9c8de] uppercase">Recent Views</span>
            <div className="font-mono text-2xl font-bold text-white mt-1">
              {recentlyViewedVehicles.length}
            </div>
            <span className="font-body text-[11px] text-[#b9c8de]/70 mt-1 block">Chassis Cached</span>
          </div>

          <div
            onClick={() => setActiveTab('profile')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#1e2024] border-[#e11d48] shadow-md ring-1 ring-[#e11d48]'
                : 'bg-[#1a1c20] hover:bg-[#1e2024] border-white/8'
            }`}
          >
            <span className="font-mono text-[10px] text-[#b9c8de] uppercase">Client Profile</span>
            <div className="font-headline text-lg font-bold text-white mt-1.5 truncate">
              {user.membershipTier}
            </div>
            <span className="font-body text-[11px] text-[#b9c8de]/70 mt-1 block">Account Settings</span>
          </div>
        </div>

        {/* TAB 1: SAVED GARAGE */}
        {activeTab === 'garage' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <h3 className="font-headline font-semibold text-lg text-white">
                Saved Watchlist Portfolio ({favoriteVehicles.length})
              </h3>
              <Button variant="secondary" size="sm" onClick={() => navigateTo('favorites')}>
                Open Full Garage View
              </Button>
            </div>

            {favoriteVehicles.length === 0 ? (
              <EmptyState
                icon="bookmark_border"
                title="Your Private Garage is Empty"
                description="Save hypercars and GTs from our catalog to review their telemetry ratings here."
                actionLabel="Explore Inventory"
                onAction={() => navigateTo('explore-cars')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    isFavorite={true}
                    isCompared={comparedIds.includes(vehicle.id)}
                    onToggleFavorite={toggleFavorite}
                    onToggleCompare={(id) => {
                      if (comparedIds.includes(id)) {
                        removeFromCompare(id);
                      } else {
                        addToCompare(id);
                      }
                    }}
                    onSelectVehicle={(v) => {
                      setSelectedVehicleId(v.id);
                      navigateTo('vehicle-details', { vehicleId: v.id });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACTIVE COMPARISONS */}
        {activeTab === 'comparison' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <h3 className="font-headline font-semibold text-lg text-white">
                Dyno Staging Grid ({comparedVehicles.length} of 4)
              </h3>
              {comparedVehicles.length > 0 && (
                <Button variant="primary" size="sm" onClick={() => navigateTo('compare')}>
                  Launch Dyno Matrix
                </Button>
              )}
            </div>

            {comparedVehicles.length === 0 ? (
              <EmptyState
                icon="compare_arrows"
                title="No Vehicles Staged for Comparison"
                description="Select up to 4 vehicles from the catalog to analyze dyno curves and acceleration side by side."
                actionLabel="Browse Vehicles to Compare"
                onAction={() => navigateTo('explore-cars')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {comparedVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="bg-[#1a1c20] p-4 rounded-xl border border-white/8 flex flex-col justify-between"
                  >
                    <div>
                      <img
                        src={vehicle.primaryImage}
                        alt={vehicle.model}
                        className="w-full h-36 object-cover rounded-lg border border-white/10 mb-3"
                      />
                      <h4 className="font-headline font-semibold text-white text-sm">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h4>
                      <span className="font-mono text-xs text-[#ffb3b6] block mt-0.5">
                        ${vehicle.priceUsd.toLocaleString()}
                      </span>
                      <div className="font-mono text-[11px] text-[#b9c8de]/70 mt-2 flex justify-between py-1 border-t border-white/5">
                        <span>Output:</span>
                        <span className="text-white font-bold">{vehicle.telemetry.outputHp} HP</span>
                      </div>
                      <div className="font-mono text-[11px] text-[#b9c8de]/70 flex justify-between py-1 border-t border-white/5">
                        <span>0-100:</span>
                        <span className="text-white font-bold">{vehicle.telemetry.acceleration0to100}s</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      className="mt-4"
                      onClick={() => removeFromCompare(vehicle.id)}
                    >
                      Remove from Matrix
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SERVICE BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="bg-[#1a1c20] p-6 rounded-xl border border-white/8 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <h3 className="font-headline font-semibold text-lg text-white">
                Scheduled Service Reservations ({bookings.length})
              </h3>
              <Button variant="primary" size="sm" onClick={() => navigateTo('services')}>
                Schedule New Service
              </Button>
            </div>

            {bookings.length === 0 ? (
              <EmptyState
                icon="calendar_month"
                title="No Active Reservations"
                description="Book a trackside inspection, PPF detailing, or tailored financing consultation."
                actionLabel="Explore Services Catalog"
                onAction={() => navigateTo('services')}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-[#b9c8de] uppercase text-[10px]">
                      <th className="py-2.5 px-3">Booking ID</th>
                      <th className="py-2.5 px-3">Service</th>
                      <th className="py-2.5 px-3">Target Machine</th>
                      <th className="py-2.5 px-3">Scheduled Date</th>
                      <th className="py-2.5 px-3">Client Contact</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-b border-white/5 hover:bg-[#0c0e12]/60">
                        <td className="py-3 px-3 text-[#ffb3b6] font-semibold">{b.id}</td>
                        <td className="py-3 px-3 text-white font-headline">{b.serviceName}</td>
                        <td className="py-3 px-3 text-[#b9c8de]">{b.vehicleModel || 'N/A'}</td>
                        <td className="py-3 px-3 text-[#b9c8de]">{b.preferredDate} ({b.preferredTime})</td>
                        <td className="py-3 px-3 text-[#b9c8de]">{b.clientName}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-sm text-[10px] uppercase font-bold ${
                              b.status === 'Confirmed'
                                ? 'bg-[#4ade80]/20 text-[#4ade80]'
                                : b.status === 'Pending'
                                ? 'bg-[#fbbf24]/20 text-[#fbbf24]'
                                : b.status === 'Completed'
                                ? 'bg-[#38bdf8]/20 text-[#38bdf8]'
                                : 'bg-[#ffb4ab]/20 text-[#ffb4ab]'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {isAdmin && b.status === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => updateBookingStatus(b.id, 'Confirmed')}
                              className="text-[#4ade80] hover:underline mr-3 cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                          {b.status !== 'Cancelled' ? (
                            <button
                              type="button"
                              onClick={() => handleOpenCancel(b.id)}
                              className="text-[#ffb4ab] hover:underline cursor-pointer"
                            >
                              Cancel
                            </button>
                          ) : (
                            <span className="text-[#b9c8de]/40">Cancelled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: RECENTLY VIEWED */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <h3 className="font-headline font-semibold text-lg text-white">
                Recent Telemetry Inspections ({recentlyViewedVehicles.length})
              </h3>
              {recentlyViewedVehicles.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<span className="material-symbols-outlined text-[16px]">clear_all</span>}
                  onClick={clearRecentlyViewed}
                >
                  Clear History
                </Button>
              )}
            </div>

            {recentlyViewedVehicles.length === 0 ? (
              <EmptyState
                icon="history"
                title="Zero Browsing Telemetry"
                description="Vehicles you inspect will automatically be cached here for fast recall."
                actionLabel="Explore Inventory"
                onAction={() => navigateTo('explore-cars')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentlyViewedVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    isFavorite={favorites.includes(vehicle.id)}
                    isCompared={comparedIds.includes(vehicle.id)}
                    onToggleFavorite={toggleFavorite}
                    onToggleCompare={(id) => {
                      if (comparedIds.includes(id)) {
                        removeFromCompare(id);
                      } else {
                        addToCompare(id);
                      }
                    }}
                    onSelectVehicle={(v) => {
                      setSelectedVehicleId(v.id);
                      navigateTo('vehicle-details', { vehicleId: v.id });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CLIENT PROFILE & ACCOUNT SETTINGS */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Profile Readout & Status Card (5 cols) */}
            <div className="lg:col-span-5 bg-[#1a1c20] p-6 rounded-xl border border-white/8 shadow-md flex flex-col gap-6">
              <div className="flex items-center gap-4 pb-4 border-b border-white/8">
                <div className="w-14 h-14 rounded-full bg-[#e11d48] text-white font-headline font-bold text-xl flex items-center justify-center shadow-lg">
                  {user.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-white">
                    {user.fullName}
                  </h3>
                  <span className="font-mono text-xs text-[#b9c8de]/70">
                    {user.email}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 font-mono text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-[#b9c8de]">Demo Terminal ID:</span>
                  <span className="text-white font-semibold">{user.id}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-[#b9c8de]">System Role:</span>
                  <span className="text-white font-semibold uppercase">{user.role}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-[#b9c8de]">Membership Tier:</span>
                  <span className="text-[#ffb3b6] font-semibold uppercase">{user.membershipTier}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-[#b9c8de]">Session Status:</span>
                  <span className="text-[#4ade80] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                    Active Demo Session
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#b9c8de]">Accredited Since:</span>
                  <span className="text-white">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="p-3 bg-[#0c0e12] rounded-lg border border-white/5 font-mono text-[11px] text-[#b9c8de]/70 leading-relaxed">
                <strong className="text-white block mb-0.5">Role Boundary:</strong>
                Role elevation to Platform Director is reserved for administrator personas. Normal client accounts cannot self-promote.
              </div>
            </div>

            {/* Right: Editable Profile Settings Form (7 cols) */}
            <div className="lg:col-span-7 bg-[#1a1c20] p-6 sm:p-8 rounded-xl border border-white/8 shadow-md">
              <div className="flex flex-col gap-1 mb-6 border-b border-white/8 pb-4">
                <h3 className="font-headline font-semibold text-xl text-white">
                  Edit Client Profile Settings
                </h3>
                <p className="font-body text-xs text-[#b9c8de]">
                  Modify your client display identity and contact details stored for this demonstration terminal session.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                <Input
                  label="Full Client Name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Julian Vance"
                  leftIcon={<span className="material-symbols-outlined text-[18px]">person</span>}
                  required
                />

                <Input
                  label="Registered Email (Fixed Terminal Identifier)"
                  type="email"
                  value={user.email}
                  disabled
                  leftIcon={<span className="material-symbols-outlined text-[18px]">lock</span>}
                  helperText="Primary email terminal is permanently anchored to this client session."
                />

                <Input
                  label="Contact Phone / Direct Line"
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+1 (555) 911-3829"
                  leftIcon={<span className="material-symbols-outlined text-[18px]">phone</span>}
                />

                {/* Membership Tier Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs uppercase tracking-wider text-[#b9c8de]">
                    Client Membership Tier
                  </label>
                  <select
                    value={editTier}
                    onChange={(e) => setEditTier(e.target.value as UserProfile['membershipTier'])}
                    className="w-full bg-[#0c0e12] text-white font-body text-xs px-3 py-2 rounded-sm border border-white/10 focus:outline-none focus:border-[#e11d48]"
                  >
                    <option value="Platinum">Platinum (Telemetry Tracking &amp; Allocations)</option>
                    <option value="Track VIP">Track VIP (Dyno Analytics &amp; Priority Rescue)</option>
                    <option value="Private Collector">Private Collector (Full Concierge &amp; Vault Allocation)</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-white/8 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#b9c8de]/60">
                    Changes persist in safe local storage.
                  </span>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSavingProfile}
                    leftIcon={<span className="material-symbols-outlined text-[16px]">save</span>}
                  >
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Booking Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Confirm Reservation Cancellation"
        subtitle="Service Slot Release"
        maxWidth="md"
      >
        <div className="flex flex-col gap-4 text-xs font-body text-[#b9c8de]">
          <p>
            Are you sure you wish to cancel reservation <strong className="text-white">{bookingToCancel}</strong>? This slot will be released back to the atelier schedule.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <Button variant="secondary" size="sm" onClick={() => setCancelModalOpen(false)}>
              Keep Reservation
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmCancel}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
