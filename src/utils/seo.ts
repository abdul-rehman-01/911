/**
 * SEO & Open Graph Metadata Manager for Car 911
 * Updates document title, meta tags, Open Graph cards, Twitter cards, canonical link,
 * and JSON-LD structured data for rich search engine indexing.
 */

export interface MetaConfig {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const DEFAULT_TITLE = 'Car 911 — Performance Automotive & Telemetry Platform';
const DEFAULT_DESC =
  'The premier global ecosystem for hypercar acquisition, telemetry intelligence, dyno spec comparisons, dealer network, and bespoke concierge delivery.';
export const DEFAULT_CANONICAL_HOST =
  (typeof window !== 'undefined' && (import.meta as any).env?.VITE_SITE_URL) ||
  'https://911-wheat.vercel.app';

/**
 * Updates head meta tags dynamically per route
 */
export function updatePageMeta(config: MetaConfig): void {
  if (typeof document === 'undefined') return;

  // 1. Title
  const title = config.title ? `${config.title} | Car 911` : DEFAULT_TITLE;
  document.title = title;

  // 2. Meta Description
  const description = config.description || DEFAULT_DESC;
  setOrCreateMetaTag('name', 'description', description);

  // 3. Open Graph
  setOrCreateMetaTag('property', 'og:title', title);
  setOrCreateMetaTag('property', 'og:description', description);
  setOrCreateMetaTag('property', 'og:type', config.ogType || 'website');
  setOrCreateMetaTag('property', 'og:site_name', 'Car 911');

  // 4. Canonical URL
  const path = config.canonicalPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = `${DEFAULT_CANONICAL_HOST}${normalizedPath}`;
  setOrCreateCanonicalLink(canonicalUrl);
  setOrCreateMetaTag('property', 'og:url', canonicalUrl);

  // 5. Open Graph Image
  if (config.ogImage) {
    setOrCreateMetaTag('property', 'og:image', config.ogImage);
  }

  // 6. Twitter Card
  setOrCreateMetaTag('name', 'twitter:card', 'summary_large_image');
  setOrCreateMetaTag('name', 'twitter:title', title);
  setOrCreateMetaTag('name', 'twitter:description', description);
  if (config.ogImage) {
    setOrCreateMetaTag('name', 'twitter:image', config.ogImage);
  }

  // 7. Robots (noindex for private/auth/admin routes)
  if (config.noIndex) {
    setOrCreateMetaTag('name', 'robots', 'noindex, nofollow');
  } else {
    setOrCreateMetaTag('name', 'robots', 'index, follow');
  }

  // 8. Structured Data (JSON-LD)
  updateStructuredData(config.structuredData);
}

function setOrCreateMetaTag(attrName: 'name' | 'property', attrValue: string, content: string): void {
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setOrCreateCanonicalLink(url: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function updateStructuredData(data?: Record<string, unknown> | Array<Record<string, unknown>>): void {
  const SCRIPT_ID = 'car911-jsonld-schema';
  let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

  if (!data) {
    // Provide Default WebSite + AutoOrganization schema
    const defaultSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${DEFAULT_CANONICAL_HOST}/#website`,
          url: DEFAULT_CANONICAL_HOST,
          name: 'Car 911',
          description: DEFAULT_DESC,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${DEFAULT_CANONICAL_HOST}/explore-cars?search={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@type': 'Organization',
          '@id': `${DEFAULT_CANONICAL_HOST}/#organization`,
          name: 'Car 911 Performance Automotive',
          url: DEFAULT_CANONICAL_HOST,
          logo: `${DEFAULT_CANONICAL_HOST}/favicon.ico`,
          description: 'Specialist performance automotive and vehicle telemetry preview network.',
        },
      ],
    };

    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(defaultSchema);
    return;
  }

  if (!script) {
    script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  const structuredPayload = {
    '@context': 'https://schema.org',
    ...(Array.isArray(data) ? { '@graph': data } : data),
  };

  script.textContent = JSON.stringify(structuredPayload);
}
