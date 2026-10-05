/**
 * Car 911 Design System Tokens
 * Strict adherence to approved Stitch design specification.
 */

export const TOKENS = {
  colors: {
    surfaceLowest: '#0c0e12',
    surfaceLow: '#1a1c20',
    surfaceContainer: '#1e2024',
    surfaceHigh: '#282a2e',
    surfaceHighest: '#333539',
    surface: '#111317',
    primary: '#ffb3b6',
    primaryContainer: '#e11d48', // Precision Crimson
    onPrimaryContainer: '#fffaf9',
    secondary: '#b9c8de',
    secondaryContainer: '#39485a',
    tertiaryContainer: '#db2b4e',
    onSurface: '#e2e2e8',
    onSurfaceVariant: '#e5bdbe',
    outline: '#ac8889',
    outlineVariant: '#5c3f40',
    error: '#ffb4ab',
    errorContainer: '#93000a',
  },
  radius: {
    micro: 'rounded-sm', // 4px / 0.25rem
    card: 'rounded-lg', // 8px / 0.5rem
    panel: 'rounded-xl', // 12px / 0.75rem
    full: 'rounded-full', // strictly for circular indicators & status beacons
  },
  typography: {
    hero: 'font-headline font-bold text-4xl sm:text-5xl lg:text-[56px] leading-[1.1] tracking-tight',
    headlineXl: 'font-headline font-bold text-3xl sm:text-4xl lg:text-[40px] leading-tight tracking-tight',
    headlineLg: 'font-headline font-semibold text-2xl sm:text-3xl leading-snug tracking-tight',
    headlineMd: 'font-headline font-semibold text-xl sm:text-[22px] leading-normal tracking-tight',
    headlineSm: 'font-headline font-semibold text-base sm:text-lg leading-snug tracking-tight',
    bodyLg: 'font-body text-base sm:text-lg leading-relaxed text-[#b9c8de]',
    bodyMd: 'font-body text-sm sm:text-[15px] leading-relaxed text-[#e2e2e8]',
    bodySm: 'font-body text-xs sm:text-[13px] leading-normal text-[#b9c8de]',
    specLg: 'font-mono font-semibold text-2xl sm:text-[32px] tracking-tight text-white',
    specMd: 'font-mono font-semibold text-lg sm:text-[20px] tracking-tight text-white',
    specSm: 'font-mono font-medium text-xs sm:text-[13px] tracking-tight text-white',
    labelCaps: 'font-mono font-medium text-[11px] leading-none uppercase tracking-[0.08em] text-[#b9c8de]',
  },
} as const;
