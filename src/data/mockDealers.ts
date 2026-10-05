import { Dealer } from '../types/index.ts';

/**
 * Car 911 - Mock Partner Dealership & Flagship Atelier Directory
 * Note: Fictional demonstration partner ateliers and facilities.
 */
export const MOCK_DEALERS: Dealer[] = [
  {
    id: 'dealer-beverly-hills',
    name: 'Car 911 Flagship Atelier & Experience Center',
    slug: 'beverly-hills-flagship',
    city: 'Beverly Hills',
    state: 'CA',
    country: 'United States',
    address: '911 Grand Prix Way',
    postalCode: '90210',
    phone: '+1 (800) 911-AUTO',
    email: 'concierge@car911.com',
    hours: 'Mon–Sat: 9:00 AM – 7:00 PM PST • Sun: By Appointment',
    coordinates: {
      lat: 34.0736,
      lng: -118.4004,
    },
    mapStaticImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAPPTjeHAsNZHaUr_WtI9aICj1l5OX-hDCxLvvzYvhcwt7hpVgntbC8oIAkWErYDyP_StrBf7EjAJf7Yi_6HnPrFTPjMjhwMvW7yZsD2IjjJqKOTRg3ZF_-e4QL1E1IxV9iRd_969AuNAPPz9oxpzbynfyVs87psbn6AAPILJEAmAcEF5MkW8CvLhEWZ5C4hC8na5EE6X8XDNgIXvlLD5LKXd_6r98OcpK-vzU4X2u6c3bDQV1QmuQZBw',
    allocatedInventoryCount: 42,
    isFlagship: true,
  },
  {
    id: 'dealer-miami',
    name: 'Car 911 South Beach Performance Vault',
    slug: 'miami-south-beach-vault',
    city: 'Miami',
    state: 'FL',
    country: 'United States',
    address: '1100 Ocean Drive',
    postalCode: '33139',
    phone: '+1 (305) 911-MIAM',
    email: 'miami@car911.com',
    hours: 'Mon–Sat: 10:00 AM – 8:00 PM EST • Sun: By Appointment',
    coordinates: {
      lat: 25.7825,
      lng: -80.1301,
    },
    mapStaticImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAPPTjeHAsNZHaUr_WtI9aICj1l5OX-hDCxLvvzYvhcwt7hpVgntbC8oIAkWErYDyP_StrBf7EjAJf7Yi_6HnPrFTPjMjhwMvW7yZsD2IjjJqKOTRg3ZF_-e4QL1E1IxV9iRd_969AuNAPPz9oxpzbynfyVs87psbn6AAPILJEAmAcEF5MkW8CvLhEWZ5C4hC8na5EE6X8XDNgIXvlLD5LKXd_6r98OcpK-vzU4X2u6c3bDQV1QmuQZBw',
    allocatedInventoryCount: 28,
    isFlagship: false,
  },
  {
    id: 'dealer-new-york',
    name: 'Car 911 Manhattan Precision Gallery',
    slug: 'manhattan-precision-gallery',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    address: '450 Park Avenue South',
    postalCode: '10016',
    phone: '+1 (212) 911-NYNY',
    email: 'newyork@car911.com',
    hours: 'Mon–Fri: 9:00 AM – 6:00 PM EST • Sat: 10:00 AM – 5:00 PM',
    coordinates: {
      lat: 40.7441,
      lng: -73.9832,
    },
    mapStaticImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAPPTjeHAsNZHaUr_WtI9aICj1l5OX-hDCxLvvzYvhcwt7hpVgntbC8oIAkWErYDyP_StrBf7EjAJf7Yi_6HnPrFTPjMjhwMvW7yZsD2IjjJqKOTRg3ZF_-e4QL1E1IxV9iRd_969AuNAPPz9oxpzbynfyVs87psbn6AAPILJEAmAcEF5MkW8CvLhEWZ5C4hC8na5EE6X8XDNgIXvlLD5LKXd_6r98OcpK-vzU4X2u6c3bDQV1QmuQZBw',
    allocatedInventoryCount: 35,
    isFlagship: false,
  },
  {
    id: 'dealer-stuttgart',
    name: 'Car 911 European Heritage Vault',
    slug: 'stuttgart-european-vault',
    city: 'Stuttgart',
    state: 'Baden-Württemberg',
    country: 'Germany',
    address: 'Porscheplatz 9',
    postalCode: '70435',
    phone: '+49 711 911 2026',
    email: 'stuttgart@car911.com',
    hours: 'Mon–Sat: 8:30 AM – 6:30 PM CET',
    coordinates: {
      lat: 48.8353,
      lng: 9.1517,
    },
    mapStaticImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAPPTjeHAsNZHaUr_WtI9aICj1l5OX-hDCxLvvzYvhcwt7hpVgntbC8oIAkWErYDyP_StrBf7EjAJf7Yi_6HnPrFTPjMjhwMvW7yZsD2IjjJqKOTRg3ZF_-e4QL1E1IxV9iRd_969AuNAPPz9oxpzbynfyVs87psbn6AAPILJEAmAcEF5MkW8CvLhEWZ5C4hC8na5EE6X8XDNgIXvlLD5LKXd_6r98OcpK-vzU4X2u6c3bDQV1QmuQZBw',
    allocatedInventoryCount: 50,
    isFlagship: true,
  },
  {
    id: 'dealer-london',
    name: 'Car 911 Mayfair Exotic Allocations',
    slug: 'london-mayfair-allocations',
    city: 'London',
    state: 'Greater London',
    country: 'United Kingdom',
    address: '22 Berkeley Square',
    postalCode: 'W1J 6EH',
    phone: '+44 20 7911 0911',
    email: 'london@car911.com',
    hours: 'Mon–Sat: 9:00 AM – 6:00 PM GMT • Sun: Private Client Escort',
    coordinates: {
      lat: 51.5098,
      lng: -0.1466,
    },
    mapStaticImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAPPTjeHAsNZHaUr_WtI9aICj1l5OX-hDCxLvvzYvhcwt7hpVgntbC8oIAkWErYDyP_StrBf7EjAJf7Yi_6HnPrFTPjMjhwMvW7yZsD2IjjJqKOTRg3ZF_-e4QL1E1IxV9iRd_969AuNAPPz9oxpzbynfyVs87psbn6AAPILJEAmAcEF5MkW8CvLhEWZ5C4hC8na5EE6X8XDNgIXvlLD5LKXd_6r98OcpK-vzU4X2u6c3bDQV1QmuQZBw',
    allocatedInventoryCount: 31,
    isFlagship: false,
  },
  {
    id: 'dealer-tokyo',
    name: 'Car 911 Roppongi Hills Telemetry Studio',
    slug: 'tokyo-roppongi-studio',
    city: 'Tokyo',
    state: 'Tokyo Prefecture',
    country: 'Japan',
    address: '6-10-1 Roppongi, Minato-ku',
    postalCode: '106-6108',
    phone: '+81 3 5911 2026',
    email: 'tokyo@car911.com',
    hours: 'Daily: 10:00 AM – 8:00 PM JST',
    coordinates: {
      lat: 35.6605,
      lng: 139.7292,
    },
    mapStaticImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAPPTjeHAsNZHaUr_WtI9aICj1l5OX-hDCxLvvzYvhcwt7hpVgntbC8oIAkWErYDyP_StrBf7EjAJf7Yi_6HnPrFTPjMjhwMvW7yZsD2IjjJqKOTRg3ZF_-e4QL1E1IxV9iRd_969AuNAPPz9oxpzbynfyVs87psbn6AAPILJEAmAcEF5MkW8CvLhEWZ5C4hC8na5EE6X8XDNgIXvlLD5LKXd_6r98OcpK-vzU4X2u6c3bDQV1QmuQZBw',
    allocatedInventoryCount: 22,
    isFlagship: false,
  },
];
