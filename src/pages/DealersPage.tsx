import React, { useState } from 'react';
import { useApp } from '../stores';
import { Button } from '../components/common/Button';
import { DealerCard } from '../components/domain/DealerCard';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { Dealer } from '../types';

export const DealersPage: React.FC = () => {
  const { dealers, navigateTo, showToast } = useApp();

  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDealerModal, setActiveDealerModal] = useState<Dealer | null>(null);

  const cities = ['all', 'Beverly Hills', 'Miami', 'New York', 'Stuttgart', 'London', 'Tokyo'];

  const filteredDealers = dealers.filter((d) => {
    if (selectedCity !== 'all' && d.city !== selectedCity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        d.name.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        d.address.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Sub-Header Banner */}
      <section className="w-full bg-[#111317] border-b border-white/8 py-3.5">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#b9c8de]">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <span className="text-white/20">/</span>
            <span className="text-[#e11d48] font-semibold">Dealership &amp; Atelier Locator</span>
          </nav>

          <span className="bg-[#1e2024] px-2.5 py-0.5 rounded-sm font-mono text-[11px] text-[#ffb3b6] border border-white/5">
            {dealers.length} Demonstration Partner Locations
          </span>
        </div>
      </section>

      {/* Main Page Container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 flex flex-col gap-8">
        {/* Title & Introduction */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/8 pb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#e11d48] rounded-sm" />
              <h1 className="font-headline font-bold text-3xl sm:text-4xl text-white uppercase tracking-tight">
                Global Atelier &amp; Dealership Network
              </h1>
            </div>
            <p className="font-body text-sm text-[#b9c8de] max-w-2xl leading-relaxed">
              Explore our demonstration network of partner performance facilities, private showroom vaults, and handover centers worldwide.
            </p>
          </div>

          <div className="p-3 bg-[#1a1c20] rounded-sm border border-white/8 text-xs font-mono text-[#b9c8de] max-w-md">
            <strong className="text-white">Demonstration Notice:</strong> All atelier locations, physical addresses, and showroom inventory counts represent simulated demonstration assets.
          </div>
        </div>

        {/* Filters & City Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#1a1c20] p-4 rounded-xl border border-white/8 shadow-sm">
          {/* City Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 whitespace-nowrap">
            {cities.map((city) => {
              const active = selectedCity === city;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => setSelectedCity(city)}
                  className={`font-mono text-xs px-3 py-1.5 rounded-sm uppercase tracking-wider transition-all cursor-pointer ${
                    active
                      ? 'bg-[#e11d48] text-white font-semibold shadow-sm'
                      : 'bg-[#1e2024] text-[#b9c8de] hover:text-white border border-white/5'
                  }`}
                >
                  {city === 'all' ? 'All Locations' : city}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#b9c8de] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, address or atelier name..."
              className="w-full bg-[#0c0e12] text-white font-body text-xs pl-9 pr-3 py-2 rounded-sm border border-white/10 focus:outline-none focus:border-[#e11d48]"
            />
          </div>
        </div>

        {/* Global Cartography Map Placeholder Banner */}
        <div className="relative w-full h-64 bg-[#0c0e12] rounded-xl overflow-hidden border border-white/10 flex items-center justify-center p-6 text-center shadow-xl">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 grayscale"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAPPTjeHAsNZHaUr_WtI9aICj1l5OX-hDCxLvvzYvhcwt7hpVgntbC8oIAkWErYDyP_StrBf7EjAJf7Yi_6HnPrFTPjMjhwMvW7yZsD2IjjJqKOTRg3ZF_-e4QL1E1IxV9iRd_969AuNAPPz9oxpzbynfyVs87psbn6AAPILJEAmAcEF5MkW8CvLhEWZ5C4hC8na5EE6X8XDNgIXvlLD5LKXd_6r98OcpK-vzU4X2u6c3bDQV1QmuQZBw')",
            }}
          />
          <div className="relative z-10 flex flex-col items-center gap-2 max-w-lg">
            <span className="material-symbols-outlined text-[#e11d48] text-[36px]">public</span>
            <h3 className="font-headline font-bold text-lg text-white uppercase tracking-tight">
              Global Satellite Telemetry Grid
            </h3>
            <p className="font-body text-xs text-[#b9c8de]">
              Visual cartography preview representing worldwide atelier coordinates (Beverly Hills, Miami, New York, Stuttgart, London, Tokyo).
            </p>
          </div>
        </div>

        {/* Dealers Grid */}
        {filteredDealers.length === 0 ? (
          <EmptyState
            icon="storefront"
            title="Zero Ateliers Located"
            description="No demonstration atelier matches your selected city filter."
            actionLabel="Reset Search"
            onAction={() => {
              setSelectedCity('all');
              setSearchQuery('');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDealers.map((dealer) => (
              <DealerCard
                key={dealer.id}
                dealer={dealer}
                onContactDealer={(d) => {
                  setActiveDealerModal(d);
                }}
                onVideoTour={(d) => {
                  showToast({
                    type: 'success',
                    title: 'Walkaround Reserved (Demo)',
                    message: `Concierge booked for ${d.name} (${d.city}).`,
                  });
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dealer Details & Contact Modal */}
      {activeDealerModal && (
        <Modal
          isOpen={Boolean(activeDealerModal)}
          onClose={() => setActiveDealerModal(null)}
          title={activeDealerModal.name}
          subtitle={`Atelier Coordinates // ${activeDealerModal.city}, ${activeDealerModal.country}`}
          maxWidth="lg"
        >
          <div className="flex flex-col gap-4 text-xs font-body text-[#b9c8de]">
            <div className="p-4 bg-[#0c0e12] rounded-sm border border-white/10 flex flex-col gap-2 font-mono">
              <div className="flex justify-between">
                <span>Location Address:</span>
                <span className="text-white">{activeDealerModal.address}, {activeDealerModal.city}</span>
              </div>
              <div className="flex justify-between">
                <span>Operating Hours:</span>
                <span className="text-white">{activeDealerModal.hours}</span>
              </div>
              <div className="flex justify-between">
                <span>Direct Line:</span>
                <a href={`tel:${activeDealerModal.phone}`} className="text-[#ffb3b6] hover:underline">
                  {activeDealerModal.phone}
                </a>
              </div>
              <div className="flex justify-between">
                <span>Allocated Vehicles on Floor:</span>
                <span className="text-white font-bold">{activeDealerModal.allocatedInventoryCount} units</span>
              </div>
            </div>

            <p className="leading-relaxed">
              Private client consultations, trade appraisals, and delivery coordination are arranged strictly through demonstration client managers.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <Button variant="ghost" size="sm" onClick={() => setActiveDealerModal(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setActiveDealerModal(null);
                  showToast({
                    type: 'info',
                    title: 'Contact Request Staged',
                    message: `Connected with client desk at ${activeDealerModal.city}.`,
                  });
                }}
              >
                Connect with Atelier Desk
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
