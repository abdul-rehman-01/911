import React, { useState } from 'react';
import { useApp } from '../stores';
import { Button } from '../components/common/Button';
import { VehicleCard } from '../components/domain/VehicleCard';
import { ServiceCard } from '../components/domain/ServiceCard';
import { TelemetryBadge } from '../components/common/TelemetryBadge';
import { Vehicle } from '../types';

export const HomePage: React.FC = () => {
  const {
    navigateTo,
    vehicles,
    services,
    favorites,
    comparedIds,
    toggleFavorite,
    addToCompare,
    removeFromCompare,
    updateFilter,
    resetFilters,
    setSelectedVehicleId,
    showToast,
  } = useApp();

  // Fast Search Bar state
  const [searchTab, setSearchTab] = useState<'all' | 'new' | 'cpo'>('all');
  const [searchMake, setSearchMake] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchBudget, setSearchBudget] = useState('');

  // Featured vehicles filter tab
  const [featuredTab, setFeaturedTab] = useState<'latest' | 'trending' | 'track' | 'electric'>('latest');

  const handleFastSearch = (e: React.FormEvent) => {
    e.preventDefault();
    resetFilters();

    if (searchMake) {
      updateFilter('makes', [searchMake]);
    }
    if (searchCategory) {
      updateFilter('bodyClasses', [searchCategory as any]);
    }
    if (searchBudget) {
      const maxPrice = parseInt(searchBudget, 10) * 1000;
      updateFilter('priceRange', [50000, maxPrice]);
    }
    if (searchTab === 'cpo') {
      updateFilter('onlyCertified', true);
    }

    navigateTo('explore-cars');
    showToast({
      type: 'info',
      title: 'Filter Console Calibrated',
      message: 'Filtered inventory matching your parameters.',
    });
  };

  const handleCategoryClick = (category: string) => {
    resetFilters();
    updateFilter('bodyClasses', [category as any]);
    navigateTo('explore-cars');
  };

  // Filter featured vehicles by tab
  const featuredVehicles = React.useMemo(() => {
    switch (featuredTab) {
      case 'trending':
        return vehicles.filter((v) => v.priceUsd >= 200000).slice(0, 4);
      case 'track':
        return vehicles
          .filter((v) => v.telemetry.outputHp >= 500 && v.bodyClass === 'Supercars')
          .concat(vehicles.filter((v) => v.tags.some((t) => t.toLowerCase().includes('track'))))
          .slice(0, 4);
      case 'electric':
        return vehicles.filter((v) => v.telemetry.fuelType === 'Full Electric' || v.telemetry.fuelType === 'PHEV').slice(0, 4);
      case 'latest':
      default:
        // Match the 4 featured hero models from approved Stitch: GT3 RS, Vantage, Artura, RS e-tron GT
        return [
          vehicles.find((v) => v.id === 'v-porsche-911-gt3-rs'),
          vehicles.find((v) => v.id === 'v-aston-martin-vantage'),
          vehicles.find((v) => v.id === 'v-mclaren-artura-hybrid'),
          vehicles.find((v) => v.id === 'v-audi-rs-etron-gt'),
        ].filter((v): v is Vehicle => Boolean(v));
    }
  }, [vehicles, featuredTab]);

  return (
    <div className="flex flex-col w-full">
      {/* SECTION 1: HERO & FAST SEARCH STAGE */}
      <section className="relative w-full -mt-20 overflow-hidden bg-[#0c0e12]">
        <div className="relative w-full min-h-[720px] lg:min-h-[820px] flex items-center">
          {/* Visual Backdrop */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAkbvJl1exiUUwsIX8KqSpbUhIDEUCzxeZZu_kGnvfiKKULoyuQ1fupTMkXgI4dQu64R8hxHd2vAvdVpjWYMn6xD6zlm02ZFnJOo98OluvS_lR6fQlK9mHkQtrJkBqbwuRnKUivvGZAjjQPjAoKi72jVLTdTtwxFtBbLDvt6hLHaRbuBBxUv6V2iTLqcORqchhB_4Bm2lEO_SzhUZ4OkM27carK-y6l1w77epscHsNdpTBxf5pWdf9B6w')",
            }}
          />
          {/* Scrim Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-[#0c0e12]/60 to-[#0c0e12]/80 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0e12] via-[#0c0e12]/50 to-transparent pointer-events-none" />

          {/* Hero Content Container */}
          <div className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-36 pb-20 z-10">
            {/* Top Status Telemetry Tag */}
            <div className="inline-flex items-center gap-2 bg-[#1a1c20]/90 backdrop-blur-md px-3.5 py-1.5 rounded-sm mb-6 border border-white/10 shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#e11d48] animate-pulse" />
              <span className="font-mono text-[11px] text-[#b9c8de] uppercase tracking-widest">
                Global Telemetry Grid Active
              </span>
              <span className="text-[#5c3f40] font-mono">/</span>
              <span className="font-mono text-[11px] text-[#ffb3b6] uppercase font-semibold">
                Live Inventory Access
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-headline font-bold text-4xl sm:text-5xl lg:text-[56px] text-white tracking-tight max-w-4xl mb-4 leading-[1.1]">
              Drive What <span className="text-[#e11d48]">Defines You.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="font-body text-base sm:text-lg text-[#b9c8de] max-w-2xl mb-8 leading-relaxed">
              Discover, compare and acquire verified performance machines with certified telemetry
              intelligence, bespoke concierge delivery, and complete provenance assurance.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-10">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
                onClick={() => navigateTo('explore-cars')}
              >
                Explore Cars
              </Button>
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<span className="material-symbols-outlined text-[20px] text-[#b9c8de]">compare_arrows</span>}
                onClick={() => navigateTo('compare')}
              >
                Compare Vehicles
              </Button>
            </div>

            {/* Fast Search Bar Floating Console */}
            <div className="w-full bg-[#1a1c20]/95 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-white/10 shadow-2xl max-w-5xl">
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setSearchTab('all')}
                  className={`font-mono text-xs px-3 py-1.5 rounded-sm uppercase tracking-wider transition-all cursor-pointer ${
                    searchTab === 'all'
                      ? 'bg-[#e11d48] text-white font-semibold'
                      : 'bg-[#282a2e] text-[#b9c8de] hover:text-white'
                  }`}
                >
                  All Units
                </button>
                <button
                  type="button"
                  onClick={() => setSearchTab('new')}
                  className={`font-mono text-xs px-3 py-1.5 rounded-sm uppercase tracking-wider transition-all cursor-pointer ${
                    searchTab === 'new'
                      ? 'bg-[#e11d48] text-white font-semibold'
                      : 'bg-[#282a2e] text-[#b9c8de] hover:text-white'
                  }`}
                >
                  Brand New Allocations
                </button>
                <button
                  type="button"
                  onClick={() => setSearchTab('cpo')}
                  className={`font-mono text-xs px-3 py-1.5 rounded-sm uppercase tracking-wider transition-all cursor-pointer ${
                    searchTab === 'cpo'
                      ? 'bg-[#e11d48] text-white font-semibold'
                      : 'bg-[#282a2e] text-[#b9c8de] hover:text-white'
                  }`}
                >
                  Certified Pre-Owned
                </button>
              </div>

              {/* Input Fields Strip */}
              <form onSubmit={handleFastSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                {/* Make */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[11px] text-[#b9c8de] uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#e11d48]">directions_car</span>
                    Make &amp; Series
                  </label>
                  <div className="relative bg-[#0c0e12] rounded-sm border border-white/10">
                    <select
                      value={searchMake}
                      onChange={(e) => setSearchMake(e.target.value)}
                      className="w-full bg-transparent text-white font-body text-sm py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-[#e11d48] rounded-sm cursor-pointer"
                    >
                      <option value="" className="bg-[#1e2024]">Select All Makes</option>
                      <option value="Porsche" className="bg-[#1e2024]">Porsche (911 / GT3)</option>
                      <option value="Aston Martin" className="bg-[#1e2024]">Aston Martin (Vantage / DB12)</option>
                      <option value="Ferrari" className="bg-[#1e2024]">Ferrari (Roma / 296)</option>
                      <option value="McLaren" className="bg-[#1e2024]">McLaren (Artura / 750S)</option>
                      <option value="Audi Sport" className="bg-[#1e2024]">Audi Sport (RS GT / R8)</option>
                      <option value="BMW M" className="bg-[#1e2024]">BMW M (M4 CSL / M8)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#b9c8de] pointer-events-none text-[18px]">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Chassis */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[11px] text-[#b9c8de] uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#e11d48]">category</span>
                    Chassis Configuration
                  </label>
                  <div className="relative bg-[#0c0e12] rounded-sm border border-white/10">
                    <select
                      value={searchCategory}
                      onChange={(e) => setSearchCategory(e.target.value)}
                      className="w-full bg-transparent text-white font-body text-sm py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-[#e11d48] rounded-sm cursor-pointer"
                    >
                      <option value="" className="bg-[#1e2024]">Any Silhouette</option>
                      <option value="Coupe" className="bg-[#1e2024]">Aero Coupe</option>
                      <option value="Supercars" className="bg-[#1e2024]">Mid-Engine Supercars</option>
                      <option value="Electric GT" className="bg-[#1e2024]">Electric GT</option>
                      <option value="Perf SUV" className="bg-[#1e2024]">Performance SUV</option>
                      <option value="Cabriolet" className="bg-[#1e2024]">Cabriolet / Spyder</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#b9c8de] pointer-events-none text-[18px]">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Capital Boundary */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[11px] text-[#b9c8de] uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#e11d48]">payments</span>
                    Capital Boundary
                  </label>
                  <div className="relative bg-[#0c0e12] rounded-sm border border-white/10">
                    <select
                      value={searchBudget}
                      onChange={(e) => setSearchBudget(e.target.value)}
                      className="w-full bg-transparent text-white font-body text-sm py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-[#e11d48] rounded-sm cursor-pointer"
                    >
                      <option value="" className="bg-[#1e2024]">Uncapped Allocation</option>
                      <option value="150" className="bg-[#1e2024]">Up to $150,000</option>
                      <option value="200" className="bg-[#1e2024]">Up to $200,000</option>
                      <option value="250" className="bg-[#1e2024]">Up to $250,000</option>
                      <option value="300" className="bg-[#1e2024]">Up to $300,000</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#b9c8de] pointer-events-none text-[18px]">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Trigger Button */}
                <button
                  type="submit"
                  className="w-full bg-[#e11d48] hover:bg-[#db2b4e] text-white font-headline font-semibold text-xs py-2.5 px-4 rounded-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(225,29,72,0.3)] cursor-pointer h-[38px]"
                >
                  <span className="material-symbols-outlined text-[18px]">search</span>
                  <span>Search {vehicles.length} Allocations</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Quick Stats Metric Strip */}
        <div className="w-full bg-[#1a1c20] border-y border-white/8 shadow-md">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#1e2024] rounded-lg text-[#e11d48] border border-white/5">
                <span className="material-symbols-outlined text-[28px]">speed</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-2xl font-bold text-white tracking-tight">1,420+</span>
                <span className="font-mono text-[11px] text-[#b9c8de] uppercase tracking-wider">
                  Curated Supercars &amp; GTs (Demo Index)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#1e2024] rounded-lg text-[#e11d48] border border-white/5">
                <span className="material-symbols-outlined text-[28px]">verified_user</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-2xl font-bold text-white tracking-tight">99.8%</span>
                <span className="font-mono text-[11px] text-[#b9c8de] uppercase tracking-wider">
                  Telemetry Inspection Pass Rate
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#1e2024] rounded-lg text-[#e11d48] border border-white/5">
                <span className="material-symbols-outlined text-[28px]">local_shipping</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-2xl font-bold text-white tracking-tight">48 HR</span>
                <span className="font-mono text-[11px] text-[#b9c8de] uppercase tracking-wider">
                  Nationwide VIP Enclosed Delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: BROWSE BY AUTOMOTIVE CLASS */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-12 max-w-[1440px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-[#e11d48] font-mono text-[11px] uppercase tracking-widest mb-1">
              <span>01</span>
              <span>//</span>
              <span>Chassis Architecture</span>
            </div>
            <h2 className="font-headline font-bold text-3xl sm:text-4xl text-white tracking-tight">
              Browse by Automotive Class
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('explore-cars')}
            className="group inline-flex items-center gap-1 text-[#ffb3b6] hover:text-white transition-colors font-headline text-sm font-semibold cursor-pointer"
          >
            <span>View All Categories</span>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>

        {/* 6 Category Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Coupe', count: '240 Models', icon: 'sports_score' },
            { name: 'Supercars', count: '185 Models', icon: 'electric_bolt' },
            { name: 'Luxury Sedan', count: '310 Models', icon: 'airline_seat_recline_extra' },
            { name: 'Perf SUV', count: '420 Models', icon: 'altitude' },
            { name: 'Electric GT', count: '165 Models', icon: 'ev_station' },
            { name: 'Cabriolet', count: '98 Models', icon: 'sunny' },
          ].map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => handleCategoryClick(cat.name)}
              className="group flex flex-col p-5 bg-[#1a1c20] hover:bg-[#1e2024] transition-all rounded-xl border border-white/8 hover:border-white/20 shadow-md text-left cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-[#0c0e12] group-hover:bg-[#e11d48] text-[#e11d48] group-hover:text-white flex items-center justify-center transition-colors mb-4 border border-white/5">
                <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
              </div>
              <span className="font-headline font-semibold text-base text-white group-hover:text-[#ffb3b6] transition-colors mb-1">
                {cat.name}
              </span>
              <span className="font-mono text-[10px] text-[#b9c8de] uppercase">
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 3: FEATURED VEHICLES SHOWCASE */}
      <section className="w-full py-16 bg-[#0c0e12] border-t border-white/8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-1.5 text-[#e11d48] font-mono text-[11px] uppercase tracking-widest mb-1">
                <span>02</span>
                <span>//</span>
                <span>Allocated Inventory</span>
              </div>
              <h2 className="font-headline font-bold text-3xl sm:text-4xl text-white tracking-tight">
                Featured Vehicles
              </h2>
            </div>

            {/* Filter Sub-Nav */}
            <div className="flex items-center gap-1 p-1 bg-[#1a1c20] rounded-sm border border-white/8 overflow-x-auto">
              {[
                { id: 'latest', label: 'Latest Arrivals' },
                { id: 'trending', label: 'Trending Performance' },
                { id: 'track', label: 'Track Ready' },
                { id: 'electric', label: 'Electric Exotics' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFeaturedTab(tab.id as any)}
                  className={`font-mono text-[11px] px-3 py-1.5 rounded-sm uppercase tracking-wider transition-colors cursor-pointer ${
                    featuredTab === tab.id
                      ? 'bg-[#e11d48] text-white font-semibold'
                      : 'text-[#b9c8de] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4-Card Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {featuredVehicles.map((vehicle) => (
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
        </div>
      </section>

      {/* SECTION 4: WHY CAR 911 / TECHNICAL RIGOR */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-12 max-w-[1440px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-[#e11d48] font-mono text-[11px] uppercase tracking-widest mb-2">
            <span>03</span>
            <span>//</span>
            <span>The Standard of Protocol</span>
          </div>
          <h2 className="font-headline font-bold text-3xl sm:text-4xl text-white tracking-tight mb-3">
            Why Car 911 Technical Rigor Wins
          </h2>
          <p className="font-body text-sm text-[#b9c8de]">
            Every machine acquired through our ecosystem is evaluated using track-grade diagnostics,
            immutable history registries, and transparent market indexing.
          </p>
        </div>

        {/* 6 Benefit Cards Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: 'troubleshoot',
              title: '360-Point Telemetry Inspection',
              desc: 'Comprehensive laser alignment, drivetrain stress analysis, and battery degradation diagnostics run by master technicians before listing authorization.',
            },
            {
              icon: 'ssid_chart',
              title: 'Real-Time Price Indexing',
              desc: 'Dynamic valuation engines calculate depreciation curves and global transaction telemetry so you never overpay for rare build specs.',
            },
            {
              icon: 'storefront',
              title: 'Curated Partner Network',
              desc: 'Vetted performance dealerships and private collectors operating under Car 911 technical standards and transparent transaction guidelines.',
            },
            {
              icon: 'tune',
              title: 'Side-by-Side Dyno & Spec Matrices',
              desc: 'Compare factory output charts, power-to-weight ratios, gear ratios, and apex braking stats in direct head-to-head comparison modules.',
            },
            {
              icon: 'history_edu',
              title: 'Authenticated Title & Provenance',
              desc: 'Legal title verification, DME overrev report reviews, and certified ownership pedigree for complete historical clarity.',
            },
            {
              icon: 'airport_shuttle',
              title: 'Enclosed VIP Handover Logistics',
              desc: 'Climate-controlled enclosed transport arranged directly to your private garage or selected atelier with physical pre-delivery verification (Demo).',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 bg-[#1a1c20] hover:bg-[#1e2024] rounded-xl border border-white/8 transition-all group shadow-md"
            >
              <div className="w-12 h-12 rounded-lg bg-[#0c0e12] group-hover:bg-[#e11d48] text-[#e11d48] group-hover:text-white flex items-center justify-center transition-colors mb-4 border border-white/5">
                <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
              </div>
              <h3 className="font-headline font-semibold text-lg text-white mb-2 tracking-tight">
                {item.title}
              </h3>
              <p className="font-body text-xs text-[#b9c8de] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: FEATURED SERVICES PREVIEW */}
      <section className="w-full py-16 bg-[#1a1c20] border-t border-white/8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-1.5 text-[#e11d48] font-mono text-[11px] uppercase tracking-widest mb-1">
                <span>04</span>
                <span>//</span>
                <span>Ecosystem Solutions</span>
              </div>
              <h2 className="font-headline font-bold text-3xl sm:text-4xl text-white tracking-tight">
                Ownership &amp; Performance Services
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('services')}
              className="group inline-flex items-center gap-1 text-[#ffb3b6] hover:text-white transition-colors font-headline text-sm font-semibold cursor-pointer"
            >
              <span>Explore All Services</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>

          {/* 4 Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.slice(0, 4).map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBookService={(s) => {
                  navigateTo('services');
                  showToast({
                    type: 'info',
                    title: `Service Selected: ${s.name}`,
                    message: 'Redirecting to booking concierge.',
                  });
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: HIGH-IMPACT CALL TO ACTION */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-12 max-w-[1440px] mx-auto">
        <div className="relative w-full rounded-xl overflow-hidden bg-[#1a1c20] p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl">
          {/* Ambient Glows */}
          <div className="absolute -right-24 -top-24 w-96 h-96 bg-[#e11d48]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-24 -bottom-24 w-80 h-80 bg-[#39485a]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 text-[#e11d48] font-mono text-[11px] uppercase tracking-widest mb-3">
              <span>Telemetry Protocol Authorized</span>
            </div>
            <h2 className="font-headline font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-4">
              Find Your Next Machine with Car 911
            </h2>
            <p className="font-body text-base text-[#b9c8de] mb-8 leading-relaxed">
              Explore verified performance vehicles, authenticated provenance logs, and precision dealer transactions today.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
                onClick={() => navigateTo('explore-cars')}
              >
                Explore All Cars
              </Button>
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<span className="material-symbols-outlined text-[20px] text-[#b9c8de]">support_agent</span>}
                onClick={() => navigateTo('contact')}
              >
                Schedule a Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
