import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  LanguageCode,
  SUPPORTED_LANGUAGES,
  ThemeMode,
  TranslationSchema,
  UnitSystem,
} from './types';
import { uz } from './translations/uz';
import { ru } from './translations/ru';
import { tr } from './translations/tr';
import { en } from './translations/en';

const STORAGE_LANG_KEY = 'geogen_language';
const STORAGE_UNITS_KEY = 'geogen_units';
const STORAGE_THEME_KEY = 'geogen_theme';
const STORAGE_AQI_THRESHOLD_KEY = 'geogen_aqi_threshold';

const DICTIONARIES: Record<LanguageCode, TranslationSchema> = {
  uz,
  ru,
  tr,
  en,
};

function isValidLanguage(value: string | null): value is LanguageCode {
  return value === 'uz' || value === 'ru' || value === 'tr' || value === 'en';
}

interface I18nContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: TranslationSchema;
  languages: typeof SUPPORTED_LANGUAGES;
  units: UnitSystem;
  setUnits: (units: UnitSystem) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  aqiThreshold: number;
  setAqiThreshold: (threshold: number) => void;
  resetPreferences: () => void;
  formatNumber: (value: number, decimals?: number) => string;
  formatTempAnomaly: (celsiusDelta: number) => string;
  formatArea: (km2: number) => string;
  formatElevation: (meters: number) => string;
  formatCo2: (tonnesPerCapita: number) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const LOCALE_MAP: Record<LanguageCode, string> = {
  uz: 'uz-Latn-UZ',
  ru: 'ru-RU',
  tr: 'tr-TR',
  en: 'en-US',
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      if (isValidLanguage(saved)) {
        return saved;
      }
    } catch {
      // Ignore storage access errors
    }
    return 'uz';
  });

  const [units, setUnitsState] = useState<UnitSystem>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_UNITS_KEY);
      if (saved === 'metric' || saved === 'imperial') return saved;
    } catch {
      // Ignore
    }
    return 'metric';
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // Ignore
    }
    return 'light';
  });

  const [aqiThreshold, setAqiThresholdState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AQI_THRESHOLD_KEY);
      if (saved) {
        const parsed = Number(saved);
        if (!Number.isNaN(parsed) && parsed >= 25 && parsed <= 300) {
          return parsed;
        }
      }
    } catch {
      // Ignore
    }
    return 100;
  });

  const t = DICTIONARIES[language];

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
    } catch {
      // Ignore storage write errors
    }
  }, []);

  const setUnits = useCallback((nextUnits: UnitSystem) => {
    setUnitsState(nextUnits);
    try {
      localStorage.setItem(STORAGE_UNITS_KEY, nextUnits);
    } catch {
      // Ignore
    }
  }, []);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, nextTheme);
    } catch {
      // Ignore
    }
  }, []);

  const setAqiThreshold = useCallback((next: number) => {
    setAqiThresholdState(next);
    try {
      localStorage.setItem(STORAGE_AQI_THRESHOLD_KEY, String(next));
    } catch {
      // Ignore
    }
  }, []);

  const resetPreferences = useCallback(() => {
    setLanguage('uz');
    setUnits('metric');
    setTheme('light');
    setAqiThreshold(100);
  }, [setLanguage, setUnits, setTheme, setAqiThreshold]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t.meta.pageTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', t.meta.pageDescription);
    }
  }, [language, t]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const formatNumber = useCallback(
    (value: number, decimals = 0) => {
      try {
        return new Intl.NumberFormat(LOCALE_MAP[language], {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);
      } catch {
        return value.toFixed(decimals);
      }
    },
    [language],
  );

  const formatTempAnomaly = useCallback(
    (celsiusDelta: number) => {
      const value = units === 'imperial' ? celsiusDelta * 1.8 : celsiusDelta;
      const sign = value >= 0 ? '+' : '';
      const unit = units === 'imperial' ? t.indicators.tempAnomaly.unitImperial : t.indicators.tempAnomaly.unitMetric;
      return `${sign}${formatNumber(value, 2)} ${unit}`;
    },
    [units, formatNumber, t],
  );

  const formatArea = useCallback(
    (km2: number) => {
      if (units === 'imperial') {
        const sqMi = Math.round(km2 * 0.386102);
        return `${formatNumber(sqMi)} mi²`;
      }
      return `${formatNumber(km2)} km²`;
    },
    [units, formatNumber],
  );

  const formatElevation = useCallback(
    (meters: number) => {
      if (units === 'imperial') {
        const feet = Math.round(meters * 3.28084);
        return `${formatNumber(feet)} ft`;
      }
      return `${formatNumber(meters)} m`;
    },
    [units, formatNumber],
  );

  const formatCo2 = useCallback(
    (tonnesPerCapita: number) => {
      const value = units === 'imperial' ? tonnesPerCapita * 1.10231 : tonnesPerCapita;
      const unit = units === 'imperial' ? t.indicators.co2.unitImperial : t.indicators.co2.unitMetric;
      return `${formatNumber(value, 1)} ${unit}`;
    },
    [units, formatNumber, t],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t,
      languages: SUPPORTED_LANGUAGES,
      units,
      setUnits,
      theme,
      setTheme,
      aqiThreshold,
      setAqiThreshold,
      resetPreferences,
      formatNumber,
      formatTempAnomaly,
      formatArea,
      formatElevation,
      formatCo2,
    }),
    [
      language,
      setLanguage,
      t,
      units,
      setUnits,
      theme,
      setTheme,
      aqiThreshold,
      setAqiThreshold,
      resetPreferences,
      formatNumber,
      formatTempAnomaly,
      formatArea,
      formatElevation,
      formatCo2,
    ],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}
