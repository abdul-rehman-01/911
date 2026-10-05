import { Service } from '../types/index.ts';

/**
 * Car 911 - Mock Performance & Ownership Services Catalog
 * Note: Pricing estimates and turnaround windows represent demo calculations.
 */
export const MOCK_SERVICES: Service[] = [
  {
    id: 'service-field-inspection',
    slug: 'certified-field-inspection',
    name: 'Certified Field Inspection',
    category: 'Pre-Purchase',
    shortDescription:
      'Independent master mechanics deployed anywhere in the nation with thermal imaging and paint meter analysis.',
    fullDescription:
      'Comprehensive 360-point mechanical and digital inspection. Our master technicians run laser chassis alignment verification, ECU over-rev registry audit, paint depth gauge checks across every carbon panel, and road testing before purchase authorization.',
    icon: 'health_and_safety',
    priceEstimate: '$850 fixed assessment (Demo Rate)',
    turnaroundTime: '24–48 Hours',
    features: [
      'Laser body & frame alignment audit',
      'DME ECU over-rev & launch log diagnostic',
      'Paint thickness ultrasound verification',
      '360-point multi-stage mechanical audit',
      'Direct master technician phone debrief',
    ],
  },
  {
    id: 'service-detailing-ppf',
    slug: 'bespoke-detailing-ppf',
    name: 'Bespoke Detailing & Track PPF',
    category: 'Protection',
    shortDescription:
      'Track-spec Paint Protection Film (PPF), multi-stage ceramic coatings, and interior leather preservation treatments.',
    fullDescription:
      'Engineered surface armor for high-velocity motoring. We apply self-healing 8mil to 10mil hydrophobic track film to full front clips or entire carbon body shells, complemented by 9H dual-layer quartz ceramic sealants and microfiber conditioning.',
    icon: 'auto_fix_high',
    priceEstimate: 'From $2,400 (Demo Rate)',
    turnaroundTime: '3–5 Days',
    features: [
      'Self-healing 10mil high-velocity track film',
      'Precision plotter cut (no exposed blade edges)',
      'Dual-layer 9H quartz ceramic coating',
      'Aniline & Alcantara hydrophobic shield',
      '5-year transferable warranty protocol',
    ],
  },
  {
    id: 'service-tailored-financing',
    slug: 'tailored-auto-financing',
    name: 'Tailored Auto Financing',
    category: 'Financing',
    shortDescription:
      'Structured exotic leases, balloon financing, and capital portfolio equity releases with expedited approval.',
    fullDescription:
      'Specialized liquidity strategies for hypercars and collector GTs. Custom structures including non-reporting open-ended corporate leases, structured balloon payments, and low-depreciation capital releases calculated against verified market indices.',
    icon: 'account_balance',
    priceEstimate: 'Estimated APR 5.49% (Demo Rate)',
    turnaroundTime: 'Same Day Pre-Approval',
    features: [
      'Open-ended closed-ended luxury leases',
      'Bespoke balloon financing schedules',
      'Tier 1 private collector financing rates',
      'No prepayment penalty options',
      'Multi-vehicle fleet credit lines',
    ],
  },
  {
    id: 'service-vip-trackside',
    slug: 'vip-trackside-support',
    name: 'VIP Trackside Support & Rescue',
    category: '24/7 Roadside',
    shortDescription:
      'Zero-clearance flatbed dispatch, track rescue services, and replacement supercar logistics during servicing.',
    fullDescription:
      'Rapid emergency logistics tailored exclusively for low-ground-clearance exotics and track hypercars. Enclosed hydraulic zero-degree angle flatbeds, trackside tire support, and priority dispatch across North American racing facilities and highways.',
    icon: 'emergency',
    priceEstimate: '$1,200 annual membership (Demo Rate)',
    turnaroundTime: 'Under 45 Min Dispatch',
    features: [
      'Zero-clearance hydraulic tilt flatbed transport',
      'Track paddock rescue & paddock towing',
      'Enclosed climate-controlled emergency recovery',
      'Direct line to master flight coordinators',
      'Complimentary replacement GT loaner',
    ],
  },
  {
    id: 'service-performance-tuning',
    slug: 'performance-tuning-dyno',
    name: 'Performance Tuning & Dyno Analysis',
    category: 'Performance Tuning',
    shortDescription:
      'All-wheel drive dyno calibration, custom exhaust valving, and ECU/TCU telemetry software upgrades.',
    fullDescription:
      'Precision engine management calibration on our synchronized 4-wheel dyno. Individual ignition mapping, throttle response modulation, and transmission clamping pressure enhancement tailored for track day reliability.',
    icon: 'tune',
    priceEstimate: 'From $1,800 (Demo Rate)',
    turnaroundTime: '1–2 Days',
    features: [
      'All-wheel drive hub dyno verification',
      'Bespoke ignition & boost pressure maps',
      'Transmission TCU shift speed calibration',
      'Valved exhaust flap remote bypass programming',
      'Full dyno graph & telemetry printout',
    ],
  },
  {
    id: 'service-factory-maintenance',
    slug: 'factory-scheduled-maintenance',
    name: 'Factory Scheduled Maintenance',
    category: 'Maintenance',
    shortDescription:
      'OEM genuine parts, Motul motorsport lubricants, and certified dealer logbook service records.',
    fullDescription:
      'Strict adherence to manufacturer service protocols using factory-specified tools, diagnostic computers, and certified fluids. Full logbook validation and digital service provenance recording for future resale value assurance.',
    icon: 'build',
    priceEstimate: 'From $950 (Demo Rate)',
    turnaroundTime: '1 Day',
    features: [
      'Factory diagnostic PIWIS / Leonardo scans',
      'Motorsport-grade synthetic oils & filters',
      'Brake fluid flush & bleed with Castrol SRF',
      'Spark plug & coil pack telemetry check',
      'Digital blockchain service log updated',
    ],
  },
  {
    id: 'service-warranty-insurance',
    slug: 'warranty-insurance',
    name: 'High-Performance Warranty & Track Coverage',
    category: 'Warranty & Insurance',
    shortDescription:
      'Exotic vehicle extended protection covering carbon brakes, high-voltage batteries, and track HPDE days.',
    fullDescription:
      'Specialized coverage designed for vehicles that ordinary insurance and warranties refuse to underwrite. Zero deductible options for engine, transmission, turbochargers, electronics, and carbon ceramic friction rings.',
    icon: 'verified_user',
    priceEstimate: 'From $2,800/yr (Demo Rate)',
    turnaroundTime: 'Instant Quote',
    features: [
      'Carbon ceramic rotor & caliper protection',
      'Approved HPDE track day event rider',
      'Unlimited mileage extended warranty terms',
      'Zero deductible at authorized ateliers',
      'Fully transferable on vehicle sale',
    ],
  },
  {
    id: 'service-telemetry-valuation',
    slug: 'telemetry-vehicle-valuation',
    name: 'Real-Time Telemetry Vehicle Valuation',
    category: 'Valuation',
    shortDescription:
      'Algorithmic valuation based on live auction transactions, option rarity index, and mileage degradation curves.',
    fullDescription:
      'Track-grade appraisal and equity assessment. Our algorithm analyzes global private transactions, dealer inventory velocity, and paint-to-sample (PTS) rarity factors to produce bank-grade certified valuation documents.',
    icon: 'ssid_chart',
    priceEstimate: 'Complimentary Initial Assessment',
    turnaroundTime: 'Instant Online / 24h Certified',
    features: [
      'Rarity score for specific paint & interior codes',
      'Historical price appreciation curve analytics',
      'Institutional collateral appraisal letter',
      'Auction reserve & private treaty advice',
      'Zero obligation consignment appraisal',
    ],
  },
];
