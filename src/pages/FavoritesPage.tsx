import React, { useState } from 'react';
import { useApp } from '../stores';
import { Button } from '../components/common/Button';
import { VehicleCard } from '../components/domain/VehicleCard';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';

export const FavoritesPage: React.FC = () => {
  const {
    favoriteVehicles,
    favorites,
    toggleFavorite,
    clearFavorites,
    comparedIds,
    toggleCompare,
    navigateTo,
    showToast,
  } = useApp();

  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Calculate portfolio telemetry metrics
  const totalValuation = favoriteVehicles.reduce((sum, v) => sum + v.priceUsd, 0);
  const avgHp =
    favoriteVehicles.length > 0
      ? Math.round(
          favoriteVehicles.reduce((sum, v) => sum + v.telemetry.outputHp, 0) /
            favoriteVehicles.length
        )
      : 0;
  const quickestAcceleration =
    favoriteVehicles.length > 0
      ? Math.min(...favoriteVehicles.map((v) => v.telemetry.acceleration0to100))
      : 0;

  const handleClearAll = () => {
    clearFavorites();
    setClearModalOpen(false);
  };

  const handleStageAllForCompare = () => {
    if (favoriteVehicles.length === 0) return;
    if (favoriteVehicles.length > 4) {
      showToast({
        type: 'warning',
        title: 'Comparison Boundary',
        message: 'The comparison matrix supports up to 4 vehicles simultaneously. Staging first 4.',
      });
    }
    favoriteVehicles.slice(0, 4).forEach((v) => {
      if (!comparedIds.includes(v.id)) {
        toggleCompare(v.id);
      }
    });
    navigateTo('compare');
  };

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Sub-Header Breadcrumb */}
      <section className="w-full bg-[#111317] border-b border-white/8 py-3.5">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#b9c8de]">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <span className="text-white/20">/</span>
            <span className="text-[#e11d48] font-semibold">Private Collector Garage</span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="bg-[#1e2024] px-2.5 py-0.5 rounded-sm font-mono text-[11px] text-[#ffb3b6] border border-white/5">
              {favorites.length} Staged Vehicle{favorites.length === 1 ? '' : 's'} (Demo Garage)
            </span>
          </div>
        </div>
      </section>

      {/* Main Page Container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 flex flex-col gap-8">
        {/* Title Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/8 pb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#e11d48] rounded-sm" />
              <h1 className="font-headline font-bold text-3xl sm:text-4xl text-white uppercase tracking-tight">
                Private Collector Garage
              </h1>
            </div>
            <p className="font-body text-sm text-[#b9c8de] max-w-2xl leading-relaxed">
              Your curated portfolio of high-performance vehicles, saved for rapid telemetry benchmarking, dyno comparison, and concierge acquisition dispatch.
            </p>
          </div>

          {/* Action Buttons */}
          {favorites.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<span className="material-symbols-outlined text-[16px]">compare_arrows</span>}
                onClick={handleStageAllForCompare}
              >
                Stage for Compare
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<span className="material-symbols-outlined text-[16px]">delete_sweep</span>}
                onClick={() => setClearModalOpen(true)}
              >
                Clear Watchlist
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<span className="material-symbols-outlined text-[16px]">add</span>}
                onClick={() => navigateTo('explore-cars')}
              >
                Browse Catalog
              </Button>
            </div>
          )}
        </div>

        {/* Portfolio Telemetry Metric Cards (When items exist) */}
        {favorites.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1a1c20] p-4 rounded-xl border border-white/8 shadow-md">
              <span className="font-mono text-[10px] uppercase text-[#b9c8de]/70 tracking-wider">
                Watchlist Count
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-headline font-bold text-2xl text-white">
                  {favoriteVehicles.length}
                </span>
                <span className="font-mono text-xs text-[#b9c8de]">units</span>
              </div>
              <span className="font-mono text-[10px] text-[#4ade80] mt-1 block">Active Telemetry Watch</span>
            </div>

            <div className="bg-[#1a1c20] p-4 rounded-xl border border-white/8 shadow-md">
              <span className="font-mono text-[10px] uppercase text-[#b9c8de]/70 tracking-wider">
                Simulated Portfolio Value
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono font-bold text-2xl text-[#ffb3b6]">
                  ${totalValuation.toLocaleString()}
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#b9c8de]/60 mt-1 block">Demo Est. MSRP Total</span>
            </div>

            <div className="bg-[#1a1c20] p-4 rounded-xl border border-white/8 shadow-md">
              <span className="font-mono text-[10px] uppercase text-[#b9c8de]/70 tracking-wider">
                Average Output
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-headline font-bold text-2xl text-white">
                  {avgHp}
                </span>
                <span className="font-mono text-xs text-[#b9c8de]">HP</span>
              </div>
              <span className="font-mono text-[10px] text-[#b9c8de]/60 mt-1 block">Dyno Benchmark Mean</span>
            </div>

            <div className="bg-[#1a1c20] p-4 rounded-xl border border-white/8 shadow-md">
              <span className="font-mono text-[10px] uppercase text-[#b9c8de]/70 tracking-wider">
                Peak Sprint (0-100)
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-headline font-bold text-2xl text-[#4ade80]">
                  {quickestAcceleration.toFixed(1)}
                </span>
                <span className="font-mono text-xs text-[#b9c8de]">sec</span>
              </div>
              <span className="font-mono text-[10px] text-[#b9c8de]/60 mt-1 block">Fleet Top Metric</span>
            </div>
          </div>
        )}

        {/* View Toggle Bar (if vehicles exist) */}
        {favorites.length > 0 && (
          <div className="flex items-center justify-between border-b border-white/8 pb-4">
            <span className="font-mono text-xs text-[#b9c8de]">
              Showing <span className="text-white font-semibold">{favoriteVehicles.length}</span> performance vehicle{favoriteVehicles.length === 1 ? '' : 's'}
            </span>

            <div className="flex items-center gap-1 bg-[#1a1c20] p-1 rounded-sm border border-white/5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#e11d48] text-white'
                    : 'text-[#b9c8de] hover:text-white'
                }`}
                aria-label="Grid view"
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#e11d48] text-white'
                    : 'text-[#b9c8de] hover:text-white'
                }`}
                aria-label="List view"
              >
                <span className="material-symbols-outlined text-[18px]">view_list</span>
              </button>
            </div>
          </div>
        )}

        {/* Vehicle Collection / Empty State */}
        {favoriteVehicles.length === 0 ? (
          <div className="py-8">
            <EmptyState
              icon="garage"
              title="Your Private Collector Garage is Empty"
              description="You have not saved any hypercars or GTs to your private garage yet. Browse our verified demonstration inventory and click the heart icon on any card to curate your watchlist."
              actionLabel="Explore Available Inventory"
              onAction={() => navigateTo('explore-cars')}
            />
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'flex flex-col gap-4'
            }
          >
            {favoriteVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                isFavorite={true}
                isCompared={comparedIds.includes(vehicle.id)}
                onToggleFavorite={toggleFavorite}
                onToggleCompare={toggleCompare}
                onSelectVehicle={(v) =>
                  navigateTo('vehicle-details', { vehicleId: v.id })
                }
              />
            ))}
          </div>
        )}

        {/* Demo Disclaimer Box */}
        <div className="p-4 bg-[#111317] rounded-xl border border-white/8 text-xs font-mono text-[#b9c8de] flex items-start gap-3">
          <span className="material-symbols-outlined text-[#e11d48] text-[20px] shrink-0 mt-0.5">
            info
          </span>
          <div className="leading-relaxed">
            <strong className="text-white">Demonstration Watchlist System:</strong> All saved chassis, simulated portfolio values, and telemetry figures are stored within client-side local cache for demonstration and design evaluation. No actual financial or physical asset ownership is inferred.
          </div>
        </div>
      </div>

      {/* Confirmation Modal to Clear Favorites */}
      <Modal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Purge Garage Watchlist"
        subtitle="Confirmation Required"
        maxWidth="md"
      >
        <div className="flex flex-col gap-4 text-xs font-body text-[#b9c8de]">
          <p>
            Are you sure you wish to remove all <strong className="text-white">{favorites.length}</strong> vehicles from your private garage watchlist? This will reset your curated portfolio in local browser storage.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <Button variant="secondary" size="sm" onClick={() => setClearModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleClearAll}>
              Confirm Purge
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
