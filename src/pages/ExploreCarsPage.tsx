import React, { useState } from 'react';
import { useApp } from '../stores';
import { VehicleCard } from '../components/domain/VehicleCard';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Vehicle } from '../types';

export const ExploreCarsPage: React.FC = () => {
  const {
    navigateTo,
    vehicles,
    favorites,
    comparedIds,
    toggleFavorite,
    addToCompare,
    removeFromCompare,
    filters,
    updateFilter,
    resetFilters,
    filteredVehicles,
    setSelectedVehicleId,
    showToast,
  } = useApp();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Pagination slice
  const totalItems = filteredVehicles.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleMakeToggle = (makeName: string) => {
    const isSelected = filters.makes.some((m) => m.toLowerCase() === makeName.toLowerCase());
    const newMakes = isSelected
      ? filters.makes.filter((m) => m.toLowerCase() !== makeName.toLowerCase())
      : [...filters.makes, makeName];
    updateFilter('makes', newMakes);
    setCurrentPage(1);
  };

  const handleClassToggle = (className: string) => {
    const isSelected = filters.bodyClasses.includes(className);
    const newClasses = isSelected
      ? filters.bodyClasses.filter((c) => c !== className)
      : [...filters.bodyClasses, className];
    updateFilter('bodyClasses', newClasses as any);
    setCurrentPage(1);
  };

  const handleDrivetrainToggle = (dt: string) => {
    const isSelected = filters.drivetrains.includes(dt);
    const newDts = isSelected
      ? filters.drivetrains.filter((d) => d !== dt)
      : [...filters.drivetrains, dt];
    updateFilter('drivetrains', newDts as any);
    setCurrentPage(1);
  };

  const handleTransmissionToggle = (trans: string) => {
    const isSelected = filters.transmissions.some((t) => t.toLowerCase() === trans.toLowerCase());
    const newTrans = isSelected
      ? filters.transmissions.filter((t) => t.toLowerCase() !== trans.toLowerCase())
      : [...filters.transmissions, trans];
    updateFilter('transmissions', newTrans);
    setCurrentPage(1);
  };

  const handlePowertrainToggle = (pt: string) => {
    const isSelected = filters.powertrains.includes(pt);
    const newPts = isSelected
      ? filters.powertrains.filter((p) => p !== pt)
      : [...filters.powertrains, pt];
    updateFilter('powertrains', newPts as any);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Sub-header telemetry banner */}
      <section className="w-full bg-[#111317] border-b border-white/8 py-3.5">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#b9c8de]">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Telemetry Hub
            </button>
            <span className="text-white/20">/</span>
            <span className="text-[#e11d48] font-semibold">Explore Cars</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[#b9c8de] font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#e11d48] animate-ping" />
              <span>Global Telemetry Live</span>
            </div>
            <div className="bg-[#1e2024] px-2.5 py-0.5 rounded-sm font-mono text-[11px] text-[#e2e2e8] border border-white/5">
              INDEX ID: 911-PROD-2025
            </div>
          </div>
        </div>
      </section>

      {/* Main Page Container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 flex flex-col gap-6">
        {/* Title & View Controls Strip */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="font-headline font-bold text-3xl sm:text-4xl text-white uppercase tracking-tight">
                Explore Cars
              </h1>
              <span className="bg-[#1e2024] px-3 py-1 rounded-sm font-mono text-[11px] uppercase text-[#ffb3b6] tracking-wider border border-white/10">
                {vehicles.length} Demo Allocations Indexed
              </span>
            </div>
            <p className="font-body text-sm text-[#b9c8de]">
              Calibrated telemetry index for authenticated track, GT, and hypercar inventory worldwide.
            </p>
          </div>

          {/* View controls & sort */}
          <div className="flex items-center gap-3 bg-[#1a1c20] p-1 rounded-sm border border-white/8 self-start lg:self-auto">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => updateFilter('viewMode', 'grid')}
                aria-label="Grid layout"
                className={`flex items-center justify-center w-8 h-8 rounded-sm transition-all cursor-pointer ${
                  filters.viewMode === 'grid'
                    ? 'bg-[#e11d48] text-white shadow-sm'
                    : 'bg-[#1e2024] text-[#b9c8de] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
              <button
                type="button"
                onClick={() => updateFilter('viewMode', 'list')}
                aria-label="List layout"
                className={`flex items-center justify-center w-8 h-8 rounded-sm transition-all cursor-pointer ${
                  filters.viewMode === 'list'
                    ? 'bg-[#e11d48] text-white shadow-sm'
                    : 'bg-[#1e2024] text-[#b9c8de] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">view_list</span>
              </button>
            </div>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-2 pr-1">
              <span className="font-mono text-[11px] uppercase text-[#b9c8de]">Sort:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value as any)}
                className="bg-[#1e2024] text-white font-mono text-xs px-2.5 py-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#e11d48] cursor-pointer border border-white/5"
              >
                <option value="recommended">Recommended Telemetry</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="horsepower">Output: Horsepower Highest</option>
                <option value="mileage">Odometer: Low to High</option>
                <option value="year">Model Year: Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Global Fast Search Bar & Active Parameter Pills */}
        <div className="w-full bg-[#1a1c20] p-4 rounded-xl border border-white/8 shadow-sm flex flex-col gap-3">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b9c8de] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => {
                updateFilter('searchQuery', e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by make, model, chassis code, or telemetry VIN (e.g. Porsche 911, Vantage, Artura, 992)..."
              className="w-full bg-[#0c0e12] text-white pl-11 pr-10 py-2.5 rounded-sm font-body text-sm placeholder:text-[#39485a] focus:outline-none focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48] transition-all border border-white/10"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => updateFilter('searchQuery', '')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b9c8de] hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Active Parameter Tag Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-[11px] text-[#b9c8de] uppercase mr-1">
                Active Parameters:
              </span>

              {filters.searchQuery && (
                <div className="inline-flex items-center gap-1 bg-[#1e2024] px-2.5 py-0.5 rounded-sm text-white font-mono text-[11px] border border-white/10">
                  <span>Query: "{filters.searchQuery}"</span>
                  <button
                    type="button"
                    onClick={() => updateFilter('searchQuery', '')}
                    className="text-[#b9c8de] hover:text-[#e11d48] leading-none cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}

              {filters.makes.map((make) => (
                <div
                  key={make}
                  className="inline-flex items-center gap-1 bg-[#1e2024] px-2.5 py-0.5 rounded-sm text-white font-mono text-[11px] border border-white/10"
                >
                  <span>Make: {make}</span>
                  <button
                    type="button"
                    onClick={() => handleMakeToggle(make)}
                    className="text-[#b9c8de] hover:text-[#e11d48] leading-none cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}

              {filters.bodyClasses.map((cat) => (
                <div
                  key={cat}
                  className="inline-flex items-center gap-1 bg-[#1e2024] px-2.5 py-0.5 rounded-sm text-white font-mono text-[11px] border border-white/10"
                >
                  <span>Class: {cat}</span>
                  <button
                    type="button"
                    onClick={() => handleClassToggle(cat)}
                    className="text-[#b9c8de] hover:text-[#e11d48] leading-none cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}

              {filters.onlyCertified && (
                <div className="inline-flex items-center gap-1 bg-[#e11d48]/20 text-[#ffb3b6] px-2.5 py-0.5 rounded-sm font-mono text-[11px] border border-[#e11d48]/30">
                  <span>911 Certified</span>
                  <button
                    type="button"
                    onClick={() => updateFilter('onlyCertified', false)}
                    className="text-[#ffb3b6] hover:text-white leading-none cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={resetFilters}
                className="font-mono text-[11px] text-[#ffb3b6] hover:text-white uppercase transition-colors ml-2 underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>

            <div className="text-[#b9c8de] font-mono text-[11px] uppercase">
              Latency: <span className="text-white font-semibold">18ms</span>
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden flex justify-between items-center">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<span className="material-symbols-outlined text-[18px]">tune</span>}
            onClick={() => setMobileFilterOpen(true)}
          >
            Filters ({filters.makes.length + filters.bodyClasses.length})
          </Button>
          <span className="font-mono text-xs text-[#b9c8de]">
            {filteredVehicles.length} Vehicles Found
          </span>
        </div>

        {/* 12-Column Grid: Filter Sidebar (3) + Inventory (9) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:flex lg:col-span-3 w-full bg-[#1a1c20] p-5 rounded-xl border border-white/8 shadow-sm flex-col gap-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#e11d48] text-[20px]">tune</span>
                <h2 className="font-headline font-semibold text-base text-white uppercase tracking-tight">
                  Filters
                </h2>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="font-mono text-[11px] text-[#b9c8de] hover:text-white uppercase transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Valuation Spectrum Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[11px] text-[#b9c8de] uppercase">Valuation Spectrum</span>
                <span className="font-mono text-xs text-white">
                  ${Math.round(filters.priceRange[0] / 1000)}k – ${Math.round(filters.priceRange[1] / 1000)}k
                </span>
              </div>
              <input
                type="range"
                min="50000"
                max="400000"
                step="10000"
                value={filters.priceRange[1]}
                onChange={(e) => {
                  updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value, 10)]);
                  setCurrentPage(1);
                }}
                className="w-full accent-[#e11d48] cursor-pointer bg-[#0c0e12] h-1.5 rounded-sm"
              />
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                <div className="bg-[#0c0e12] p-2 rounded-sm border border-white/5">
                  <span className="block font-mono text-[9px] text-[#b9c8de] uppercase">Min USD</span>
                  <span className="text-white">${filters.priceRange[0].toLocaleString()}</span>
                </div>
                <div className="bg-[#0c0e12] p-2 rounded-sm border border-white/5">
                  <span className="block font-mono text-[9px] text-[#b9c8de] uppercase">Max USD</span>
                  <span className="text-white">${filters.priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Marque / Manufacturer */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[11px] text-[#b9c8de] uppercase">Marque / Manufacturer</span>
              <div className="flex flex-col gap-1 max-h-52 overflow-y-auto pr-1">
                {[
                  { name: 'Porsche', count: 5 },
                  { name: 'Aston Martin', count: 2 },
                  { name: 'McLaren', count: 1 },
                  { name: 'Audi Sport', count: 2 },
                  { name: 'Ferrari', count: 1 },
                  { name: 'BMW M', count: 1 },
                  { name: 'Mercedes-AMG', count: 1 },
                  { name: 'Tesla', count: 1 },
                ].map((item) => {
                  const checked = filters.makes.some((m) => m.toLowerCase() === item.name.toLowerCase());
                  return (
                    <label
                      key={item.name}
                      className="flex items-center justify-between p-1.5 rounded-sm hover:bg-[#1e2024] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleMakeToggle(item.name)}
                          className="w-4 h-4 rounded-sm bg-[#1e2024] accent-[#e11d48]"
                        />
                        <span className="font-body text-xs text-white">{item.name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#b9c8de]">{item.count}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Aero Architecture */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[11px] text-[#b9c8de] uppercase">Aero Architecture</span>
              <div className="flex flex-wrap gap-1.5">
                {['Coupe', 'Supercars', 'Luxury Sedan', 'Perf SUV', 'Electric GT', 'Cabriolet'].map((cat) => {
                  const selected = filters.bodyClasses.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleClassToggle(cat)}
                      className={`px-2.5 py-1 rounded-sm font-mono text-[11px] transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#e11d48] text-white font-semibold'
                          : 'bg-[#1e2024] text-[#b9c8de] hover:text-white border border-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Transmission Unit */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[11px] text-[#b9c8de] uppercase">Transmission Unit</span>
              <div className="flex flex-col gap-1 text-xs">
                {['PDK / Dual-Clutch', '6-Speed Manual', '8-Speed Sport Auto'].map((trans) => {
                  const key = trans.split(' ')[0];
                  const checked = filters.transmissions.some((t) => t.toLowerCase().includes(key.toLowerCase()));
                  return (
                    <label key={trans} className="flex items-center gap-2 text-white cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleTransmissionToggle(key)}
                        className="w-4 h-4 rounded-sm bg-[#1e2024] accent-[#e11d48]"
                      />
                      <span>{trans}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Vectoring / Drivetrain */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[11px] text-[#b9c8de] uppercase">Vectoring / Drivetrain</span>
              <div className="grid grid-cols-3 gap-1">
                {['AWD', 'RWD', 'Quattro'].map((dt) => {
                  const selected = filters.drivetrains.includes(dt);
                  return (
                    <button
                      key={dt}
                      type="button"
                      onClick={() => handleDrivetrainToggle(dt)}
                      className={`py-1 text-center font-mono text-[11px] rounded-sm transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#e11d48] text-white font-semibold'
                          : 'bg-[#1e2024] text-[#b9c8de] hover:text-white border border-white/5'
                      }`}
                    >
                      {dt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Powertrain Configuration */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[11px] text-[#b9c8de] uppercase">Powertrain Configuration</span>
              <div className="flex flex-col gap-1 text-xs">
                {[
                  'Petrol Twin-Turbo',
                  'Naturally Aspirated',
                  'PHEV',
                  'Full Electric',
                ].map((pt) => {
                  const checked = filters.powertrains.includes(pt);
                  return (
                    <label key={pt} className="flex items-center gap-2 text-white cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handlePowertrainToggle(pt)}
                        className="w-4 h-4 rounded-sm bg-[#1e2024] accent-[#e11d48]"
                      />
                      <span>{pt}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Certified Only */}
            <div className="pt-2 border-t border-white/5">
              <label className="flex items-center gap-2 text-xs font-mono text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.onlyCertified}
                  onChange={(e) => {
                    updateFilter('onlyCertified', e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 rounded-sm bg-[#1e2024] accent-[#e11d48]"
                />
                <span>Certified 911 Flagships Only</span>
              </label>
            </div>

            <Button
              variant="secondary"
              fullWidth
              leftIcon={<span className="material-symbols-outlined text-[16px]">refresh</span>}
              onClick={() => {
                showToast({
                  type: 'info',
                  title: 'Stream Recalibrated',
                  message: 'Refreshed query state across all telemetry channels.',
                });
              }}
            >
              Recalibrate Stream
            </Button>
          </aside>

          {/* Main Inventory Section (9 Cols) */}
          <section className="col-span-1 lg:col-span-9 flex flex-col gap-6">
            {paginatedVehicles.length === 0 ? (
              <EmptyState
                icon="search_off"
                title="Zero Allocations Match Specified Parameters"
                description="We could not find any performance vehicles matching your filter criteria. Try expanding your price boundary, clearing the marque filter, or resetting all parameters."
                actionLabel="Reset All Filters"
                onAction={resetFilters}
              />
            ) : (
              <div
                className={`grid gap-6 ${
                  filters.viewMode === 'list'
                    ? 'grid-cols-1'
                    : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                }`}
              >
                {paginatedVehicles.map((vehicle) => (
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

            {/* Pagination Strip */}
            {totalPages > 1 && (
              <div className="bg-[#1a1c20] p-4 rounded-xl border border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[#b9c8de] font-mono text-xs uppercase">
                  Displaying{' '}
                  <span className="text-white font-semibold">
                    {(currentPage - 1) * pageSize + 1} – {Math.min(currentPage * pageSize, totalItems)}
                  </span>{' '}
                  of <span className="text-white font-semibold">{totalItems}</span> Allocations
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="w-9 h-9 rounded-sm bg-[#1e2024] text-[#b9c8de] hover:text-white flex items-center justify-center disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed border border-white/5"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCurrentPage(num)}
                      className={`w-9 h-9 rounded-sm font-mono text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                        currentPage === num
                          ? 'bg-[#e11d48] text-white shadow-sm'
                          : 'bg-[#1e2024] text-[#b9c8de] hover:text-white border border-white/5'
                      }`}
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="w-9 h-9 rounded-sm bg-[#1e2024] text-[#b9c8de] hover:text-white flex items-center justify-center disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed border border-white/5"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}

            {/* VIP Bespoke Sourcing Banner */}
            <div className="relative overflow-hidden bg-[#1a1c20] rounded-xl p-6 sm:p-8 border border-white/8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-[#e11d48]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-lg bg-[#0c0e12] flex items-center justify-center text-[#e11d48] shrink-0 border border-white/10">
                  <span className="material-symbols-outlined text-[32px]">manage_search</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#e11d48] uppercase">
                    <span className="w-2 h-2 rounded-full bg-[#e11d48]" />
                    <span>VIP Acquisition Desk</span>
                  </div>
                  <h4 className="font-headline font-semibold text-lg text-white uppercase tracking-tight">
                    Can't find your exact specification?
                  </h4>
                  <p className="font-body text-xs text-[#b9c8de] max-w-xl">
                    Our global telemetry desk procures unlisted PTS chassis, off-market GT allocations, and private collector assets worldwide.
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                leftIcon={<span className="material-symbols-outlined text-[18px]">handshake</span>}
                onClick={() => navigateTo('contact')}
                className="shrink-0 relative z-10"
              >
                Request Bespoke Sourcing
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
