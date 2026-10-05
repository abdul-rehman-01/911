import React, { useState } from 'react';
import { useApp } from '../stores';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ErrorState } from '../components/common/ErrorState';

export const ServiceDetailsPage: React.FC = () => {
  const { selectedService, navigateTo, createBooking, showToast } = useApp();

  const service = selectedService;

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [clientName, setClientName] = useState('Julian Vance');
  const [clientEmail, setClientEmail] = useState('driver@car911.com');
  const [clientPhone, setClientPhone] = useState('+1 (555) 911-3829');
  const [vehicleModel, setVehicleModel] = useState('Porsche 911 Carrera 4 GTS');
  const [preferredDate, setPreferredDate] = useState('2026-10-30');
  const [preferredTime, setPreferredTime] = useState('11:00 AM PST');
  const [bookingNotes, setBookingNotes] = useState('');

  if (!service) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 py-20">
        <ErrorState
          title="Service Catalog Item Not Found"
          message="The requested automotive service specification does not exist in the catalog."
          onRetry={() => navigateTo('services')}
        />
      </div>
    );
  }

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBooking({
      serviceId: service.id,
      serviceName: service.name,
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
      title: 'Booking Confirmed (Demo)',
      message: `Scheduled ${service.name} for ${preferredDate}. Viewable in your dashboard.`,
    });
  };

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Sub-Header Breadcrumb */}
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
            <button
              type="button"
              onClick={() => navigateTo('services')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Services
            </button>
            <span className="text-white/20">/</span>
            <span className="text-[#e11d48] font-semibold">{service.name}</span>
          </nav>

          <Button variant="ghost" size="sm" onClick={() => navigateTo('services')}>
            ← Back to All Services
          </Button>
        </div>
      </section>

      {/* Main Service Stage */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10 flex flex-col gap-10">
        {/* Header Hero Banner */}
        <div className="relative rounded-xl bg-[#1a1c20] p-8 sm:p-12 border border-white/10 overflow-hidden shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#e11d48]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col gap-3 relative z-10 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-sm bg-[#0c0e12] text-[#e11d48] border border-white/10">
                <span className="material-symbols-outlined text-[20px]">{service.icon}</span>
              </span>
              <span className="font-mono text-xs font-semibold text-[#e11d48] bg-[#e11d48]/15 px-3 py-1 rounded-sm uppercase tracking-wider">
                {service.category}
              </span>
              <span className="font-mono text-[10px] text-[#b9c8de] border border-white/10 px-2 py-0.5 rounded-sm uppercase">
                Demo Protocol
              </span>
            </div>

            <h1 className="font-headline font-bold text-3xl sm:text-4xl text-white tracking-tight uppercase">
              {service.name}
            </h1>

            <p className="font-body text-sm sm:text-base text-[#b9c8de] leading-relaxed">
              {service.fullDescription}
            </p>
          </div>

          <div className="flex flex-col gap-4 bg-[#0c0e12] p-6 rounded-xl border border-white/10 shrink-0 w-full md:w-80 relative z-10 shadow-lg font-mono text-xs">
            <div className="flex justify-between items-baseline border-b border-white/8 pb-3">
              <span className="text-[#b9c8de] uppercase text-[10px]">Estimated Rate</span>
              <span className="text-white text-base font-bold">{service.priceEstimate}</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-white/8 pb-3">
              <span className="text-[#b9c8de] uppercase text-[10px]">Turnaround Window</span>
              <span className="text-white font-semibold">{service.turnaroundTime}</span>
            </div>
            <Button
              variant="primary"
              size="md"
              fullWidth
              leftIcon={<span className="material-symbols-outlined text-[18px]">calendar_month</span>}
              onClick={() => setBookingModalOpen(true)}
            >
              Book Assessment
            </Button>
          </div>
        </div>

        {/* 2-Column Scope & Protocol Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Key Deliverables & Items Included (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#e11d48] rounded-sm" />
              <h2 className="font-headline font-bold text-xl text-white uppercase tracking-tight">
                Standard Scope of Delivery
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {service.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[#1a1c20] rounded-sm border border-white/8 flex items-start gap-3"
                >
                  <span className="material-symbols-outlined text-[#4ade80] text-[20px] shrink-0 mt-0.5 material-symbols-filled">
                    check_circle
                  </span>
                  <div className="flex flex-col">
                    <span className="font-headline font-semibold text-sm text-white">
                      {feature}
                    </span>
                    <span className="font-body text-xs text-[#b9c8de] mt-0.5">
                      Executed according to master certified procedures with direct engineering sign-off.
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Step-by-Step Procedure */}
            <div className="flex flex-col gap-4 mt-4">
              <h3 className="font-headline font-semibold text-base text-white uppercase tracking-tight">
                Execution Workflow Protocol
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    step: '01',
                    title: 'Intake & Diagnostics Scan',
                    desc: 'Initial OBD/PIWIS diagnostic pull and baseline condition recording.',
                  },
                  {
                    step: '02',
                    title: 'Physical & Laser Audit',
                    desc: 'Thermal imaging, paint thickness gauging, and frame alignment verification.',
                  },
                  {
                    step: '03',
                    title: 'Master Calibration',
                    desc: 'Dedicated technical procedure performed by certified mechanics.',
                  },
                  {
                    step: '04',
                    title: 'Dossier Handover',
                    desc: 'Digital provenance dossier compiled with immutable telemetry stamp.',
                  },
                ].map((s) => (
                  <div key={s.step} className="p-4 bg-[#1a1c20] rounded-sm border border-white/5 flex flex-col gap-1">
                    <span className="font-mono text-xs text-[#e11d48] font-bold">{s.step} // Phase</span>
                    <span className="font-headline font-semibold text-sm text-white">{s.title}</span>
                    <span className="font-body text-xs text-[#b9c8de]">{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legal / Demo Notice & Concierge Box (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="p-6 bg-[#1a1c20] rounded-xl border border-white/8 flex flex-col gap-4 shadow-md">
              <span className="font-mono text-[11px] font-semibold text-[#e11d48] uppercase tracking-widest">
                Concierge Direct Assistance
              </span>
              <p className="font-body text-xs text-[#b9c8de] leading-relaxed">
                Have bespoke technical inquiries regarding race track deployment or enclosed logistics? Our client managers are on standby.
              </p>

              <div className="flex flex-col gap-2 font-mono text-xs text-white">
                <div className="p-3 bg-[#0c0e12] rounded-sm border border-white/5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#e11d48] text-[18px]">call</span>
                  <span>+1 (800) 911-AUTO (Dispatch)</span>
                </div>
                <div className="p-3 bg-[#0c0e12] rounded-sm border border-white/5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#e11d48] text-[18px]">mail</span>
                  <span>concierge@car911.com</span>
                </div>
              </div>

              <Button
                variant="primary"
                fullWidth
                onClick={() => setBookingModalOpen(true)}
              >
                Request Booking Date
              </Button>
            </div>

            <div className="p-4 bg-[#111317] rounded-sm border border-dashed border-white/15 text-[11px] font-body text-[#b9c8de]/70 leading-relaxed">
              <strong className="text-white font-mono block mb-1">Demonstration Notice:</strong>
              Car 911 services, pricing estimates, turnaround windows, and booking reservations are presented for platform evaluation. No real transactions or external bookings will take place.
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={`Book ${service.name}`}
        subtitle="Car 911 Concierge Allocation (Demo)"
        maxWidth="lg"
      >
        <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4 text-xs font-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-[#b9c8de] uppercase">Full Name</label>
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
              <label className="font-mono text-[10px] text-[#b9c8de] uppercase">Vehicle Model</label>
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
            <label className="font-mono text-[10px] text-[#b9c8de] uppercase">Specific Instructions</label>
            <textarea
              rows={3}
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              placeholder="Provide any additional mechanical or scheduling instructions..."
              className="bg-[#0c0e12] text-white p-2.5 rounded-sm border border-white/10"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <Button variant="ghost" size="sm" onClick={() => setBookingModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm Reservation (Demo)
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
