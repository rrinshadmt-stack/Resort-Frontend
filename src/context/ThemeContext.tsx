"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  ThemeSettings,
  DEFAULT_THEME_SETTINGS,
  TextSizeType,
  FontFamilyType,
  ColorSchemeType,
  BorderRadiusType,
  ThemePresetArchetype,
} from "@/types/theme";
import {
  getLocalThemeSettings,
  fetchThemeSettingsApi,
  saveThemeSettingsApi,
  resetThemeSettingsApi,
  applyThemeToDom,
} from "@/lib/theme-service";

export interface ThemeContextType {
  theme: ThemeSettings;
  isLoading: boolean;
  isSaving: boolean;
  apiSource: "backend-express" | "nextjs-internal" | "local-cache";
  isBackendConnected: boolean;
  hasUnsavedChanges: boolean;
  updateTextSize: (type: TextSizeType, size: number) => void;
  setFontScale: (scale: number) => void;
  setColorScheme: (colorScheme: ColorSchemeType) => void;
  setFontFamily: (fontFamily: FontFamilyType) => void;
  setBorderRadius: (borderRadius: BorderRadiusType) => void;
  setHighContrast: (highContrast: boolean) => void;
  applyArchetype: (archetype: ThemePresetArchetype) => void;
  saveThemeToApi: () => Promise<boolean>;
  refreshFromApi: () => Promise<void>;
  resetTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [apiSource, setApiSource] = useState<"backend-express" | "nextjs-internal" | "local-cache">("local-cache");
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Initialize theme from local cache first, then sync with API
  useEffect(() => {
    // 1. Instant local restore
    const cached = getLocalThemeSettings();
    setTheme(cached);
    applyThemeToDom(cached);

    // 2. Async API sync
    async function loadFromApi() {
      try {
        const res = await fetchThemeSettingsApi();
        if (res.data) {
          setTheme(res.data);
          applyThemeToDom(res.data);
          setApiSource(res.source);
          setIsBackendConnected(res.source === "backend-express" || res.backendSynced === true);
        }
      } catch (err) {
        console.warn("Theme sync fallback to local cache:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadFromApi();
  }, []);

  // Whenever theme changes, apply to DOM instantly
  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme]);

  // Update specific text size
  const updateTextSize = useCallback((type: TextSizeType, size: number) => {
    setTheme((prev) => {
      const updated = { ...prev };
      switch (type) {
        case "heading":
          updated.headingSize = size;
          break;
        case "address":
          updated.addressSize = size;
          break;
        case "price":
          updated.priceSize = size;
          break;
        case "description":
          updated.descriptionSize = size;
          break;
        case "badge":
          updated.badgeSize = size;
          break;
        case "button":
          updated.buttonSize = size;
          break;
      }
      return updated;
    });
    setHasUnsavedChanges(true);
  }, []);

  const setFontScale = useCallback((fontScale: number) => {
    setTheme((prev) => ({ ...prev, fontScale }));
    setHasUnsavedChanges(true);
  }, []);

  const setColorScheme = useCallback((colorScheme: ColorSchemeType) => {
    setTheme((prev) => ({ ...prev, colorScheme }));
    setHasUnsavedChanges(true);
  }, []);

  const setFontFamily = useCallback((fontFamily: FontFamilyType) => {
    setTheme((prev) => ({ ...prev, fontFamily }));
    setHasUnsavedChanges(true);
  }, []);

  const setBorderRadius = useCallback((borderRadius: BorderRadiusType) => {
    setTheme((prev) => ({ ...prev, borderRadius }));
    setHasUnsavedChanges(true);
  }, []);

  const setHighContrast = useCallback((highContrast: boolean) => {
    setTheme((prev) => ({ ...prev, highContrast }));
    setHasUnsavedChanges(true);
  }, []);

  const applyArchetype = useCallback((archetype: ThemePresetArchetype) => {
    setTheme((prev) => ({
      ...prev,
      ...archetype.settings,
      colorScheme: archetype.colorScheme,
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Save changes to API and local storage
  const saveThemeToApi = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await saveThemeSettingsApi(theme);
      setApiSource(res.source);
      setIsBackendConnected(res.source === "backend-express" || res.backendSynced === true);
      setHasUnsavedChanges(false);
      return res.success;
    } catch {
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [theme]);

  // Force re-fetch from API
  const refreshFromApi = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchThemeSettingsApi();
      if (res.data) {
        setTheme(res.data);
        applyThemeToDom(res.data);
        setApiSource(res.source);
        setIsBackendConnected(res.source === "backend-express" || res.backendSynced === true);
        setHasUnsavedChanges(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset to default
  const resetTheme = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await resetThemeSettingsApi();
      setTheme(res.data);
      applyThemeToDom(res.data);
      setHasUnsavedChanges(false);
    } finally {
      setIsSaving(false);
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isLoading,
        isSaving,
        apiSource,
        isBackendConnected,
        hasUnsavedChanges,
        updateTextSize,
        setFontScale,
        setColorScheme,
        setFontFamily,
        setBorderRadius,
        setHighContrast,
        applyArchetype,
        saveThemeToApi,
        refreshFromApi,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
