export type TextSizeType =
  | "heading"
  | "address"
  | "price"
  | "description"
  | "badge"
  | "button";

export type FontFamilyType =
  | "inter"
  | "outfit"
  | "poppins"
  | "playfair"
  | "system";

export type ColorSchemeType =
  | "ocean"
  | "sunset"
  | "emerald"
  | "dark"
  | "slate";

export type BorderRadiusType = "none" | "sm" | "md" | "lg" | "xl" | "full";

export interface ThemeSettings {
  headingSize: number; // in pixels (range: 16 - 36)
  addressSize: number; // in pixels (range: 10 - 20)
  priceSize: number; // in pixels (range: 18 - 44)
  descriptionSize: number; // in pixels (range: 12 - 22)
  badgeSize: number; // in pixels (range: 10 - 16)
  buttonSize: number; // in pixels (range: 12 - 18)
  fontScale: number; // zoom factor (0.85 - 1.30)
  fontFamily: FontFamilyType;
  colorScheme: ColorSchemeType;
  borderRadius: BorderRadiusType;
  highContrast: boolean;
  updatedAt?: string;
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  headingSize: 24,
  addressSize: 13,
  priceSize: 28,
  descriptionSize: 14,
  badgeSize: 12,
  buttonSize: 14,
  fontScale: 1.0,
  fontFamily: "inter",
  colorScheme: "ocean",
  borderRadius: "lg",
  highContrast: false,
};

export interface TextSizePreset {
  label: string;
  value: number;
  description: string;
}

export const HEADING_PRESETS: TextSizePreset[] = [
  { label: "Compact", value: 18, description: "Compact headings for denser listing grids" },
  { label: "Standard", value: 24, description: "Balanced default size for web & mobile" },
  { label: "Large", value: 28, description: "Prominent headings for high readability" },
  { label: "Headline", value: 34, description: "Bold magazine-style statement headings" },
];

export const ADDRESS_PRESETS: TextSizePreset[] = [
  { label: "Subtle", value: 11, description: "Subtle secondary metadata and tags" },
  { label: "Standard", value: 13, description: "Crisp location and badge typography" },
  { label: "Legible", value: 15, description: "Comfortable easy-reading address lines" },
  { label: "Bold", value: 17, description: "High-visibility address and geography text" },
];

export const PRICE_PRESETS: TextSizePreset[] = [
  { label: "Compact", value: 22, description: "Clean understated monetary figures" },
  { label: "Standard", value: 28, description: "Bold standout rates per night" },
  { label: "Prominent", value: 34, description: "Attention-grabbing discount & rates" },
  { label: "Luxury", value: 40, description: "Ultra-bold hero price presentation" },
];

export const DESCRIPTION_PRESETS: TextSizePreset[] = [
  { label: "Condensed", value: 12, description: "Compact microcopy and short excerpts" },
  { label: "Standard", value: 14, description: "Optimized readability for resort bios" },
  { label: "Comfortable", value: 16, description: "Generous spacing for effortless reading" },
  { label: "Editorial", value: 18, description: "Storytelling paragraph format" },
];

export interface ThemePresetArchetype {
  id: string;
  name: string;
  tagline: string;
  colorScheme: ColorSchemeType;
  settings: Partial<ThemeSettings>;
}

export const THEME_PRESET_ARCHETYPES: ThemePresetArchetype[] = [
  {
    id: "classic-ocean",
    name: "StayUp Classic Ocean",
    tagline: "Signature deep navy and cobalt with balanced proportions",
    colorScheme: "ocean",
    settings: {
      headingSize: 24,
      addressSize: 13,
      priceSize: 28,
      descriptionSize: 14,
      fontScale: 1.0,
      fontFamily: "inter",
      colorScheme: "ocean",
      borderRadius: "lg",
      highContrast: false,
    },
  },
  {
    id: "sunset-vibrant",
    name: "Sunset Coral Glow",
    tagline: "Warm sunset hues with prominent prices and energetic typography",
    colorScheme: "sunset",
    settings: {
      headingSize: 26,
      addressSize: 13,
      priceSize: 32,
      descriptionSize: 15,
      fontScale: 1.05,
      fontFamily: "outfit",
      colorScheme: "sunset",
      borderRadius: "xl",
      highContrast: false,
    },
  },
  {
    id: "emerald-oasis",
    name: "Nature Sanctuary",
    tagline: "Calming botanical greens with comfortable reading sizes",
    colorScheme: "emerald",
    settings: {
      headingSize: 24,
      addressSize: 14,
      priceSize: 28,
      descriptionSize: 15,
      fontScale: 1.0,
      fontFamily: "poppins",
      colorScheme: "emerald",
      borderRadius: "lg",
      highContrast: false,
    },
  },
  {
    id: "midnight-luxe",
    name: "Midnight Dark Mode",
    tagline: "High-contrast dark obsidian canvas with luminous highlights",
    colorScheme: "dark",
    settings: {
      headingSize: 26,
      addressSize: 13,
      priceSize: 30,
      descriptionSize: 14,
      fontScale: 1.0,
      fontFamily: "inter",
      colorScheme: "dark",
      borderRadius: "xl",
      highContrast: true,
    },
  },
  {
    id: "accessible-large",
    name: "Accessible Comfort",
    tagline: "Enlarged fonts and high contrast for effortless visibility",
    colorScheme: "ocean",
    settings: {
      headingSize: 30,
      addressSize: 16,
      priceSize: 36,
      descriptionSize: 17,
      fontScale: 1.15,
      fontFamily: "inter",
      colorScheme: "ocean",
      borderRadius: "lg",
      highContrast: true,
    },
  },
  {
    id: "editorial-luxury",
    name: "Royal Editorial Serif",
    tagline: "Sophisticated editorial typography with refined spacing",
    colorScheme: "slate",
    settings: {
      headingSize: 28,
      addressSize: 13,
      priceSize: 30,
      descriptionSize: 16,
      fontScale: 1.0,
      fontFamily: "playfair",
      colorScheme: "slate",
      borderRadius: "md",
      highContrast: false,
    },
  },
];
