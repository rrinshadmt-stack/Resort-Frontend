import { ThemeSettings, DEFAULT_THEME_SETTINGS, TextSizeType } from "@/types/theme";

const STORAGE_KEY = "stayup_theme_settings";

export interface ThemeApiResponse {
  success: boolean;
  source: "backend-express" | "nextjs-internal" | "local-cache";
  backendSynced?: boolean;
  message?: string;
  data: ThemeSettings;
}

/**
 * Reads cached theme from localStorage for instant, zero-flicker client hydration
 */
export function getLocalThemeSettings(): ThemeSettings {
  if (typeof window === "undefined") {
    return DEFAULT_THEME_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_THEME_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_THEME_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_THEME_SETTINGS;
  }
}

/**
 * Saves theme to localStorage
 */
export function setLocalThemeSettings(settings: ThemeSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to write theme to localStorage:", err);
  }
}

/**
 * Fetches theme settings from the API (/api/theme), syncing with backend Express server
 */
export async function fetchThemeSettingsApi(): Promise<ThemeApiResponse> {
  try {
    const res = await fetch("/api/theme", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Theme API responded with status ${res.status}`);
    }

    const json = await res.json();
    const data: ThemeSettings = { ...DEFAULT_THEME_SETTINGS, ...(json.data || {}) };
    setLocalThemeSettings(data);

    return {
      success: true,
      source: json.source || "nextjs-internal",
      backendSynced: json.source === "backend-express",
      data,
    };
  } catch (err) {
    console.warn("API theme fetch failed, using local cache fallback:", err);
    return {
      success: false,
      source: "local-cache",
      backendSynced: false,
      data: getLocalThemeSettings(),
    };
  }
}

/**
 * Saves theme settings to API (/api/theme) and persists to localStorage
 */
export async function saveThemeSettingsApi(settings: ThemeSettings): Promise<ThemeApiResponse> {
  setLocalThemeSettings(settings);

  try {
    const res = await fetch("/api/theme", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    if (!res.ok) {
      throw new Error(`Theme API save responded with status ${res.status}`);
    }

    const json = await res.json();
    return {
      success: true,
      source: json.source || "nextjs-internal",
      backendSynced: json.backendSynced ?? (json.source === "backend-express"),
      message: json.message || "Theme successfully saved",
      data: json.data || settings,
    };
  } catch (err) {
    console.warn("Theme API save failed, saved locally in browser:", err);
    return {
      success: true,
      source: "local-cache",
      backendSynced: false,
      message: "Saved locally (API server offline)",
      data: settings,
    };
  }
}

/**
 * Resets theme to factory defaults
 */
export async function resetThemeSettingsApi(): Promise<ThemeApiResponse> {
  setLocalThemeSettings(DEFAULT_THEME_SETTINGS);

  try {
    const res = await fetch("/api/theme", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(DEFAULT_THEME_SETTINGS),
    });

    const json = await res.json();
    return {
      success: true,
      source: json.source || "nextjs-internal",
      message: "Reset to default theme",
      data: DEFAULT_THEME_SETTINGS,
    };
  } catch {
    return {
      success: true,
      source: "local-cache",
      message: "Reset locally to defaults",
      data: DEFAULT_THEME_SETTINGS,
    };
  }
}

/**
 * Maps border radius keyword to CSS value
 */
export function getBorderRadiusValue(radius: ThemeSettings["borderRadius"]): string {
  switch (radius) {
    case "none":
      return "0px";
    case "sm":
      return "0.375rem";
    case "md":
      return "0.5rem";
    case "lg":
      return "1rem";
    case "xl":
      return "1.5rem";
    case "full":
      return "9999px";
    default:
      return "1rem";
  }
}

/**
 * Maps font family keyword to CSS font stack
 */
export function getFontFamilyValue(font: ThemeSettings["fontFamily"]): string {
  switch (font) {
    case "outfit":
      return "'Outfit', var(--font-inter), system-ui, sans-serif";
    case "poppins":
      return "'Poppins', var(--font-inter), system-ui, sans-serif";
    case "playfair":
      return "'Playfair Display', Georgia, serif";
    case "system":
      return "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    case "inter":
    default:
      return "var(--font-inter), system-ui, sans-serif";
  }
}

/**
 * Injects dynamic CSS variables directly onto document.documentElement
 */
export function applyThemeToDom(settings: ThemeSettings): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const scale = Number(settings.fontScale) || 1.0;

  // Set typography variables with scale factor
  const headingPx = Math.round((Number(settings.headingSize) || 24) * scale);
  const addressPx = Math.round((Number(settings.addressSize) || 13) * scale);
  const pricePx = Math.round((Number(settings.priceSize) || 28) * scale);
  const descriptionPx = Math.round((Number(settings.descriptionSize) || 14) * scale);
  const badgePx = Math.round((Number(settings.badgeSize) || 12) * scale);
  const buttonPx = Math.round((Number(settings.buttonSize) || 14) * scale);

  root.style.setProperty("--theme-heading-size", `${headingPx}px`);
  root.style.setProperty("--theme-address-size", `${addressPx}px`);
  root.style.setProperty("--theme-price-size", `${pricePx}px`);
  root.style.setProperty("--theme-description-size", `${descriptionPx}px`);
  root.style.setProperty("--theme-badge-size", `${badgePx}px`);
  root.style.setProperty("--theme-button-size", `${buttonPx}px`);
  root.style.setProperty("--theme-radius", getBorderRadiusValue(settings.borderRadius));
  root.style.setProperty("--theme-font-family", getFontFamilyValue(settings.fontFamily));

  // Set theme mode data attributes
  root.setAttribute("data-theme", settings.colorScheme || "ocean");
  root.setAttribute("data-high-contrast", settings.highContrast ? "true" : "false");

  // Adjust root font family directly
  if (settings.fontFamily === "playfair") {
    root.style.fontFamily = "'Playfair Display', Georgia, serif";
  } else {
    root.style.fontFamily = getFontFamilyValue(settings.fontFamily);
  }
}
