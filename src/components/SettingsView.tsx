import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle2,
  Globe,
  Info,
  Moon,
  RotateCcw,
  Ruler,
  Sun,
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { LanguageCode } from '../i18n/types';

export const SettingsView: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
    languages,
    units,
    setUnits,
    theme,
    setTheme,
    aqiThreshold,
    setAqiThreshold,
    resetPreferences,
  } = useI18n();

  const [thresholdInput, setThresholdInput] = useState<string>(String(aqiThreshold));
  const [thresholdError, setThresholdError] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  useEffect(() => {
    setThresholdInput(String(aqiThreshold));
  }, [aqiThreshold]);

  const showToast = (msg: string) => {
    setFeedbackBanner(msg);
  };

  useEffect(() => {
    if (!feedbackBanner) return;
    const timer = setTimeout(() => setFeedbackBanner(null), 4000);
    return () => clearTimeout(timer);
  }, [feedbackBanner]);

  const handleLanguageSelect = (code: LanguageCode) => {
    setLanguage(code);
    // Use target language's toast immediately after switching via effect or compute right away
    setFeedbackBanner(null);
    setTimeout(() => {
      setFeedbackBanner('SWITCHED');
    }, 10);
  };

  const handleApplyThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(thresholdInput);
    if (!Number.isInteger(parsed) || parsed < 25 || parsed > 300) {
      setThresholdError(t.settingsView.aqiThresholdError);
      return;
    }
    setThresholdError(null);
    setAqiThreshold(parsed);
    showToast(t.settingsView.thresholdSaved);
  };

  const handleResetAll = () => {
    resetPreferences();
    setThresholdError(null);
    setFeedbackBanner('RESET');
  };

  const resolvedBannerText =
    feedbackBanner === 'SWITCHED'
      ? t.settingsView.languageSwitchedToast
      : feedbackBanner === 'RESET'
        ? t.settingsView.resetAllSuccess
        : feedbackBanner;

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
        <p className="text-xs font-semibold tracking-wide text-teal-700 dark:text-teal-400">
          {t.settingsView.eyebrow}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white text-balance">
          {t.settingsView.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
          {t.settingsView.subtitle}
        </p>
      </div>

      {/* Confirmation Banner */}
      {resolvedBannerText && (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-200"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" aria-hidden="true" />
          <span>{resolvedBannerText}</span>
        </div>
      )}

      {/* Dedicated Language Selection Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 shrink-0">
            <Globe className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {t.settingsView.languageSectionTitle}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t.settingsView.languageSectionSubtitle}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {languages.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageSelect(lang.code)}
                aria-pressed={isSelected}
                className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-teal-700 bg-teal-50/70 ring-1 ring-teal-700/20 dark:border-teal-400 dark:bg-teal-950/40 dark:ring-teal-400/20'
                    : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-lg font-mono text-sm font-bold ${
                      isSelected
                        ? 'bg-teal-700 text-white dark:bg-teal-500 dark:text-slate-950'
                        : 'border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                  >
                    {lang.shortCode}
                  </span>
                  <div>
                    <div className="font-display text-base font-bold text-slate-900 dark:text-white">
                      {lang.nativeName}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {lang.scriptLabel}
                      {lang.isDefault && (
                        <>
                          <span className="mx-1.5" aria-hidden="true">·</span>
                          <span className="font-medium text-teal-700 dark:text-teal-400">
                            {t.common.defaultBadge}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400">
                      <Check className="h-4 w-4" aria-hidden="true" />
                      <span>{t.common.active}</span>
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                      {lang.englishName}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          {t.settingsView.languageSavedNote}:{' '}
          <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
            {languages.find((l) => l.code === language)?.nativeName} ({language.toUpperCase()})
          </span>
        </p>
      </div>

      {/* Display & Measurement Units */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 shrink-0">
            <Ruler className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {t.settingsView.displaySectionTitle}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t.settingsView.displaySectionSubtitle}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Theme */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t.settingsView.themeLabel}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors ${
                  theme === 'light'
                    ? 'border-teal-700 bg-teal-50 text-teal-800 dark:border-teal-400 dark:bg-teal-950/50 dark:text-teal-300'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                }`}
              >
                <Sun className="h-4 w-4" aria-hidden="true" />
                <span>{t.settingsView.themeLight}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors ${
                  theme === 'dark'
                    ? 'border-teal-700 bg-teal-50 text-teal-800 dark:border-teal-400 dark:bg-teal-950/50 dark:text-teal-300'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                }`}
              >
                <Moon className="h-4 w-4" aria-hidden="true" />
                <span>{t.settingsView.themeDark}</span>
              </button>
            </div>
          </div>

          {/* Units */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t.settingsView.unitsLabel}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setUnits('metric')}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  units === 'metric'
                    ? 'border-teal-700 bg-teal-50 text-teal-900 dark:border-teal-400 dark:bg-teal-950/50 dark:text-teal-200'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                }`}
              >
                <div className="text-xs font-semibold">{t.settingsView.unitsMetric}</div>
                <div className="mt-0.5 text-[11px] opacity-75">{t.settingsView.unitsMetricDesc}</div>
              </button>
              <button
                type="button"
                onClick={() => setUnits('imperial')}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  units === 'imperial'
                    ? 'border-teal-700 bg-teal-50 text-teal-900 dark:border-teal-400 dark:bg-teal-950/50 dark:text-teal-200'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                }`}
              >
                <div className="text-xs font-semibold">{t.settingsView.unitsImperial}</div>
                <div className="mt-0.5 text-[11px] opacity-75">{t.settingsView.unitsImperialDesc}</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Environmental Alert Thresholds */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 shrink-0">
            <Bell className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {t.settingsView.alertsSectionTitle}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t.settingsView.alertsSectionSubtitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleApplyThreshold} className="mt-5 space-y-3">
          <label
            htmlFor="aqi-threshold-input"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            {t.settingsView.aqiThresholdLabel}
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              id="aqi-threshold-input"
              type="number"
              value={thresholdInput}
              onChange={(e) => {
                setThresholdInput(e.target.value);
                if (thresholdError) setThresholdError(null);
              }}
              className="h-10 w-32 rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-sm font-semibold text-slate-900 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="submit"
              className="h-10 rounded-lg bg-teal-700 px-4 text-xs font-semibold text-white transition-colors hover:bg-teal-800 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 whitespace-nowrap"
            >
              {t.settingsView.applyThreshold}
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.settingsView.aqiThresholdHelp}
          </p>
          {thresholdError && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-200"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{thresholdError}</span>
            </div>
          )}
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t.settingsView.resetAllLabel}
          </span>
          <button
            type="button"
            onClick={handleResetAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t.settingsView.resetAllButton}</span>
          </button>
        </div>
      </div>

      {/* About GEOGEN */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 text-teal-700 dark:text-teal-400 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              {t.settingsView.aboutSectionTitle}
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t.settingsView.aboutSectionBody}
            </p>
            <div className="mt-3 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">
                {t.settingsView.creatorLabel}:{' '}
              </span>
              <span className="font-display font-bold text-teal-700 dark:text-teal-400">
                {t.settingsView.creatorName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
