/**
 * ============================================================================
 * STAYUP DESIGN SYSTEM: COLOR THEME & TYPOGRAPHY CONFIGURATION
 * ============================================================================
 * 
 * Edit this central file to customize colors and text sizes across the entire frontend.
 * Changing any size or color here immediately updates all Theme components (<ThemeHeading>,
 * <ThemeAddress>, <ThemePrice>, <ThemeDescription>) and utility classes.
 */

// ----------------------------------------------------------------------------
// 1. COLOR PALETTE DEFINITION
// ----------------------------------------------------------------------------
export const THEME_COLORS = {
  // Primary brand palette (Deep Ocean Navy)
  primary: {
    DEFAULT: "#0a2560",
    hover: "#1444a8",
    dark: "#081d4d",
    light: "#f0f5fc",
    surface: "#e3edff",
    muted: "#1d58cc",
  },

  // Secondary brand palette (StayUp Sky Blue)
  secondary: {
    DEFAULT: "#0ea5e9",
    hover: "#0284c7",
    dark: "#0369a1",
    light: "#e0f2fe",
  },

  // Accent palette (Sunset Coral / Orange)
  accent: {
    DEFAULT: "#f97316",
    hover: "#ea580c",
    dark: "#c2410c",
    light: "#fff7ed",
    surface: "#ffedd5",
  },

  // Natural Neutrals & Typography
  neutral: {
    background: "#f8fafc",
    card: "#ffffff",
    border: "#e2e8f0",
    borderSubtle: "#cbd5e1",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#64748b",
    textLight: "#94a3b8",
  },

  // Status & Feedback Accents
  status: {
    success: "#10b981",
    successBg: "#ecfdf5",
    warning: "#f59e0b",
    warningBg: "#fffbeb",
    danger: "#ef4444",
    dangerBg: "#fef2f2",
    info: "#0ea5e9",
    infoBg: "#f0f9ff",
  },
} as const;

// ----------------------------------------------------------------------------
// 2. TEXT SIZES CONFIGURATION FOR DIFFERENT TYPES OF TEXT
// ----------------------------------------------------------------------------
export const THEME_TEXT_SIZES = {
  /**
   * HEADING TEXT SIZES (Titles, H1, H2, H3, Resort names, Section headers)
   * Change these pixel or rem values to resize headings across the app.
   */
  heading: {
    sm: "text-lg font-bold sm:text-xl",        // ~18px - 20px
    md: "text-xl font-black sm:text-2xl",      // ~22px - 24px (Standard Resort Card Title)
    lg: "text-2xl font-black sm:text-3xl",      // ~26px - 30px (Section Headers)
    xl: "text-3xl font-black sm:text-4xl",      // ~32px - 36px (Page Titles)
    "2xl": "text-4xl font-black sm:text-5xl",   // ~40px - 48px (Hero Headlines)
  },

  /**
   * ADDRESS & LOCATION TEXT SIZES (Resort address, city/country, meta tags, badges)
   * Change these values to adjust location and tag visibility.
   */
  address: {
    xs: "text-[11px] font-semibold leading-tight", // ~11px (Subtle badge metadata)
    sm: "text-xs font-semibold leading-normal",    // ~12px (Standard card badges)
    md: "text-sm font-bold leading-normal",        // ~14px (Detail page address line)
    lg: "text-base font-bold leading-relaxed",     // ~16px (Prominent location headline)
  },

  /**
   * PRICE TEXT SIZES (Nightly rate, discount tags, currency symbols, total calculations)
   * Change these values to adjust pricing visibility.
   */
  price: {
    sm: "text-xl font-black leading-none",        // ~20px (Compact list price)
    md: "text-2xl font-black leading-none",       // ~24px (Standard price)
    lg: "text-3xl font-black leading-none",       // ~30px (Card standout rate)
    xl: "text-4xl font-black leading-none",       // ~36px (Hero / Checkout total)
  },

  /**
   * DESCRIPTION TEXT SIZES (Resort overviews, property taglines, body paragraphs, reviews)
   * Change these values to adjust reading comfort and paragraph density.
   */
  description: {
    sm: "text-xs font-medium leading-relaxed",    // ~12px (Compact card tagline)
    md: "text-sm font-normal leading-relaxed",    // ~14px (Standard body description)
    lg: "text-base font-normal leading-relaxed",  // ~16px (Comfortable editorial overview)
    xl: "text-lg font-normal leading-loose",      // ~18px (Prominent introduction paragraph)
  },

  /**
   * BADGE & BUTTON SIZES
   */
  badge: {
    sm: "text-[10px] font-bold px-2 py-0.5 rounded-md",
    md: "text-xs font-bold px-2.5 py-1 rounded-full",
    lg: "text-sm font-bold px-3 py-1.5 rounded-xl",
  },

  button: {
    sm: "text-xs font-bold px-3.5 py-2 rounded-xl",
    md: "text-sm font-black px-5 py-2.5 rounded-xl",
    lg: "text-base font-black px-6 py-3.5 rounded-2xl",
  },
} as const;

// ----------------------------------------------------------------------------
// 3. THEME PALETTES / MODES
// ----------------------------------------------------------------------------
export type ColorThemeMode = "ocean" | "sunset" | "emerald" | "dark";

export interface ColorThemeDefinition {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  card: string;
  textPrimary: string;
}

export const COLOR_THEMES: Record<ColorThemeMode, ColorThemeDefinition> = {
  ocean: {
    name: "StayUp Ocean & Coral (Default)",
    primary: THEME_COLORS.primary.DEFAULT,
    secondary: THEME_COLORS.secondary.DEFAULT,
    accent: THEME_COLORS.accent.DEFAULT,
    background: "#f8fafc",
    card: "#ffffff",
    textPrimary: "#0f172a",
  },
  sunset: {
    name: "Sunset Coral Glow",
    primary: "#7c2d12",
    secondary: "#ea580c",
    accent: "#f97316",
    background: "#fffaf5",
    card: "#ffffff",
    textPrimary: "#29150d",
  },
  emerald: {
    name: "Nature Sanctuary",
    primary: "#064e3b",
    secondary: "#059669",
    accent: "#10b981",
    background: "#f4fbf7",
    card: "#ffffff",
    textPrimary: "#052e16",
  },
  dark: {
    name: "Midnight Luxury",
    primary: "#38bdf8",
    secondary: "#0ea5e9",
    accent: "#fb923c",
    background: "#0b0f19",
    card: "#1e293b",
    textPrimary: "#f8fafc",
  },
};
