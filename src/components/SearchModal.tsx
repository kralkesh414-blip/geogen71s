import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, Globe, MapPin, Search, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { ALL_WORLD_COUNTRIES } from '../data/worldCountriesRegistry';
import { PageView } from '../i18n/types';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelectCountry: (countryId: string, navigateTo?: PageView) => void;
  onSelectCity: (countryId: string, cityId: string) => void;
  onNavigate: (page: PageView) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  open,
  onClose,
  onSelectCountry,
  onSelectCity,
  onNavigate,
}) => {
  const { language, t } = useI18n();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 20);
    } else {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const trimmed = query.trim();
  const isTooShort = trimmed.length === 1;
  const q = trimmed.toLowerCase();

  const results = useMemo(() => {
    if (q.length < 2) {
      return { countries: [], cities: [], indicators: [] };
    }

    const matchedCountries = ALL_WORLD_COUNTRIES.filter((c) => {
      const names = Object.values(c.name).join(' ').toLowerCase();
      const regionName = t.regions[c.region].toLowerCase();
      return names.includes(q) || c.iso2.toLowerCase().includes(q) || regionName.includes(q);
    }).slice(0, 6);

    const matchedCities: { countryId: string; countryName: string; cityId: string; cityName: string; aqi: number }[] = [];
    for (const country of ALL_WORLD_COUNTRIES) {
      for (const city of country.cities) {
        const cityNames = Object.values(city.name).join(' ').toLowerCase();
        if (cityNames.includes(q)) {
          matchedCities.push({
            countryId: country.id,
            countryName: country.name[language],
            cityId: city.id,
            cityName: city.name[language],
            aqi: city.aqi,
          });
        }
      }
    }

    const indicatorEntries = [
      { key: 'aqi', name: t.indicators.aqi.name, desc: t.indicators.aqi.description },
      { key: 'pm25', name: t.indicators.pm25.name, desc: t.indicators.pm25.description },
      { key: 'co2', name: t.indicators.co2.name, desc: t.indicators.co2.description },
      { key: 'forest', name: t.indicators.forest.name, desc: t.indicators.forest.description },
      { key: 'renewable', name: t.indicators.renewable.name, desc: t.indicators.renewable.description },
      { key: 'tempAnomaly', name: t.indicators.tempAnomaly.name, desc: t.indicators.tempAnomaly.description },
      { key: 'waterQuality', name: t.indicators.waterQuality.name, desc: t.indicators.waterQuality.description },
      { key: 'biodiversity', name: t.indicators.biodiversity.name, desc: t.indicators.biodiversity.description },
    ].filter((ind) => ind.name.toLowerCase().includes(q) || ind.desc.toLowerCase().includes(q));

    return {
      countries: matchedCountries,
      cities: matchedCities.slice(0, 6),
      indicators: indicatorEntries.slice(0, 4),
    };
  }, [q, language, t]);

  if (!open) return null;

  const hasAnyResults =
    results.countries.length > 0 || results.cities.length > 0 || results.indicators.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/50 px-4 pt-16 sm:pt-24 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={t.searchModal.title}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5 dark:border-slate-800">
          <Search className="h-5 w-5 text-teal-700 dark:text-teal-400 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchModal.placeholder}
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={t.common.clear}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-200 px-2 py-1 font-mono text-[11px] text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            {t.searchModal.shortcutHint}
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-3">
          {isTooShort ? (
            <div className="flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{t.searchModal.errorInputTooShort}</span>
            </div>
          ) : q.length === 0 ? (
            <div className="space-y-2 p-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t.searchModal.countriesGroup}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {ALL_WORLD_COUNTRIES.slice(0, 6).map((country) => (
                  <button
                    key={country.id}
                    type="button"
                    onClick={() => {
                      onSelectCountry(country.id, 'map');
                      onClose();
                    }}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left text-sm transition-colors hover:border-teal-600/40 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/70"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {country.name[language]}
                    </span>
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      AQI {country.aqi}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : !hasAnyResults ? (
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {t.searchModal.emptyTitle}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t.searchModal.emptyBody}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.countries.length > 0 && (
                <div>
                  <div className="px-2 pb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t.searchModal.countriesGroup}
                  </div>
                  <div className="space-y-1">
                    {results.countries.map((country) => (
                      <button
                        key={country.id}
                        type="button"
                        onClick={() => {
                          onSelectCountry(country.id, 'map');
                          onClose();
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <div className="flex items-center gap-2.5">
                          <Globe className="h-4 w-4 text-teal-700 dark:text-teal-400 shrink-0" aria-hidden="true" />
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {country.name[language]}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {t.regions[country.region]} · {country.capital[language]}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                          <span>AQI {country.aqi}</span>
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.cities.length > 0 && (
                <div>
                  <div className="px-2 pb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t.searchModal.citiesGroup}
                  </div>
                  <div className="space-y-1">
                    {results.cities.map((city) => (
                      <button
                        key={city.cityId}
                        type="button"
                        onClick={() => {
                          onSelectCity(city.countryId, city.cityId);
                          onClose();
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {city.cityName}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {city.countryName}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                          <span>AQI {city.aqi}</span>
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.indicators.length > 0 && (
                <div>
                  <div className="px-2 pb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t.searchModal.indicatorsGroup}
                  </div>
                  <div className="space-y-1">
                    {results.indicators.map((ind) => (
                      <button
                        key={ind.key}
                        type="button"
                        onClick={() => {
                          onNavigate('statistics');
                          onClose();
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {ind.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {ind.desc}
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
