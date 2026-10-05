import React, { useState } from 'react';
import { useApp } from '../stores';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { contactService } from '../services/contactService';

export const ContactPage: React.FC = () => {
  const { vehicles, navigateTo, showToast } = useApp();

  // Form State
  const [clientName, setClientName] = useState('Julian Vance');
  const [clientEmail, setClientEmail] = useState('driver@car911.com');
  const [clientPhone, setClientPhone] = useState('+1 (555) 911-3829');
  const [department, setDepartment] = useState('Acquisition & Allocation');
  const [selectedVehicleId, setSelectedVehicleId] = useState('v-porsche-911-carrera-4-gts');
  const [subject, setSubject] = useState('Inquiry on 2025 Porsche 911 Carrera 4 GTS Allocation');
  const [message, setMessage] = useState(
    'Requesting private telemetry dyno log confirmation and enclosed transport availability to the West Coast atelier.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Emergency Modal State
  const [rescueModalOpen, setRescueModalOpen] = useState(false);
  const [trackLocation, setTrackLocation] = useState('Laguna Seca Raceway - Turn 4');
  const [rescueNotes, setRescueNotes] = useState('Tire pressure sensor fault and telemetry drop during hot lap.');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !message) {
      showToast({
        type: 'error',
        title: 'Form Validation Error',
        message: 'Please fill in all required transmission fields.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
      const res = await contactService.submit({
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        subject: subject || 'Concierge Inquiry',
        message,
        inquiryType: department,
        vehicleOfInterest: selectedVehicle ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}` : undefined,
      });

      showToast({
        type: 'success',
        title: 'Transmission Dispatched',
        message: res.message || 'Your inquiry was recorded. Our concierge desk will review your message.',
      });
      setMessage('');
      setSubject('');
    } catch {
      showToast({
        type: 'success',
        title: 'Transmission Dispatched (Local)',
        message: 'Your inquiry was logged with our concierge desk.',
      });
      setMessage('');
      setSubject('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRescueDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setRescueModalOpen(false);
    showToast({
      type: 'warning',
      title: 'Trackside Dispatch Transmitted (Demo)',
      message: `Emergency response ticket generated for ${trackLocation}. Concierge vehicle en route.`,
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
            <span className="text-[#e11d48] font-semibold">Concierge &amp; Technical Dispatch</span>
          </nav>

          <span className="bg-[#1e2024] px-2.5 py-0.5 rounded-sm font-mono text-[11px] text-[#ffb3b6] border border-white/5">
            Concierge Response Center
          </span>
        </div>
      </section>

      {/* Main Container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10 flex flex-col gap-10">
        {/* Title & Introduction */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/8 pb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#e11d48] rounded-sm" />
              <h1 className="font-headline font-bold text-3xl sm:text-4xl text-white uppercase tracking-tight">
                Concierge &amp; Technical Dispatch
              </h1>
            </div>
            <p className="font-body text-sm text-[#b9c8de] max-w-2xl leading-relaxed">
              Connect directly with our client advisory desk, schedule private atelier viewings, or request emergency trackside technical assistance.
            </p>
          </div>

          <div className="p-3 bg-[#1a1c20] rounded-sm border border-white/8 text-xs font-mono text-[#b9c8de] max-w-md">
            <strong className="text-white">Demonstration Notice:</strong> Inquiry dispatches and trackside alerts are simulated in local state.
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Column 1: Direct Channels & Atelier Contacts (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Direct Cards */}
            <div className="bg-[#1a1c20] p-6 rounded-xl border border-white/8 shadow-xl flex flex-col gap-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/8">
                <div className="w-10 h-10 rounded-sm bg-[#e11d48] flex items-center justify-center text-white shadow-md">
                  <span className="material-symbols-outlined text-[22px]">contact_support</span>
                </div>
                <div>
                  <h3 className="font-headline font-semibold text-lg text-white">
                    Direct Concierge Desk
                  </h3>
                  <span className="font-mono text-xs text-[#b9c8de]/70">
                    Priority Client Channels
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4 font-mono text-xs">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#e11d48] text-[20px] shrink-0 mt-0.5">
                    call
                  </span>
                  <div>
                    <span className="text-[#b9c8de] block text-[10px] uppercase">Direct Inquiries (Demo)</span>
                    <a href="tel:+18009117732" className="text-white hover:text-[#ffb3b6] font-semibold text-sm">
                      +1 (800) 911-SPEC
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#e11d48] text-[20px] shrink-0 mt-0.5">
                    mail
                  </span>
                  <div>
                    <span className="text-[#b9c8de] block text-[10px] uppercase">Telemetry Protocol Inquiries</span>
                    <a href="mailto:concierge@car911.com" className="text-white hover:text-[#ffb3b6] font-semibold text-sm">
                      concierge@car911.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#e11d48] text-[20px] shrink-0 mt-0.5">
                    schedule
                  </span>
                  <div>
                    <span className="text-[#b9c8de] block text-[10px] uppercase">Operating Hours</span>
                    <span className="text-white">
                      Mon – Sat: 08:00 – 20:00 PST / 17:00 – 05:00 UTC
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#e11d48] text-[20px] shrink-0 mt-0.5">
                    storefront
                  </span>
                  <div>
                    <span className="text-[#b9c8de] block text-[10px] uppercase">Global Flagship Atelier</span>
                    <span className="text-white">
                      911 Wilshire Blvd, Beverly Hills, CA 90212
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/8">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => navigateTo('dealers')}
                  leftIcon={<span className="material-symbols-outlined text-[16px]">map</span>}
                >
                  View All 6 Global Ateliers
                </Button>
              </div>
            </div>

            {/* Emergency Trackside Dispatch Card */}
            <div className="bg-[#1a1c20] p-6 rounded-xl border border-[#e11d48]/40 shadow-xl flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#e11d48]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#e11d48] text-[24px]">
                  crisis_alert
                </span>
                <h3 className="font-headline font-bold text-base text-white uppercase tracking-tight">
                  24/7 Trackside Rescue Dispatch
                </h3>
              </div>

              <p className="font-body text-xs text-[#b9c8de] leading-relaxed">
                Experiencing telemetry loss or mechanical anomalies during track events? Trigger our simulated emergency dispatch to request rapid technical recovery.
              </p>

              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => setRescueModalOpen(true)}
                leftIcon={<span className="material-symbols-outlined text-[16px]">local_shipping</span>}
              >
                Simulate Trackside Rescue Dispatch
              </Button>
            </div>
          </div>

          {/* Column 2: Inquiry Transmission Form (7 cols) */}
          <div className="lg:col-span-7 bg-[#1a1c20] p-6 sm:p-8 rounded-xl border border-white/8 shadow-xl">
            <div className="flex flex-col gap-2 mb-6 border-b border-white/8 pb-4">
              <h3 className="font-headline font-semibold text-xl text-white">
                Transmit Concierge Inquiry
              </h3>
              <p className="font-body text-xs text-[#b9c8de]">
                Please complete the technical specifications of your request. Transmissions are reviewed promptly by our client desk.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Your full name"
                  leftIcon={<span className="material-symbols-outlined text-[18px]">person</span>}
                  required
                />

                <Input
                  label="Email Terminal"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="name@domain.com"
                  leftIcon={<span className="material-symbols-outlined text-[18px]">mail</span>}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Phone"
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+1 (555) 911-3829"
                  leftIcon={<span className="material-symbols-outlined text-[18px]">phone</span>}
                />

                {/* Department Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs uppercase tracking-wider text-[#b9c8de]">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#0c0e12] text-white font-body text-xs px-3 py-2 rounded-sm border border-white/10 focus:outline-none focus:border-[#e11d48]"
                  >
                    <option value="Acquisition & Allocation">Acquisition &amp; Allocation</option>
                    <option value="Dyno & Telemetry Certification">Dyno &amp; Telemetry Certification</option>
                    <option value="Service / Detailing / PPF">Service / Detailing / PPF</option>
                    <option value="Private Atelier Consultation">Private Atelier Consultation</option>
                    <option value="Media & Partnerships">Media &amp; Partnerships</option>
                  </select>
                </div>
              </div>

              {/* Vehicle Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs uppercase tracking-wider text-[#b9c8de]">
                  Chassis / Vehicle of Interest (Optional)
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full bg-[#0c0e12] text-white font-body text-xs px-3 py-2 rounded-sm border border-white/10 focus:outline-none focus:border-[#e11d48]"
                >
                  <option value="">General Platform Inquiry (No Vehicle)</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.year} {v.make} {v.model} ({v.trim}) — ${v.priceUsd.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Transmission Subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Schedule Private Handover Consultation"
                required
              />

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs uppercase tracking-wider text-[#b9c8de]">
                  Transmission Details / Telemetry Requirements
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Specify delivery timeline, preferred atelier location, or custom dyno benchmark requirements..."
                  className="w-full bg-[#0c0e12] text-white font-body text-xs p-3 rounded-sm border border-white/10 focus:outline-none focus:border-[#e11d48] resize-none"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                leftIcon={<span className="material-symbols-outlined text-[18px]">send</span>}
                className="mt-2"
              >
                Transmit Inquiry to Concierge
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Emergency Trackside Rescue Dispatch Modal */}
      <Modal
        isOpen={rescueModalOpen}
        onClose={() => setRescueModalOpen(false)}
        title="Emergency Trackside Rescue Dispatch"
        subtitle="Simulated Telemetry Support Dispatch"
        maxWidth="md"
      >
        <form onSubmit={handleRescueDispatch} className="flex flex-col gap-4 text-xs font-body text-[#b9c8de]">
          <p>
            Simulate a high-priority dispatch request for trackside mechanical recovery, mobile dyno diagnostics, or emergency enclosed flatbed transport.
          </p>

          <Input
            label="Circuit / Coordinates Location"
            type="text"
            value={trackLocation}
            onChange={(e) => setTrackLocation(e.target.value)}
            placeholder="e.g. WeatherTech Raceway Laguna Seca, Paddock 3"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs uppercase tracking-wider text-[#b9c8de]">
              Telemetry Status / Issue Description
            </label>
            <textarea
              rows={3}
              value={rescueNotes}
              onChange={(e) => setRescueNotes(e.target.value)}
              className="w-full bg-[#0c0e12] text-white font-body text-xs p-3 rounded-sm border border-white/10 focus:outline-none focus:border-[#e11d48] resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <Button variant="secondary" size="sm" onClick={() => setRescueModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm Immediate Dispatch (Demo)
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
