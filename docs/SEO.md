# Car 911 — SEO, Social Metadata & Discovery Specification

This document details the Search Engine Optimization (SEO), Open Graph protocol, Twitter Card integration, robots directives, sitemap configuration, and Schema.org structured data implementation for Car 911.

---

## 1. Domain & Canonical URL Configuration

- **Production Canonical Domain**: `https://911-wheat.vercel.app`
- **Dynamic Meta Updates**: Managed through `src/utils/seo.ts` (`updatePageMeta()`), resolving canonical paths and Open Graph tags dynamically upon route transitions without requiring a heavy external routing library.

---

## 2. Meta Tags & Social Cards Architecture

### Global Defaults (`index.html`)

- **Page Title**: `Car 911 - Performance Automotive & Telemetry Platform`
- **Description**: `The premier global ecosystem for hypercar acquisition, telemetry intelligence, dyno spec comparisons, dealer network, and bespoke concierge delivery.`
- **Theme Color**: `#0c0e12` (matches dark telemetry UI surface)
- **Viewport**: `width=device-width, initial-scale=1.0`
- **Robots Default**: `index, follow`
- **Canonical Link**: `<link rel="canonical" href="https://911-wheat.vercel.app/" />`

### Dynamic Route-Specific SEO Mappings

| Route | Page Title (`document.title`) | Robots Directive | Open Graph Type |
| :--- | :--- | :--- | :--- |
| `/` | `Car 911 — Performance Automotive & Telemetry Platform` | `index, follow` | `website` |
| `/explore-cars` | `Explore Performance Cars \| Car 911` | `index, follow` | `website` |
| `/vehicle-details` | `{Year} {Make} {Model} Telemetry \| Car 911` | `index, follow` | `product` |
| `/compare` | `Compare Performance Telemetry Matrix \| Car 911` | `index, follow` | `website` |
| `/services` | `Automotive Performance Services & Armor \| Car 911` | `index, follow` | `website` |
| `/dealers` | `Performance Dealers & Atelier Network \| Car 911` | `index, follow` | `website` |
| `/about` | `About Car 911 Automotive Engineering \| Car 911` | `index, follow` | `website` |
| `/contact` | `Concierge Acquisition Desk & Support \| Car 911` | `index, follow` | `website` |
| `/login` | `Member Authentication Desk \| Car 911` | `noindex, nofollow` | `website` |
| `/register` | `VIP Client Accreditation \| Car 911` | `noindex, nofollow` | `website` |
| `/dashboard` | `Client Garage Dashboard \| Car 911` | `noindex, nofollow` | `website` |
| `/favorites` | `Saved Telemetry Watchlist \| Car 911` | `noindex, nofollow` | `website` |
| `/admin/*` | `Platform Control Console \| Car 911` | `noindex, nofollow` | `website` |

---

## 3. Schema.org Structured Data (JSON-LD)

Implemented via a `<script id="car911-jsonld-schema" type="application/ld+json">` tag dynamically maintained on the DOM.

### Entities Represented:

1. **`WebSite`**:
   - URL: `https://911-wheat.vercel.app`
   - SearchAction integration pointing to `/explore-cars?search={search_term_string}`.
2. **`Organization`**:
   - Legal Identity: Car 911 Performance Automotive
   - Scope: Specialist performance automotive and vehicle telemetry preview network.

*Note on Factual Integrity*: Structured data does NOT make unsupported claims (no fake Star ratings, fictitious Google review badges, or non-existent factory OEM partnerships).

---

## 4. Crawling & Indexation Directives

### `public/robots.txt`
Allows search spiders on public showrooms, car catalog, spec comparison tool, services, dealers, and contact desks, while strictly barring private member routes, dashboard, authentication desks, and the administrative console:

```txt
User-agent: *
Allow: /
Allow: /explore-cars
Allow: /vehicle-details
Allow: /compare
Allow: /services
Allow: /dealers
Allow: /about
Allow: /contact

Disallow: /admin
Disallow: /admin/*
Disallow: /dashboard
Disallow: /favorites
Disallow: /login
Disallow: /register
Disallow: /api/

Sitemap: https://911-wheat.vercel.app/sitemap.xml
```

### `public/sitemap.xml`
Indexes exclusively the 8 stable public showroom paths with explicit priorities and update cadences.
