import React, { useState, useMemo } from 'react';
import { useApp } from '../stores';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { VehicleCard } from '../components/domain/VehicleCard';
import { ErrorState } from '../components/common/ErrorState';

export const VehicleDetailsPage: React.FC = () => {
  const {
    selectedVehicle,
    vehicles,
    navigateTo,
    favorites,
    comparedIds,
    toggleFavorite,
    addToCompare,
    removeFromCompare,
    setSelectedVehicleId,
    dealers,
    showToast,
  } = useApp();

  const vehicle = selectedVehicle;

  // Active gallery image state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Equipment tab state
  const [activeEquipmentTab, setActiveEquipmentTab] = useState<string>('chassis');

  // Financing calculator state
  const [downPayment, setDownPayment] = useState<number>(30000);
  const [apr, setApr] = useState<number>(5.49);
  const [termMonths, setTermMonths] = useState<number>(60);
  const [financingModalOpen, setFinancingModalOpen] = useState(false);
  const [testDriveModalOpen, setTestDriveModalOpen] = useState(false);
  const [videoTourModalOpen, setVideoTourModalOpen] = useState(false);

  // Test drive booking form
  const [driverName, setDriverName] = useState('Julian Vance');
  const [driverEmail, setDriverEmail] = useState('driver@car911.com');
  const [preferredDate, setPreferredDate] = useState('2026-10-20');

  // Calculate monthly installment in real-time
  const calculatedMonthly = useMemo(() => {
    if (!vehicle) return 0;
    const principal = Math.max(0, vehicle.priceUsd - downPayment);
    const monthlyRate = apr / 100 / 12;
    if (monthlyRate === 0) return Math.round(principal / termMonths);
    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
    return Math.round(payment);
  }, [vehicle, downPayment, apr, termMonths]);

  if (!vehicle) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 py-20">
        <ErrorState
          title="Vehicle Allocation Not Found"
          message="The requested vehicle allocation ID does not exist or has been relocated in the telemetry registry."
          onRetry={() => navigateTo('explore-cars')}
        />
      </div>
    );
  }

  // Gallery angles
  const galleryItems =
    vehicle.galleryImages && vehicle.galleryImages.length > 0
      ? vehicle.galleryImages
      : [
          {
            url: vehicle.primaryImage,
            caption: 'Front 3/4 Exterior',
            alt: `${vehicle.make} ${vehicle.model} Front View`,
          },
          {
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMGk3ABAbZ0m-sf4nKwFlaOnfpncGX2B0eOcursdLVKOWwTpx09pJFbUxJ-SmtbrLqSxgHFYN0wHo-a0nYYEAR799nS6bVCZDK2VfHHF9msja7mzfhmUuaB4z40o1oT4cqQPQ9v9QqvL1ippwK5FE6nRxh1t9UdpvTvhjUgCnmFqUOb7qqLUoNgHa9bW_Lf5ZDEBzYyt5L_1KdTi8PUoHD-aiiQJfEF6eK5pXRxjOMX_ekcBZcMwrezg',
            caption: 'Profile Silhouette',
            alt: `${vehicle.make} ${vehicle.model} Side Profile`,
          },
          {
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDXK0JSfO3TV934wIxRPcmpOzTMCw3TsKT3MaHsY7MYVL67ehITqUwFo4yXqgo4X9bdss3750PJc91UTDYoBqo267tr8CYxbGDShS-CMnzcM7e_IsbqHh8vBQO9N7tV7AN28tCYfKFWwI4WjTKa9aN42gxzdCAlzgYLx4o52MFJJFnyKvoPHJ23BscH78UjiUjBrCd1wnnkGeQKK4oczhqofOQluuCYnxqdRpTQrVepXY10LiGwQY1ew',
            caption: 'Rear Aerodynamics',
            alt: `${vehicle.make} ${vehicle.model} Rear Exhaust`,
          },
          {
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3S0oE7qcrqd-hs5feW6PuI-SzW4fThxvKGSDq6MwQoFX4zyd-bmTFDb7XgvY4d6G3qpzbeDiKgVP_a6raKRA04cU42skuWbhsGsd-N1qW2WnfmcMLE2dqw_HbdZRRGwg6nTjxHBJ9-QqHxht1atnEASmBAeqlhgbUtxGRkoe3yYYHaqt0Z46vYCRuzuIwCMtF6Q1l2ZdeYeYRJRNUce3YAT2rRDL7eHJQh_PkyA0DZEh51nTuOm5nmA',
            caption: 'Cockpit Architecture',
            alt: `${vehicle.make} ${vehicle.model} Interior Cabin`,
          },
          {
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfmwfBx01CdplX2Oq3zvWDbFbuzG7EbO-jnd0zhH4X_WRN8QzeFCVzFY_vjoZUoFSIFiOBb4b-CRUQkHt2xyeI5_vbOZalh6kFfoQ056Aywl3WGM2xwI4DoFytxntLR-yWCEDuldxKoNDuB2qISGcHvgtBG-bSTeCgsqSCA5wmcuBIL5rLCtdZlguFUqyMqgeXuwUVX5eUxziSLwInQ-yiRlueQd1bWh42jmHIedJRpu3ISEiJzVvGnQ',
            caption: 'Forged Wheels & Brakes',
            alt: `${vehicle.make} ${vehicle.model} Wheels and Brake Calipers`,
          },
        ];

  const activeImage = galleryItems[activeImageIndex] || galleryItems[0];

  // Dealer associated with this vehicle
  const dealer =
    dealers.find((d) => d.id === vehicle.dealerId) || dealers[0];

  // Similar vehicles
  const similarVehicles = vehicles
    .filter((v) => v.id !== vehicle.id)
    .slice(0, 3);

  const isFav = favorites.includes(vehicle.id);
  const isComp = comparedIds.includes(vehicle.id);

  return (
    <div className="flex flex-col w-full pb-20">
      {/* 1. Vehicle Header & Top Breadcrumbs */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-6 pb-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[#b9c8de] font-mono text-[11px] uppercase tracking-wider mb-3 overflow-x-auto whitespace-nowrap">
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
            onClick={() => navigateTo('explore-cars')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Explore Cars
          </button>
          <span className="text-white/20">/</span>
          <span className="text-[#b9c8de]">{vehicle.make}</span>
          <span className="text-white/20">/</span>
          <span className="text-[#e11d48] font-semibold">{vehicle.model}</span>
        </nav>

        {/* Title & Commercial Cluster */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/8 pb-6">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {vehicle.isCertified && (
                <span className="bg-[#1a1c20] text-[#ffb3b6] px-2.5 py-0.5 rounded-sm font-mono text-[11px] tracking-wider uppercase flex items-center gap-1 border border-[#e11d48]/40 shadow-sm">
                  <span className="material-symbols-outlined text-[13px] text-[#e11d48] material-symbols-filled">
                    verified
                  </span>
                  Car 911 Certified
                </span>
              )}
              {vehicle.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-[#1e2024] text-[#b9c8de] px-2.5 py-0.5 rounded-sm font-mono text-[11px] tracking-wider uppercase border border-white/5"
                >
                  {tag}
                </span>
              ))}
              <span className="bg-[#282a2e] text-[#b9c8de]/70 px-2 py-0.5 rounded-sm font-mono text-[10px] tracking-wider uppercase border border-dashed border-white/10">
                Demo Allocation
              </span>
            </div>

            <h1 className="font-headline font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight uppercase">
              {vehicle.year} {vehicle.make} {vehicle.model}{' '}
              {vehicle.chassisCode && (
                <span className="font-mono text-xl sm:text-2xl text-[#b9c8de] font-normal align-middle ml-2">
                  ({vehicle.chassisCode})
                </span>
              )}
            </h1>

            <p className="font-body text-sm sm:text-base text-[#b9c8de]">
              {vehicle.telemetry.engineDisplacement} <span className="text-[#e11d48] font-semibold">•</span>{' '}
              {vehicle.telemetry.outputHp} HP <span className="text-[#e11d48] font-semibold">•</span>{' '}
              {vehicle.telemetry.transmission} <span className="text-[#e11d48] font-semibold">•</span>{' '}
              {vehicle.telemetry.drivetrain} <span className="text-[#e11d48] font-semibold">•</span>{' '}
              {vehicle.exteriorColor}
            </p>
          </div>

          {/* Pricing & Quick Triggers */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <div className="flex flex-col sm:text-right">
              <span className="font-mono text-[11px] text-[#b9c8de] uppercase tracking-widest">
                Acquisition Price
              </span>
              <div className="font-mono text-3xl sm:text-4xl text-white font-bold tracking-tight">
                ${vehicle.priceUsd.toLocaleString()}{' '}
                <span className="text-[#b9c8de] font-mono text-sm font-normal">USD</span>
              </div>
              <span className="font-body text-xs text-[#b9c8de]">
                Estimated{' '}
                <span className="text-[#ffb3b6] font-mono font-semibold">
                  ${calculatedMonthly.toLocaleString()}
                </span>{' '}
                / mo ({termMonths} mo @ {apr}%)
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="primary"
                leftIcon={<span className="material-symbols-outlined text-[18px]">lock</span>}
                onClick={() => setTestDriveModalOpen(true)}
                className="flex-1 sm:flex-none"
              >
                Contact Dealer
              </Button>

              <button
                type="button"
                onClick={() => {
                  if (isComp) {
                    removeFromCompare(vehicle.id);
                  } else {
                    addToCompare(vehicle.id);
                  }
                }}
                className={`p-2.5 rounded-sm border transition-colors cursor-pointer flex items-center justify-center ${
                  isComp
                    ? 'bg-[#e11d48] text-white border-[#e11d48]'
                    : 'bg-[#1e2024] hover:bg-[#282a2e] text-[#e2e2e8] border-white/10'
                }`}
                title="Add to telemetry comparison matrix"
              >
                <span className="material-symbols-outlined text-[20px]">compare_arrows</span>
              </button>

              <button
                type="button"
                onClick={() => toggleFavorite(vehicle.id)}
                className={`p-2.5 rounded-sm border transition-colors cursor-pointer flex items-center justify-center ${
                  isFav
                    ? 'bg-[#1a1c20] text-[#e11d48] border-[#e11d48]/40'
                    : 'bg-[#1e2024] hover:bg-[#282a2e] text-[#b9c8de] border-white/10'
                }`}
                title="Save to watchlist"
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isFav ? 'material-symbols-filled' : ''
                  }`}
                >
                  favorite
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Visual Stage & Quick Acquisition Side Panel */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 my-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main Visual Stage (8 Cols) */}
          <div className="xl:col-span-8 flex flex-col gap-3">
            <div className="relative w-full aspect-[16/9] bg-[#0c0e12] rounded-xl overflow-hidden border border-white/10 shadow-2xl group">
              <img
                src={activeImage.url}
                alt={activeImage.alt}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12]/90 via-transparent to-transparent pointer-events-none" />

              {/* Stage Telemetry HUD Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                <div className="bg-[#0c0e12]/85 backdrop-blur-md px-3 py-1.5 rounded-sm flex items-center gap-2 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-[#e11d48] animate-pulse" />
                  <span className="font-mono text-[11px] text-white uppercase tracking-wider">
                    Telemetry Synced • {vehicle.chassisCode || 'Track Platform'}
                  </span>
                </div>
                <div className="hidden sm:flex bg-[#0c0e12]/85 backdrop-blur-md px-3 py-1.5 rounded-sm items-center gap-1 font-mono text-[11px] text-[#b9c8de] uppercase border border-white/10">
                  VIN: {vehicle.vin}
                </div>
              </div>

              {/* Bottom Action Bar inside Stage */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      showToast({
                        type: 'info',
                        title: '360° Virtual Tour Initialized',
                        message: 'Rotating high-resolution 24-frame chassis viewport (Demo).',
                      })
                    }
                    className="bg-[#0c0e12]/90 hover:bg-[#1e2024] text-white font-mono text-xs px-3.5 py-1.5 rounded-sm backdrop-blur-md transition-colors flex items-center gap-1.5 border border-white/10 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#e11d48]">360</span>
                    <span>360° Virtual Tour (24 Frames)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      showToast({
                        type: 'info',
                        title: 'Monroney PDF Retrieved',
                        message: 'Simulated factory window sticker downloaded (Demo).',
                      })
                    }
                    className="bg-[#0c0e12]/90 hover:bg-[#1e2024] text-[#b9c8de] hover:text-white font-mono text-xs px-3.5 py-1.5 rounded-sm backdrop-blur-md transition-colors flex items-center gap-1.5 border border-white/10 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">description</span>
                    <span>Monroney Sticker (PDF)</span>
                  </button>
                </div>

                <div className="bg-[#0c0e12]/85 backdrop-blur-md text-[#b9c8de] font-mono text-xs px-3 py-1 rounded-sm border border-white/10">
                  <span className="text-white font-semibold">0{activeImageIndex + 1}</span> / 0{galleryItems.length}
                </div>
              </div>
            </div>

            {/* 5 Thumbnail Buttons */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {galleryItems.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`group relative aspect-[16/10] bg-[#0c0e12] rounded-sm overflow-hidden p-0.5 transition-all cursor-pointer border ${
                    activeImageIndex === idx
                      ? 'border-[#e11d48] ring-1 ring-[#e11d48]'
                      : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover rounded-sm"
                  />
                  <span className="absolute bottom-1 left-1 hidden sm:block bg-[#0c0e12]/90 font-mono text-[9px] px-1 text-white uppercase rounded-sm border border-white/10 truncate max-w-[90%]">
                    {img.caption}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Acquisition & VIP Scheduling Side Panel (4 Cols) */}
          <div className="xl:col-span-4 flex flex-col justify-between gap-4">
            <div className="bg-[#1a1c20] p-6 rounded-xl border border-white/8 shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/8 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#e11d48] text-[20px]">speed</span>
                  <span className="font-headline font-semibold text-base text-white uppercase tracking-tight">
                    Instant Allocation
                  </span>
                </div>
                <span className="bg-[#1e2024] text-[#4ade80] font-mono text-[10px] px-2 py-0.5 rounded-sm uppercase font-bold border border-white/5">
                  {vehicle.inStock ? 'In Stock (Demo)' : 'Allocated'}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 text-xs font-body text-[#b9c8de]">
                <div className="flex items-center justify-between py-1.5 bg-[#0c0e12]/50 px-3 rounded-sm border border-white/5">
                  <span>Delivery Status</span>
                  <span className="text-white font-semibold">{vehicle.deliveryStatus}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 bg-[#0c0e12]/50 px-3 rounded-sm border border-white/5">
                  <span>Location Origin</span>
                  <span className="text-white font-semibold">{vehicle.locationOrigin}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 bg-[#0c0e12]/50 px-3 rounded-sm border border-white/5">
                  <span>Warranty Remaining</span>
                  <span className="text-white font-semibold">{vehicle.warranty}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 bg-[#0c0e12]/50 px-3 rounded-sm border border-white/5">
                  <span>Factory Build Date</span>
                  <span className="font-mono text-white">{vehicle.factoryBuildDate}</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#1e2024] rounded-sm border border-white/5 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-[#b9c8de] uppercase">
                    VIP White Glove Option
                  </span>
                  <span className="font-mono text-xs text-[#ffb3b6] font-semibold">Included</span>
                </div>
                <p className="font-body text-xs text-[#b9c8de] leading-relaxed">
                  Enclosed single-car transporter to your private residence anywhere in North America with dedicated handover engineer.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <Button
                  variant="primary"
                  fullWidth
                  leftIcon={<span className="material-symbols-outlined text-[18px]">calendar_month</span>}
                  onClick={() => setTestDriveModalOpen(true)}
                >
                  Schedule VIP Test Drive
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  leftIcon={<span className="material-symbols-outlined text-[18px] text-[#b9c8de]">request_quote</span>}
                  onClick={() => setFinancingModalOpen(true)}
                >
                  Request Custom Lease Sheet
                </Button>
              </div>
            </div>

            {/* Telemetry Signal Health Widget */}
            <div className="bg-[#1a1c20] p-4 rounded-xl border border-white/8 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-[#e11d48]/15 flex items-center justify-center text-[#e11d48] border border-[#e11d48]/30">
                  <span className="material-symbols-outlined text-[22px]">satellite_alt</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] text-[#b9c8de] uppercase">
                    Car 911 Connected Telemetry
                  </span>
                  <span className="font-body text-xs text-white font-medium">
                    ECU Health: {vehicle.ecuHealthScore}% • No DME Over-revs
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#4ade80] text-[22px] material-symbols-filled">
                check_circle
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Key Telemetry & Performance Metrics (6 Cards Grid) */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 my-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#e11d48] rounded-sm" />
            <h2 className="font-headline font-bold text-xl sm:text-2xl text-white uppercase tracking-tight">
              Key Telemetry &amp; Performance
            </h2>
          </div>
          <span className="font-mono text-[11px] text-[#b9c8de] uppercase tracking-wider hidden sm:inline-block">
            Factory Benchmark Data (Demo Calibration)
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[#1a1c20] hover:bg-[#1e2024] p-4 rounded-xl border border-white/8 flex flex-col justify-between transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-[#b9c8de] uppercase">Output Power</span>
              <span className="material-symbols-outlined text-[#e11d48] text-[18px]">bolt</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-2xl font-bold text-white tracking-tight">
                {vehicle.telemetry.outputHp}{' '}
                <span className="text-[#e11d48] text-xs font-mono">HP</span>
              </span>
              <span className="font-mono text-[10px] text-[#b9c8de]/70 truncate">
                @ {vehicle.telemetry.peakRpm.toLocaleString()} RPM Peak
              </span>
            </div>
          </div>

          <div className="bg-[#1a1c20] hover:bg-[#1e2024] p-4 rounded-xl border border-white/8 flex flex-col justify-between transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-[#b9c8de] uppercase">0–100 KM/H</span>
              <span className="material-symbols-outlined text-[#e11d48] text-[18px]">timer</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-2xl font-bold text-white tracking-tight">
                {vehicle.telemetry.acceleration0to100}{' '}
                <span className="text-[#e11d48] text-xs font-mono">SEC</span>
              </span>
              <span className="font-mono text-[10px] text-[#b9c8de]/70 truncate">
                Sport Chrono Active
              </span>
            </div>
          </div>

          <div className="bg-[#1a1c20] hover:bg-[#1e2024] p-4 rounded-xl border border-white/8 flex flex-col justify-between transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-[#b9c8de] uppercase">Max Track Speed</span>
              <span className="material-symbols-outlined text-[#e11d48] text-[18px]">speed</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-2xl font-bold text-white tracking-tight">
                {vehicle.telemetry.topSpeedKmh}{' '}
                <span className="text-[#e11d48] text-xs font-mono">KM/H</span>
              </span>
              <span className="font-mono text-[10px] text-[#b9c8de]/70 truncate">
                {vehicle.telemetry.topSpeedMph} MPH Terminal
              </span>
            </div>
          </div>

          <div className="bg-[#1a1c20] hover:bg-[#1e2024] p-4 rounded-xl border border-white/8 flex flex-col justify-between transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-[#b9c8de] uppercase">Max Torque</span>
              <span className="material-symbols-outlined text-[#e11d48] text-[18px]">sync</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-2xl font-bold text-white tracking-tight">
                {vehicle.telemetry.torqueNm}{' '}
                <span className="text-[#e11d48] text-xs font-mono">NM</span>
              </span>
              <span className="font-mono text-[10px] text-[#b9c8de]/70 truncate">
                {vehicle.telemetry.torqueLbFt} lb-ft @ {vehicle.telemetry.torqueRpm.toLocaleString()} RPM
              </span>
            </div>
          </div>

          <div className="bg-[#1a1c20] hover:bg-[#1e2024] p-4 rounded-xl border border-white/8 flex flex-col justify-between transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-[#b9c8de] uppercase">Drivetrain</span>
              <span className="material-symbols-outlined text-[#e11d48] text-[18px]">settings_input_component</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xl font-bold text-white tracking-tight truncate">
                {vehicle.telemetry.drivetrain}
              </span>
              <span className="font-mono text-[10px] text-[#b9c8de]/70 truncate">
                {vehicle.telemetry.transmission.split(' ')[0]} Dual Clutch
              </span>
            </div>
          </div>

          <div className="bg-[#1a1c20] hover:bg-[#1e2024] p-4 rounded-xl border border-white/8 flex flex-col justify-between transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-[#b9c8de] uppercase">Odometer</span>
              <span className="material-symbols-outlined text-[#e11d48] text-[18px]">verified_user</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-2xl font-bold text-white tracking-tight">
                {vehicle.telemetry.mileageMiles.toLocaleString()}{' '}
                <span className="text-[#e11d48] text-xs font-mono">MI</span>
              </span>
              <span className="font-mono text-[10px] text-[#b9c8de]/70 truncate">
                Verified &amp; Certified
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Equipment & Technical Specifications Split Matrix */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 my-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Equipment & Features Interactive Tabs (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#e11d48] rounded-sm" />
                <h2 className="font-headline font-bold text-xl text-white uppercase tracking-tight">
                  Equipment &amp; Installed Options
                </h2>
              </div>
              <p className="font-body text-xs text-[#b9c8de]">
                Factory build specification decoded via manufacturer telemetry registry.
              </p>
            </div>

            {/* Tab Controls */}
            <div className="flex items-center gap-1 bg-[#1a1c20] p-1 rounded-sm border border-white/8 overflow-x-auto whitespace-nowrap">
              {[
                { id: 'chassis', label: 'Performance & Chassis' },
                { id: 'tech', label: 'Technology & Audio' },
                { id: 'interior', label: 'Interior & Comfort' },
                { id: 'safety', label: 'Safety & Assistance' },
                { id: 'exterior', label: 'Exterior Trim' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveEquipmentTab(tab.id)}
                  className={`font-headline text-xs px-3.5 py-1.5 rounded-sm transition-all cursor-pointer ${
                    activeEquipmentTab === tab.id
                      ? 'bg-[#e11d48] text-white font-semibold shadow-sm'
                      : 'text-[#b9c8de] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content Panes */}
            <div className="bg-[#1a1c20] p-5 rounded-xl border border-white/8 shadow-sm flex flex-col gap-3">
              {/* Dynamic items based on tab */}
              {activeEquipmentTab === 'chassis' && (
                <>
                  <div className="flex items-start gap-3 p-3 bg-[#0c0e12] rounded-sm border border-white/5">
                    <span className="material-symbols-outlined text-[#e11d48] text-[20px] mt-0.5">check_circle</span>
                    <div className="flex flex-col">
                      <span className="font-headline font-semibold text-sm text-white">
                        PASM Sport Suspension (-10mm) with Active Damper Control
                      </span>
                      <span className="font-body text-xs text-[#b9c8de]">
                        Adaptive ride stiffness tuned specifically for {vehicle.chassisCode || 'GT'} kinematics with rear helper springs.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[#0c0e12] rounded-sm border border-white/5">
                    <span className="material-symbols-outlined text-[#e11d48] text-[20px] mt-0.5">check_circle</span>
                    <div className="flex flex-col">
                      <span className="font-headline font-semibold text-sm text-white">
                        Sport Chrono Package with Mode Switch &amp; Track Precision App
                      </span>
                      <span className="font-body text-xs text-[#b9c8de]">
                        Steering wheel drive mode dial (Normal, Sport, Sport Plus, Individual, Wet) and launch control telemetry.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[#0c0e12] rounded-sm border border-white/5">
                    <span className="material-symbols-outlined text-[#e11d48] text-[20px] mt-0.5">check_circle</span>
                    <div className="flex flex-col">
                      <span className="font-headline font-semibold text-sm text-white">
                        Sports Exhaust System with Black Twin Tailpipes
                      </span>
                      <span className="font-body text-xs text-[#b9c8de]">
                        Valved dual stainless steel architecture featuring reduced interior sound deadening.
                      </span>
                    </div>
                  </div>
                </>
              )}

              {activeEquipmentTab === 'tech' && (
                <>
                  <div className="flex items-start gap-3 p-3 bg-[#0c0e12] rounded-sm border border-white/5">
                    <span className="material-symbols-outlined text-[#e11d48] text-[20px] mt-0.5">check_circle</span>
                    <div className="flex flex-col">
                      <span className="font-headline font-semibold text-sm text-white">
                        High-End Digital Surround Acoustic System
                      </span>
                      <span className="font-body text-xs text-[#b9c8de]">
                        12 speakers, 570 watts with digital acoustic restoration and noise compensation.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[#0c0e12] rounded-sm border border-white/5">
                    <span className="material-symbols-outlined text-[#e11d48] text-[20px] mt-0.5">check_circle</span>
                    <div className="flex flex-col">
                      <span className="font-headline font-semibold text-sm text-white">
                        Telemetry Touchscreen Management with Wireless Apple CarPlay &amp; Android Auto
                      </span>
                      <span className="font-body text-xs text-[#b9c8de]">
                        10.9" Full HD cockpit interface with real-time lap delta overlay.
                      </span>
                    </div>
                  </div>
                </>
              )}

              {activeEquipmentTab === 'interior' && (
                <>
                  <div className="flex items-start gap-3 p-3 bg-[#0c0e12] rounded-sm border border-white/5">
                    <span className="material-symbols-outlined text-[#e11d48] text-[20px] mt-0.5">check_circle</span>
                    <div className="flex flex-col">
                      <span className="font-headline font-semibold text-sm text-white">
                        18-Way Adaptive Sport Seats Plus with Memory Package
                      </span>
                      <span className="font-body text-xs text-[#b9c8de]">
                        Electric pneumatic bolster adjustment for lateral thigh and shoulder support.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[#0c0e12] rounded-sm border border-white/5">
                    <span className="material-symbols-outlined text-[#e11d48] text-[20px] mt-0.5">check_circle</span>
                    <div className="flex flex-col">
                      <span className="font-headline font-semibold text-sm text-white">
                        Matte Carbon Fiber Interior Inlay Package
                      </span>
                      <span className="font-body text-xs text-[#b9c8de]">
                        Dashboard trim, door sills with illuminated script, and center tunnel in raw weave carbon.
                      </span>
                    </div>
                  </div>
                </>
              )}

              {activeEquipmentTab === 'safety' && (
                <>
                  <div className="flex items-start gap-3 p-3 bg-[#0c0e12] rounded-sm border border-white/5">
                    <span className="material-symbols-outlined text-[#e11d48] text-[20px] mt-0.5">check_circle</span>
                    <div className="flex flex-col">
                      <span className="font-headline font-semibold text-sm text-white">
                        Predictive Cruise Control with Radar Proximity Sensors
                      </span>
                      <span className="font-body text-xs text-[#b9c8de]">
                        High-resolution topographic road modeling and emergency brake intervention.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[#0c0e12] rounded-sm border border-white/5">
                    <span className="material-symbols-outlined text-[#e11d48] text-[20px] mt-0.5">check_circle</span>
                    <div className="flex flex-col">
                      <span className="font-headline font-semibold text-sm text-white">
                        Surround View 360° Overhead Cameras &amp; Ultrasonic Rim Protection
                      </span>
                      <span className="font-body text-xs text-[#b9c8de]">
                        Prevents curb scuffs on lightweight forged wheels during urban maneuvers.
                      </span>
                    </div>
                  </div>
                </>
              )}

              {activeEquipmentTab === 'exterior' && (
                <>
                  <div className="flex items-start gap-3 p-3 bg-[#0c0e12] rounded-sm border border-white/5">
                    <span className="material-symbols-outlined text-[#e11d48] text-[20px] mt-0.5">check_circle</span>
                    <div className="flex flex-col">
                      <span className="font-headline font-semibold text-sm text-white">
                        Center-Lock Forged Lightweight Alloy Wheels in Satin Black
                      </span>
                      <span className="font-body text-xs text-[#b9c8de]">
                        Single central aluminum motorsport nut for rapid pitstop tire changes.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[#0c0e12] rounded-sm border border-white/5">
                    <span className="material-symbols-outlined text-[#e11d48] text-[20px] mt-0.5">check_circle</span>
                    <div className="flex flex-col">
                      <span className="font-headline font-semibold text-sm text-white">
                        Tinted LED Matrix Headlights with Dynamic Cornering Beam
                      </span>
                      <span className="font-body text-xs text-[#b9c8de]">
                        84 individual LEDs in 4-point daytime running graphic with adaptive cornering beam.
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Technical Homologation Matrix (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#e11d48] rounded-sm" />
                <h2 className="font-headline font-bold text-xl text-white uppercase tracking-tight">
                  Technical Matrix
                </h2>
              </div>
              <p className="font-body text-xs text-[#b9c8de]">
                Dynamometer &amp; chassis homologation values (Demo Reference).
              </p>
            </div>

            <div className="bg-[#1a1c20] p-4 rounded-xl border border-white/8 shadow-sm flex flex-col gap-1 text-xs font-mono">
              <div className="flex items-center justify-between py-2 px-3 hover:bg-[#1e2024] rounded-sm">
                <span className="text-[#b9c8de] uppercase">Engine Displacement</span>
                <span className="text-white font-semibold">{vehicle.technicalMatrix.displacementCc} cc</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-[#0c0e12]/30 hover:bg-[#1e2024] rounded-sm">
                <span className="text-[#b9c8de] uppercase">Compression Ratio</span>
                <span className="text-white font-semibold">{vehicle.technicalMatrix.compressionRatio}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 hover:bg-[#1e2024] rounded-sm">
                <span className="text-[#b9c8de] uppercase">Cylinder Config</span>
                <span className="text-white truncate max-w-[200px]">{vehicle.technicalMatrix.cylinderConfiguration}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-[#0c0e12]/30 hover:bg-[#1e2024] rounded-sm">
                <span className="text-[#b9c8de] uppercase">Drive Architecture</span>
                <span className="text-white truncate max-w-[200px]">{vehicle.technicalMatrix.driveArchitecture}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 hover:bg-[#1e2024] rounded-sm">
                <span className="text-[#b9c8de] uppercase">Curb Weight</span>
                <span className="text-white font-semibold">
                  {vehicle.technicalMatrix.curbWeightKg} kg ({vehicle.technicalMatrix.curbWeightLbs} lbs)
                </span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-[#0c0e12]/30 hover:bg-[#1e2024] rounded-sm">
                <span className="text-[#b9c8de] uppercase">Fuel Tank Capacity</span>
                <span className="text-white font-semibold">{vehicle.technicalMatrix.fuelTankCapacityLiters} Liters</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 hover:bg-[#1e2024] rounded-sm">
                <span className="text-[#b9c8de] uppercase">Front Brake Disc</span>
                <span className="text-white truncate max-w-[200px]">{vehicle.technicalMatrix.frontBrakeDisc}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-[#0c0e12]/30 hover:bg-[#1e2024] rounded-sm">
                <span className="text-[#b9c8de] uppercase">Rear Brake Disc</span>
                <span className="text-white truncate max-w-[200px]">{vehicle.technicalMatrix.rearBrakeDisc}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 hover:bg-[#1e2024] rounded-sm">
                <span className="text-[#b9c8de] uppercase">Drag Coefficient</span>
                <span className="text-white font-semibold">{vehicle.technicalMatrix.dragCoefficient}</span>
              </div>
            </div>

            {/* Telemetry Certification Notice */}
            <div className="p-3.5 bg-[#1e2024] rounded-sm border border-white/8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#e11d48] text-[24px]">workspace_premium</span>
                <div className="flex flex-col">
                  <span className="font-headline font-semibold text-sm text-white">
                    360-Point Mechanical Audit Completed
                  </span>
                  <span className="font-body text-xs text-[#b9c8de]">
                    Simulated verification by master technicians.
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-[#ffb3b6] uppercase font-bold tracking-wider">
                VERIFIED
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Financing & Lease Estimator Widget + Atelier Profile (Grid 2 Cols) */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 my-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Calculator Widget (7 Cols) */}
          <div className="lg:col-span-7 bg-[#1a1c20] p-6 rounded-xl border border-white/8 shadow-md flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/8 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#e11d48] rounded-sm" />
                <h2 className="font-headline font-bold text-xl text-white uppercase tracking-tight">
                  Financing &amp; Lease Estimator
                </h2>
              </div>
              <span className="font-mono text-[10px] text-[#b9c8de] uppercase bg-[#0c0e12] px-2 py-0.5 rounded-sm border border-white/5">
                Simulated Demo Calculation
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Down Payment Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] text-[#b9c8de] uppercase">
                    Down Payment
                  </label>
                  <span className="font-mono text-sm font-semibold text-white">
                    ${downPayment.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="100000"
                  step="5000"
                  value={downPayment}
                  onChange={(e) => setDownPayment(parseInt(e.target.value, 10))}
                  className="w-full accent-[#e11d48] h-1.5 bg-[#0c0e12] rounded-sm cursor-pointer"
                />
                <div className="flex justify-between font-mono text-[10px] text-[#b9c8de]">
                  <span>$10k min</span>
                  <span>$100k</span>
                </div>
              </div>

              {/* Interest Rate APR Input */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[11px] text-[#b9c8de] uppercase">
                  Est. Annual APR (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={apr}
                  onChange={(e) => setApr(parseFloat(e.target.value) || 0)}
                  className="bg-[#0c0e12] text-white font-mono text-sm px-3 py-2 rounded-sm border border-white/10 focus:outline-none focus:border-[#e11d48]"
                />
                <span className="font-body text-[11px] text-[#b9c8de]/70">
                  Prime tier 740+ credit benchmark (Demo estimate)
                </span>
              </div>
            </div>

            {/* Term Duration Selectors */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[11px] text-[#b9c8de] uppercase">Select Term Duration</span>
              <div className="grid grid-cols-4 gap-2">
                {[36, 48, 60, 72].map((months) => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => setTermMonths(months)}
                    className={`py-2 rounded-sm font-mono text-xs font-semibold transition-all cursor-pointer ${
                      termMonths === months
                        ? 'bg-[#e11d48] text-white shadow-sm'
                        : 'bg-[#0c0e12] hover:bg-[#1e2024] text-[#b9c8de] border border-white/5'
                    }`}
                  >
                    {months} Mo
                  </button>
                ))}
              </div>
            </div>

            {/* Result Box & Pre-Approval Trigger */}
            <div className="p-4 bg-[#0c0e12] rounded-sm border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#b9c8de] uppercase">
                  Estimated Monthly Installment
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl sm:text-3xl text-white font-bold tracking-tight">
                    ${calculatedMonthly.toLocaleString()}
                  </span>
                  <span className="font-mono text-xs text-[#b9c8de]">/ month</span>
                </div>
                <span className="font-mono text-[10px] text-[#b9c8de]/60">
                  Excludes local state registration &amp; taxes
                </span>
              </div>

              <Button
                variant="primary"
                onClick={() => setFinancingModalOpen(true)}
                className="w-full sm:w-auto"
              >
                Apply For Pre-Approval
              </Button>
            </div>
          </div>

          {/* Partner Atelier Profile Card (5 Cols) */}
          <div className="lg:col-span-5 bg-[#1a1c20] p-6 rounded-xl border border-white/8 shadow-md flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] font-bold text-[#e11d48] uppercase tracking-wider">
                    Authorized Partner Atelier
                  </span>
                  <h3 className="font-headline font-semibold text-base sm:text-lg text-white uppercase tracking-tight">
                    {dealer.name}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-sm bg-[#0c0e12] flex items-center justify-center text-[#e11d48] border border-white/5 shrink-0">
                  <span className="material-symbols-outlined text-[20px]">storefront</span>
                </div>
              </div>

              {/* Location details */}
              <div className="flex flex-col gap-1.5 font-body text-xs text-[#b9c8de]">
                <div className="flex items-center gap-2 text-white">
                  <span className="material-symbols-outlined text-[#e11d48] text-[16px] shrink-0">
                    location_on
                  </span>
                  <span>{dealer.address}, {dealer.city}, {dealer.state} {dealer.postalCode}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#b9c8de] text-[16px] shrink-0">
                    schedule
                  </span>
                  <span>{dealer.hours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#b9c8de] text-[16px] shrink-0">
                    call
                  </span>
                  <a href={`tel:${dealer.phone}`} className="hover:text-white transition-colors font-mono">
                    {dealer.phone}
                  </a>
                </div>
              </div>

              {/* Static Map View */}
              <div
                className="w-full h-32 bg-cover bg-center rounded-sm relative overflow-hidden border border-white/10 flex items-end p-2 mt-1"
                style={{ backgroundImage: `url('${dealer.mapStaticImage}')` }}
              >
                <div className="bg-[#0c0e12]/90 backdrop-blur-md px-2 py-0.5 rounded-sm font-mono text-[10px] text-white uppercase flex items-center gap-1.5 border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48] animate-pulse" />
                  <span>Private Showroom Active</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<span className="material-symbols-outlined text-[15px]">chat</span>}
                onClick={() => setTestDriveModalOpen(true)}
              >
                Message Dealer
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<span className="material-symbols-outlined text-[15px] text-[#b9c8de]">videocam</span>}
                onClick={() => setVideoTourModalOpen(true)}
              >
                Video Walkaround
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Similar In-Class Allocations (3 Cards Grid) */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 my-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#e11d48] rounded-sm" />
            <h2 className="font-headline font-bold text-xl sm:text-2xl text-white uppercase tracking-tight">
              Similar In-Class Allocations
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('explore-cars')}
            className="font-mono text-xs text-[#ffb3b6] hover:text-white uppercase transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>View Entire Registry</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {similarVehicles.map((sim) => (
            <VehicleCard
              key={sim.id}
              vehicle={sim}
              isFavorite={favorites.includes(sim.id)}
              isCompared={comparedIds.includes(sim.id)}
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
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ))}
        </div>
      </section>

      {/* Modal: VIP Test Drive / Message Dealer */}
      <Modal
        isOpen={testDriveModalOpen}
        onClose={() => setTestDriveModalOpen(false)}
        title="Schedule VIP Private Viewing"
        subtitle={vehicle.model}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setTestDriveModalOpen(false);
            showToast({
              type: 'success',
              title: 'Viewing Request Registered',
              message: `Our concierge will coordinate handover for ${preferredDate} at ${dealer.name}.`,
            });
          }}
          className="flex flex-col gap-4"
        >
          <p className="font-body text-xs text-[#b9c8de] leading-relaxed">
            Private test drives and visual audits are arranged with master technicians at {dealer.name}.
          </p>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[11px] text-[#b9c8de] uppercase">Full Name</label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="bg-[#0c0e12] text-white font-body text-xs px-3 py-2 rounded-sm border border-white/10"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[11px] text-[#b9c8de] uppercase">Direct Email</label>
            <input
              type="email"
              value={driverEmail}
              onChange={(e) => setDriverEmail(e.target.value)}
              className="bg-[#0c0e12] text-white font-body text-xs px-3 py-2 rounded-sm border border-white/10"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[11px] text-[#b9c8de] uppercase">Preferred Date</label>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="bg-[#0c0e12] text-white font-body text-xs px-3 py-2 rounded-sm border border-white/10"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setTestDriveModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm Viewing Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Custom Lease Sheet & Pre-Approval (Clearly Demo) */}
      <Modal
        isOpen={financingModalOpen}
        onClose={() => setFinancingModalOpen(false)}
        title="Simulated Lease & Pre-Approval Sheet"
        subtitle="Car 911 Capital Desk"
      >
        <div className="flex flex-col gap-4 font-body text-xs text-[#b9c8de]">
          <div className="p-3 bg-[#0c0e12] rounded-sm border border-white/10 flex flex-col gap-2 font-mono">
            <div className="flex justify-between">
              <span>Vehicle Capitalization:</span>
              <span className="text-white">${vehicle.priceUsd.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Simulated Down Payment:</span>
              <span className="text-white">${downPayment.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Term Duration:</span>
              <span className="text-white">{termMonths} Months</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 text-sm">
              <span className="text-[#ffb3b6]">Estimated Monthly:</span>
              <span className="text-white font-bold">${calculatedMonthly.toLocaleString()} / mo</span>
            </div>
          </div>
          <p className="text-[11px] text-[#b9c8de]/70 leading-relaxed">
            <strong>Demonstration Notice:</strong> Car 911 does not originate loans, make binding credit decisions, or guarantee financing terms. Actual rates depend on third-party underwriters and credit evaluation.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setFinancingModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setFinancingModalOpen(false);
                showToast({
                  type: 'success',
                  title: 'Demo Pre-Approval Dispatched',
                  message: 'Custom lease sheet staged for client review.',
                });
              }}
            >
              Request Formal Underwriting
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Video Walkaround */}
      <Modal
        isOpen={videoTourModalOpen}
        onClose={() => setVideoTourModalOpen(false)}
        title="Live Video Walkaround Staging"
        subtitle={dealer.name}
      >
        <div className="flex flex-col gap-4 font-body text-xs text-[#b9c8de]">
          <p>
            Connect with a dedicated product specialist on the {dealer.city} showroom floor for a private 4K video inspection via Zoom or FaceTime.
          </p>
          <div className="p-3 bg-[#0c0e12] rounded-sm border border-white/10 font-mono text-xs">
            <div className="text-white">Vehicle: {vehicle.make} {vehicle.model}</div>
            <div className="text-[#b9c8de]">Location: {dealer.name} ({dealer.city})</div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setVideoTourModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setVideoTourModalOpen(false);
                showToast({
                  type: 'success',
                  title: 'Video Walkaround Booked',
                  message: 'Concierge dispatch link sent to your email.',
                });
              }}
            >
              Confirm Video Appointment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
