import React, { useState } from 'react';
import { useApp } from '../stores';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { Service } from '../types';

export const ServicesPage: React.FC = () => {
  const { services, navigateTo, createBooking, showToast } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [activeServiceForBooking, setActiveServiceForBooking] = useState<Service | null>(null);

  // Booking Form State
  const [clientName, setClientName] = useState('Julian Vance');
  const [clientEmail, setClientEmail] = useState('driver@car911.com');
  const [clientPhone, setClientPhone] = useState('+1 (555) 911-3829');
  const [vehicleModel, setVehicleModel] = useState('Porsche 911 Carrera 4 GTS');
  const [preferredDate, setPreferredDate] = useState('2026-10-28');
  const [preferredTime, setPreferredTime] = useState('10:00 AM PST');
  const [bookingNotes, setBookingNotes] = useState('');

  const categories = [
    'all',
    'Pre-Purchase',
    'Protection',
    'Financing',
    '24/7 Roadside',
    'Performance Tuning',
    'Maintenance',
    'Warranty & Insurance',
    'Valuation',
  ];

  const filteredServices = services.filter((s) => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        s.name.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleOpenBooking = (service: Service) => {
    setActiveServiceForBooking(service);
    setBookingModalOpen(true);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeServiceForBooking) return;

    createBooking({
      serviceId: activeServiceForBooking.id,
      serviceName: activeServiceForBooking.name,
      vehicleModel,
      preferredDate,
      preferredTime,
      clientName,
      clientEmail,
      clientPhone,
      notes: bookingNotes,
    });

    setBookingModalOpen(false);
    showToast({
      type: 'success',
      title: 'Demo Reservation Dispatched',
      message: `Reservation confirmed for ${activeServiceForBooking.name}. Staged in your dashboard.`,
    });
  };

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Sub-Header Banner */}
      <section className="w-full bg-[#111317] border-b border-white/8 py-3.5">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#b9c8de]">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <span className="text-white/20">/</span>
            <span className="text-[#e11d48] font-semibold">Services &amp; Ownership</span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="bg-[#1e2024] px-2.5 py-0.5 rounded-sm font-mono text-[11px] text-[#ffb3b6] border border-white/5">
              8 Certified Services Indexed (Demo Platform)
            </span>
          </div>
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
                Ownership &amp; Performance Services
              </h1>
            </div>
            <p className="font-body text-sm text-[#b9c8de] max-w-2xl leading-relaxed">
              Track-spec pre-purchase inspections, paint protection film armor, dyno diagnostics, and bespoke exotic asset management.
            </p>
          </div>

          <div className="p-3 bg-[#1a1c20] rounded-sm border border-white/8 text-xs font-mono text-[#b9c8de] max-w-md">
            <strong className="text-white">Notice:</strong> Service pricing estimates and scheduling slots are simulated demo references.
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#1a1c20] p-4 rounded-xl border border-white/8 shadow-sm">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 whitespace-nowrap">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`font-mono text-xs px-3 py-1.5 rounded-sm uppercase tracking-wider transition-all cursor-pointer ${
                    active
                      ? 'bg-[#e11d48] text-white font-semibold shadow-sm'
                      : 'bg-[#1e2024] text-[#b9c8de] hover:text-white border border-white/5'
                  }`}
                >
                  {cat === 'all' ? 'All Services' : cat}
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
              placeholder="Search services..."
              className="w-full bg-[#0c0e12] text-white font-body text-xs pl-9 pr-3 py-2 rounded-sm border border-white/10 focus:outline-none focus:border-[#e11d48]"
            />
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <EmptyState
            icon="build"
            title="No Services Match Query"
            description="Try selecting 'All Services' or clearing your search keywords."
            actionLabel="Reset Filters"
            onAction={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-[#1a1c20] hover:bg-[#1e2024] p-6 rounded-xl border border-white/8 shadow-lg flex flex-col justify-between transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="p-3 bg-[#0c0e12] rounded-lg text-[#e11d48] border border-white/5 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[24px]">
                        {service.icon || 'build'}
                      </span>
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-[#e11d48] bg-[#e11d48]/15 px-2.5 py-0.5 rounded-sm uppercase tracking-wider">
                      {service.category}
                    </span>
                  </div>

                  <h3 className="font-headline font-semibold text-lg text-white mb-2 tracking-tight group-hover:text-[#ffb3b6] transition-colors">
                    {service.name}
                  </h3>

                  <p className="font-body text-xs text-[#b9c8de] leading-relaxed mb-4">
                    {service.shortDescription}
                  </p>

                  <div className="flex flex-col gap-1 mb-6 text-xs font-mono">
                    <div className="flex justify-between py-1 border-t border-white/5">
                      <span className="text-[#b9c8de]/70">Duration:</span>
                      <span className="text-white">{service.turnaroundTime}</span>
                    </div>
                    <div className="flex justify-between py-1 border-t border-white/5">
                      <span className="text-[#b9c8de]/70">Est. Rate:</span>
                      <span className="text-white font-semibold">{service.priceEstimate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    leftIcon={<span className="material-symbols-outlined text-[16px]">calendar_month</span>}
                    onClick={() => handleOpenBooking(service)}
                  >
                    Book Service
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => navigateTo('service-details', { serviceId: service.id })}
                  >
                    View Details &amp; Scope
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reusable Booking Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={activeServiceForBooking ? `Reserve ${activeServiceForBooking.name}` : 'Book Service'}
        subtitle="Car 911 Concierge Dispatch (Demo Reservation)"
        maxWidth="lg"
      >
        <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4 text-xs font-body">
          <p className="text-[#b9c8de] leading-relaxed">
            Please provide your contact information and scheduled preference. A master technician will be dispatched to stage this service allocation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-[#b9c8de] uppercase">Client Full Name</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="bg-[#0c0e12] text-white p-2.5 rounded-sm border border-white/10"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-[#b9c8de] uppercase">Direct Email</label>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="bg-[#0c0e12] text-white p-2.5 rounded-sm border border-white/10"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-[#b9c8de] uppercase">Direct Phone</label>
              <input
                type="tel"
                required
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="bg-[#0c0e12] text-white p-2.5 rounded-sm border border-white/10"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-[#b9c8de] uppercase">Target Vehicle Model</label>
              <input
                type="text"
                required
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="bg-[#0c0e12] text-white p-2.5 rounded-sm border border-white/10"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-[#b9c8de] uppercase">Preferred Date</label>
              <input
                type="date"
                required
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="bg-[#0c0e12] text-white p-2.5 rounded-sm border border-white/10"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-[#b9c8de] uppercase">Preferred Time Window</label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="bg-[#0c0e12] text-white p-2.5 rounded-sm border border-white/10 cursor-pointer"
              >
                <option value="09:00 AM PST">09:00 AM PST</option>
                <option value="11:00 AM PST">11:00 AM PST</option>
                <option value="02:00 PM PST">02:00 PM PST</option>
                <option value="04:30 PM PST">04:30 PM PST</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-[#b9c8de] uppercase">Additional Technical Directives</label>
            <textarea
              rows={3}
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              placeholder="e.g. Specific track day inspection focus, DME log readout..."
              className="bg-[#0c0e12] text-white p-2.5 rounded-sm border border-white/10 placeholder:text-[#39485a]"
            />
          </div>

          <p className="text-[11px] text-[#b9c8de]/70 font-mono">
            * Demonstration Notice: This reservation is saved locally in your demo session. No external charges or payment will be processed.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <Button variant="ghost" size="sm" onClick={() => setBookingModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm Reservation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
