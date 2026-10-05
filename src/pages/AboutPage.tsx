import React from 'react';
import { useApp } from '../stores';
import { Button } from '../components/common/Button';

export const AboutPage: React.FC = () => {
  const { navigateTo } = useApp();

  const pillars = [
    {
      icon: 'monitoring',
      title: 'Deterministic Telemetry',
      description:
        'Every vehicle in our catalog is mapped with granular engineering metrics: power-to-weight ratios, peak torque RPM thresholds, 0-100 sprint telemetry, and ECU health baselines.',
    },
    {
      icon: 'token',
      title: 'Curated Rarity & Lineage',
      description:
        'From homologated track specials like the 911 GT3 RS to limited-run bespoke grand tourers, our platform curates vehicles characterized by mechanical distinction and collectibility.',
    },
    {
      icon: 'public',
      title: 'Global Atelier Handover Grid',
      description:
        'A coordinated network of demonstration partner showrooms in key automotive capitals: Beverly Hills, Miami, Manhattan, Stuttgart, Mayfair London, and Tokyo Minato.',
    },
    {
      icon: 'shield_with_heart',
      title: 'White-Glove Asset Custody',
      description:
        'Pre-purchase field inspections, enclosed multi-point transport dispatch, and specialized paint protection armor tailored specifically for low-clearance exotic chassis.',
    },
  ];

  const leadership = [
    {
      name: 'Dr. Henrik Weber',
      role: 'Director of Powertrain Telemetry',
      background: 'Ex-Weissach chassis dynamometer calibration engineer with 18 years in high-revving naturally aspirated & hybrid propulsion.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Elena Rostova',
      role: 'Head of Global Concierge & Delivery',
      background: 'Oversees VIP white-glove logistics, enclosed continent transport routing, and bespoke trackside dispatch operations.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Marcus Vance',
      role: 'Chief Aerodynamics & Dyno Analyst',
      background: 'Aerodynamic coefficient modeling and wind-tunnel simulation specialist specializing in active DRS and downforce balance.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Kenji Takahashi',
      role: 'Platform Systems Architect',
      background: 'Architect behind the real-time telemetry grid, comparison matrix engine, and encrypted client terminal sessions.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    },
  ];

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
            <span className="text-[#e11d48] font-semibold">About Car 911</span>
          </nav>

          <span className="bg-[#1e2024] px-2.5 py-0.5 rounded-sm font-mono text-[11px] text-[#ffb3b6] border border-white/5">
            Platform Protocol &amp; Philosophy
          </span>
        </div>
      </section>

      {/* Main Page Container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10 flex flex-col gap-16">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/8 pb-12">
          <div className="flex flex-col gap-4 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-5 bg-[#e11d48] rounded-sm" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#ffb3b6]">
                Precision Automotive Intelligence
              </span>
            </div>
            <h1 className="font-headline font-bold text-3xl sm:text-5xl text-white uppercase tracking-tight leading-tight">
              Engineering Integrity. <br />
              <span className="text-[#e11d48]">Telemetry Intelligence.</span>
            </h1>
            <p className="font-body text-base text-[#b9c8de] leading-relaxed">
              Car 911 was conceived as an antidote to opaque supercar marketplaces and generic car portals. We engineered an exacting platform where technical telemetry, verified mechanical geometry, and white-glove concierge dispatch converge.
            </p>
          </div>

          {/* Quick Metrics Badge Column */}
          <div className="flex flex-col gap-3 min-w-[280px] bg-[#1a1c20] p-6 rounded-xl border border-white/8 shadow-xl">
            <div className="flex items-center justify-between py-2 border-b border-white/8">
              <span className="font-mono text-xs text-[#b9c8de]">Flagship Ateliers</span>
              <span className="font-headline font-bold text-lg text-white">6 Worldwide</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/8">
              <span className="font-mono text-xs text-[#b9c8de]">Catalog Volume</span>
              <span className="font-headline font-bold text-lg text-white">15+ Hypercars</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/8">
              <span className="font-mono text-xs text-[#b9c8de]">Telemetry Metrics</span>
              <span className="font-headline font-bold text-lg text-[#e11d48]">24 per Chassis</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="font-mono text-xs text-[#b9c8de]">Platform Status</span>
              <span className="font-mono text-xs text-[#4ade80] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                Live Demo Prototype
              </span>
            </div>
          </div>
        </div>

        {/* 4 Pillars Section */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs uppercase tracking-widest text-[#e11d48]">
              Methodology &amp; Standards
            </span>
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-white uppercase tracking-tight">
              The Four Pillars of Car 911
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-[#1a1c20] p-6 rounded-xl border border-white/8 shadow-md flex flex-col gap-4 group hover:border-[#e11d48]/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-[#0c0e12] border border-white/5 flex items-center justify-center text-[#e11d48] group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">
                    {pillar.icon}
                  </span>
                </div>
                <h3 className="font-headline font-semibold text-lg text-white tracking-tight">
                  {pillar.title}
                </h3>
                <p className="font-body text-xs text-[#b9c8de] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership & Advisory Showcase */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs uppercase tracking-widest text-[#e11d48]">
              Demonstration Leadership
            </span>
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-white uppercase tracking-tight">
              Technical Advisory Board
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((member) => (
              <div
                key={member.name}
                className="bg-[#1a1c20] rounded-xl border border-white/8 overflow-hidden flex flex-col"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-48 object-cover object-center grayscale hover:grayscale-0 transition-all duration-300"
                />
                <div className="p-5 flex flex-col gap-2 flex-1 justify-between">
                  <div>
                    <h4 className="font-headline font-semibold text-base text-white">
                      {member.name}
                    </h4>
                    <span className="font-mono text-xs text-[#ffb3b6] block mb-2">
                      {member.role}
                    </span>
                    <p className="font-body text-xs text-[#b9c8de] leading-relaxed">
                      {member.background}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explicit Platform Transparency & Disclosure Statement */}
        <div className="bg-[#111317] p-6 sm:p-8 rounded-xl border border-white/10 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#e11d48] text-[24px]">
              verified_user
            </span>
            <h3 className="font-headline font-bold text-xl text-white uppercase tracking-tight">
              Platform Integrity &amp; Demonstration Statement
            </h3>
          </div>

          <div className="font-body text-xs text-[#b9c8de] leading-relaxed flex flex-col gap-3">
            <p>
              <strong>Demonstration Prototype Notice:</strong> Car 911 is an interactive digital design showcase and telemetry intelligence platform prototype. All vehicle inventories, horsepower outputs, 0-100 acceleration curves, atelier locations, pricing estimates, and service turnarounds featured across this website are simulated demonstration data created for design and technical evaluation.
            </p>
            <p>
              <strong>Certification Policy:</strong> In strict accordance with our verified information policy, Car 911 does not make unverified claims regarding official ISO certifications (such as ISO 9001:2026), real banking approvals, or formal factory OEM partnerships. Real vehicle acquisitions or servicing must be arranged through verified authorized channels.
            </p>
          </div>
        </div>

        {/* Call to Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-[#1a1c20] via-[#1e2024] to-[#1a1c20] p-8 rounded-xl border border-white/8 shadow-xl">
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <h3 className="font-headline font-bold text-xl sm:text-2xl text-white uppercase tracking-tight">
              Ready to Explore Verified Telemetry?
            </h3>
            <p className="font-body text-xs text-[#b9c8de]">
              Benchmark output curves, compare dyno matrices, or contact our concierge dispatch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={() => navigateTo('explore-cars')}>
              Explore Inventory
            </Button>
            <Button variant="outline" onClick={() => navigateTo('contact')}>
              Contact Concierge
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
