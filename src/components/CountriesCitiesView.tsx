import React, { useMemo, useState } from 'react';
import { AlertTriangle, BookOpen, CheckCircle2, Globe, Search } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { PageView, RegionId } from '../i18n/types';
import {
  MONTHS_SHORT,
  getCityLayerColor,
  getStatusFromAqi,
} from '../data/geoData';
import { ALL_WORLD_COUNTRIES } from '../data/worldCountriesRegistry';
import { StatusLabel } from './StatusLabel';

interface CountriesCitiesViewProps {
  selectedCountryId: string;
  selectedCityId: string | null;
  onSelectCountry: (countryId: string) => void;
  onSelectCity: (countryId: string, cityId: string) => void;
  onNavigate: (page: PageView) => void;
}

export const CountriesCitiesView: React.FC<CountriesCitiesViewProps> = ({
  selectedCountryId,
  selectedCityId,
  onSelectCountry,
  onSelectCity,
  onNavigate,
}) => {
  const {
    language,
    t,
    aqiThreshold,
    formatNumber,
    formatArea,
    formatElevation,
    formatTempAnomaly,
    formatCo2,
  } = useI18n();

  const [regionFilter, setRegionFilter] = useState<RegionId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ALL_WORLD_COUNTRIES.filter((country) => {
      const matchesReg = regionFilter === 'all' || country.region === regionFilter;
      if (!matchesReg) return false;
      if (!q) return true;
      const countryNames = Object.values(country.name).join(' ').toLowerCase();
      const cityNames = country.cities
        .flatMap((city) => Object.values(city.name))
        .join(' ')
        .toLowerCase();
      return countryNames.includes(q) || cityNames.includes(q);
    });
  }, [regionFilter, searchQuery]);

  const activeCountry = useMemo(
    () =>
      filteredCountries.find((c) => c.id === selectedCountryId) ??
      filteredCountries[0] ??
      ALL_WORLD_COUNTRIES[0],
    [filteredCountries, selectedCountryId],
  );

  const activeCity = useMemo(
    () =>
      activeCountry.cities.find((city) => city.id === selectedCityId) ?? activeCountry.cities[0],
    [activeCountry, selectedCityId],
  );

  const totalCitiesCount = useMemo(
    () => filteredCountries.reduce((acc, c) => acc + c.cities.length, 0),
    [filteredCountries],
  );

  const regionOptions: RegionId[] = [
    'all',
    'central_asia',
    'europe',
    'asia_pacific',
    'americas',
    'mea',
  ];

  const maxMonthlyAqi = Math.max(...activeCity.monthlyAqi, 100);

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="max-w-3xl space-y-2">
          <p className="text-xs font-semibold tracking-wide text-teal-700 dark:text-teal-400">
            {t.regionsView.eyebrow}
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white text-balance">
            {t.regionsView.title}
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
            {t.regionsView.subtitle}
          </p>
        </div>

        {/* Search & Region Filter */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {regionOptions.map((reg) => {
              const active = regionFilter === reg;
              return (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setRegionFilter(reg)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'border-teal-700 bg-teal-700 text-white dark:border-teal-500 dark:bg-teal-500 dark:text-slate-950'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  {t.regions[reg]}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:flex-initial">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.regionsView.searchPlaceholder}
                className="h-9 w-full sm:w-64 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div className="font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {filteredCountries.length} {t.regionsView.countriesCountLabel} · {totalCitiesCount}{' '}
              {t.regionsView.citiesCountLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Directory Grid: Left Country List + Right Country & City Profile */}
      {filteredCountries.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {t.statisticsView.emptyTableTitle}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t.statisticsView.emptyTableDescription}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setRegionFilter('all');
            }}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white dark:bg-slate-100 dark:text-slate-900"
          >
            {t.common.reset}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Country Cards List */}
          <div className="lg:col-span-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
            {filteredCountries.map((country) => {
              const isSelected = country.id === activeCountry.id;
              return (
                <button
                  key={country.id}
                  type="button"
                  onClick={() => onSelectCountry(country.id)}
                  className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                    isSelected
                      ? 'border-teal-700 bg-teal-50/60 dark:border-teal-500 dark:bg-teal-950/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {country.iso2} · {t.regions[country.region]}
                    </div>
                    <div className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                      {country.name[language]}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        {t.common.capital}: {country.capital[language]}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        {country.cities.map((c) => (
                          <span
                            key={c.id}
                            style={{ backgroundColor: getCityLayerColor(c, 'aqi') }}
                            className="h-2 w-2 rounded-full inline-block"
                            title={c.name[language]}
                          />
                        ))}
                        <span>
                          {country.cities.length} {t.regionsView.citiesCountLabel}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-base font-bold text-slate-900 dark:text-white">
                      {country.aqi}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t.indicators.aqi.short}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Country + City Detailed Inspector */}
          <div className="lg:col-span-7 space-y-6">
            {/* Country Profile */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Globe className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" aria-hidden="true" />
                    <span>{t.regionsView.countryProfileHeading}</span>
                    <span aria-hidden="true">·</span>
                    <span>{t.regions[activeCountry.region]}</span>
                  </div>
                  <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">
                    {activeCountry.name[language]}
                  </h2>
                </div>
                <StatusLabel status={getStatusFromAqi(activeCountry.aqi, aqiThreshold)} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs">
                <div>
                  <div className="text-slate-500 dark:text-slate-400">{t.common.capital}</div>
                  <div className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                    {activeCountry.capital[language]}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 dark:text-slate-400">{t.common.population}</div>
                  <div className="mt-0.5 font-mono font-semibold text-slate-900 dark:text-white">
                    {formatNumber(activeCountry.populationMillions, 1)}M
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 dark:text-slate-400">{t.common.area}</div>
                  <div className="mt-0.5 font-mono font-semibold text-slate-900 dark:text-white">
                    {formatArea(activeCountry.areaKm2)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 dark:text-slate-400">
                    {t.indicators.tempAnomaly.short}
                  </div>
                  <div className="mt-0.5 font-mono font-semibold text-amber-700 dark:text-amber-400">
                    {formatTempAnomaly(activeCountry.tempAnomalyC)}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                <p>{activeCountry.geoDescription[language]}</p>
                <p className="text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {t.common.terrain}:
                  </span>{' '}
                  {activeCountry.terrain[language]}
                </p>
                <p className="text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {t.common.climateZone}:
                  </span>{' '}
                  {activeCountry.climateZone[language]}
                </p>
                <p className="border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
                  {activeCountry.envDescription[language]}
                </p>
              </div>
            </div>

            {/* Cities Selector & Full Telemetry + Strengths/Issues */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    {t.regionsView.citiesHeading} ({activeCountry.cities.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.regionsView.selectCityPrompt}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('map')}
                  className="text-xs font-semibold text-teal-700 hover:underline dark:text-teal-400"
                >
                  {t.nav.map} →
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {activeCountry.cities.map((city) => {
                  const isActive = city.id === activeCity.id;
                  const cityColor = getCityLayerColor(city, 'aqi');
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => onSelectCity(activeCountry.id, city.id)}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                        isActive
                          ? 'border-teal-700 bg-teal-700 text-white dark:border-teal-500 dark:bg-teal-500 dark:text-slate-950'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                      }`}
                    >
                      <span
                        style={{ backgroundColor: cityColor }}
                        className="h-2.5 w-2.5 rounded-full border border-white/80 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{city.name[language]}</span>
                      <span className="font-mono text-[11px] opacity-80">{city.aqi}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active City Telemetry */}
              <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      style={{ backgroundColor: getCityLayerColor(activeCity, 'aqi') }}
                      className="h-4 w-4 rounded-full border border-white shadow-xs dark:border-slate-800 shrink-0"
                    />
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {t.regionsView.cityTelemetryHeading} · {t.common.population}:{' '}
                        {formatNumber(activeCity.populationMillions, 2)}M
                      </div>
                      <h4 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                        {activeCity.name[language]}
                      </h4>
                    </div>
                  </div>
                  <StatusLabel status={getStatusFromAqi(activeCity.aqi, aqiThreshold)} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                    <div className="text-slate-500 dark:text-slate-400">{t.indicators.aqi.short}</div>
                    <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white">
                      {activeCity.aqi}
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                    <div className="text-slate-500 dark:text-slate-400">{t.indicators.pm25.short}</div>
                    <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white">
                      {formatNumber(activeCity.pm25, 1)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                    <div className="text-slate-500 dark:text-slate-400">{t.indicators.co2.short}</div>
                    <div className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-white">
                      {formatCo2(activeCity.co2PerCapita)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                    <div className="text-slate-500 dark:text-slate-400">{t.mapView.greenSpaceLabel}</div>
                    <div className="mt-1 font-mono text-lg font-bold text-emerald-700 dark:text-emerald-400">
                      {activeCity.greenSpacePct}%
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                    <div className="text-slate-500 dark:text-slate-400">{t.indicators.renewable.short}</div>
                    <div className="mt-1 font-mono text-base font-bold text-teal-700 dark:text-teal-400">
                      {formatNumber(activeCity.renewablePct, 1)}%
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                    <div className="text-slate-500 dark:text-slate-400">{t.indicators.waterQuality.short}</div>
                    <div className="mt-1 font-mono text-base font-bold text-slate-900 dark:text-white">
                      {activeCity.waterQualityScore}/100
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                    <div className="text-slate-500 dark:text-slate-400">{t.common.elevation}</div>
                    <div className="mt-1 font-mono text-base font-bold text-slate-900 dark:text-white">
                      {formatElevation(activeCity.elevationM)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                    <div className="text-slate-500 dark:text-slate-400">{t.common.coordinates}</div>
                    <div className="mt-1 font-mono text-xs font-semibold text-slate-900 dark:text-white">
                      {activeCity.lat.toFixed(2)}°, {activeCity.lon.toFixed(2)}°
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {activeCity.climateNote[language]}:
                  </span>{' '}
                  {activeCity.envNote[language]}
                </p>

                {/* City Strengths & Issues */}
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-emerald-200/70 bg-emerald-50/40 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{t.mapView.cityStrengthsHeading}</span>
                    </div>
                    <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      {activeCity.strengths[language].map((item, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-emerald-600 dark:text-emerald-400" aria-hidden="true">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg border border-amber-200/70 bg-amber-50/40 p-3.5 dark:border-amber-900/50 dark:bg-amber-950/20">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{t.mapView.cityIssuesHeading}</span>
                    </div>
                    <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      {activeCity.issues[language].map((item, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-amber-600 dark:text-amber-400" aria-hidden="true">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Seasonal Monthly AQI Bar Sparkline */}
                <div className="mt-5">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {t.regionsView.seasonalTrendHeading}
                  </div>
                  <div className="mt-3 grid grid-cols-12 gap-1.5 items-end h-24">
                    {activeCity.monthlyAqi.map((val, idx) => {
                      const heightPct = Math.max(12, Math.round((val / maxMonthlyAqi) * 100));
                      const barTone =
                        val >= aqiThreshold
                          ? 'bg-rose-600 dark:bg-rose-500'
                          : val >= Math.round(aqiThreshold * 0.5)
                            ? 'bg-amber-500 dark:bg-amber-400'
                            : 'bg-teal-600 dark:bg-teal-400';
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
                          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                            {val}
                          </span>
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={`w-full rounded-t-xs ${barTone}`}
                          />
                          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                            {MONTHS_SHORT[language][idx]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Informational Section: Methodology & Glossary */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <BookOpen className="mt-0.5 h-5 w-5 text-teal-700 dark:text-teal-400 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {t.regionsView.methodologyTitle}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t.regionsView.methodologySubtitle}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {t.regionsView.glossaryItems.map((item) => (
            <div key={item.title} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
