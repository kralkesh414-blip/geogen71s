import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  Download,
  RefreshCw,
  Search,
  WifiOff,
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { PageView, RegionId } from '../i18n/types';
import {
  CountryRecord,
  MONTHS_SHORT,
  REGIONAL_AGGREGATES,
  getStatusFromAqi,
} from '../data/geoData';
import { ALL_WORLD_COUNTRIES } from '../data/worldCountriesRegistry';
import { StatusLabel } from './StatusLabel';

interface StatisticsViewProps {
  onSelectCountry: (countryId: string, navigateTo?: PageView) => void;
}

type SortKey = 'name' | 'aqi' | 'pm25' | 'co2' | 'forest' | 'renewable' | 'temp';

export const StatisticsView: React.FC<StatisticsViewProps> = ({ onSelectCountry }) => {
  const {
    language,
    t,
    units,
    aqiThreshold,
    formatNumber,
    formatTempAnomaly,
    formatCo2,
  } = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<RegionId>('all');
  const [sortKey, setSortKey] = useState<SortKey>('aqi');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [chartRegion, setChartRegion] = useState<Exclude<RegionId, 'all'>>('central_asia');
  const [hoveredYearIdx, setHoveredYearIdx] = useState<number | null>(null);
  const [hoveredHeatCell, setHoveredHeatCell] = useState<{
    cityName: string;
    month: string;
    value: number;
  } | null>(null);
  const [simulatedError, setSimulatedError] = useState(false);
  const [csvBanner, setCsvBanner] = useState<string | null>(null);

  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ALL_WORLD_COUNTRIES.filter((country) => {
      const matchesRegion = regionFilter === 'all' || country.region === regionFilter;
      if (!matchesRegion) return false;
      if (!q) return true;
      const names = Object.values(country.name).join(' ').toLowerCase();
      const regionName = t.regions[country.region].toLowerCase();
      return names.includes(q) || regionName.includes(q) || country.iso2.toLowerCase().includes(q);
    });
  }, [searchQuery, regionFilter, t]);

  const sortedCountries = useMemo(() => {
    const copy = [...filteredCountries];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = a.name[language].localeCompare(b.name[language]);
          break;
        case 'aqi':
          cmp = a.aqi - b.aqi;
          break;
        case 'pm25':
          cmp = a.pm25 - b.pm25;
          break;
        case 'co2':
          cmp = a.co2PerCapita - b.co2PerCapita;
          break;
        case 'forest':
          cmp = a.forestCoverPct - b.forestCoverPct;
          break;
        case 'renewable':
          cmp = a.renewablePct - b.renewablePct;
          break;
        case 'temp':
          cmp = a.tempAnomalyC - b.tempAnomalyC;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [filteredCountries, sortKey, sortDir, language]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const handleExportCsv = () => {
    const headers = [
      t.common.country,
      t.common.region,
      t.indicators.aqi.short,
      t.indicators.pm25.short,
      t.indicators.co2.short,
      t.indicators.forest.short,
      t.indicators.renewable.short,
      t.indicators.tempAnomaly.short,
    ];
    const rows = sortedCountries.map((c) => [
      `"${c.name[language]}"`,
      `"${t.regions[c.region]}"`,
      c.aqi,
      c.pm25,
      units === 'imperial' ? (c.co2PerCapita * 1.10231).toFixed(1) : c.co2PerCapita.toFixed(1),
      c.forestCoverPct,
      c.renewablePct,
      units === 'imperial' ? (c.tempAnomalyC * 1.8).toFixed(2) : c.tempAnomalyC.toFixed(2),
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `geogen-statistics-${language}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setCsvBanner(t.statisticsView.csvSuccess);
    setTimeout(() => setCsvBanner(null), 4000);
  };

  // Time series SVG geometry
  const activeRegionAgg = useMemo(
    () =>
      REGIONAL_AGGREGATES.find((r) => r.region === chartRegion) ?? REGIONAL_AGGREGATES[0],
    [chartRegion],
  );

  const heatmapCities = useMemo(() => {
    const targetIds = [
      'tashkent',
      'almaty',
      'istanbul',
      'moscow',
      'berlin',
      'newdelhi',
      'beijing',
      'cairo',
    ];
    const list: { id: string; name: string; values: number[] }[] = [];
    for (const country of ALL_WORLD_COUNTRIES) {
      for (const city of country.cities) {
        if (targetIds.includes(city.id)) {
          list.push({
            id: city.id,
            name: city.name[language],
            // convert monthly AQI approximation into PM2.5 scale for matrix
            values: city.monthlyAqi.map((aqiVal) => Number((aqiVal * 0.34).toFixed(1))),
          });
        }
      }
    }
    return list;
  }, [language]);

  const getHeatColor = (pm25: number) => {
    if (pm25 < 12) return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200';
    if (pm25 < 20) return 'bg-teal-100 text-teal-900 dark:bg-teal-950/80 dark:text-teal-200';
    if (pm25 < 32) return 'bg-amber-100 text-amber-950 dark:bg-amber-950/80 dark:text-amber-200';
    if (pm25 < 45) return 'bg-orange-200 text-orange-950 dark:bg-orange-950/90 dark:text-orange-200';
    return 'bg-rose-200 text-rose-950 dark:bg-rose-950/90 dark:text-rose-200';
  };

  const regionOptions: RegionId[] = [
    'all',
    'central_asia',
    'europe',
    'asia_pacific',
    'americas',
    'mea',
  ];

  // SVG chart helper dimensions
  const chartW = 620;
  const chartH = 240;
  const padL = 44;
  const padR = 44;
  const padT = 20;
  const padB = 34;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const points = activeRegionAgg.timeSeries;
  const co2Min = 4;
  const co2Max = 12;
  const tempMin = 1.0;
  const tempMax = 1.8;

  const co2Coords = points.map((pt, i) => ({
    x: padL + (i / Math.max(1, points.length - 1)) * plotW,
    y: padT + plotH - ((pt.co2 - co2Min) / (co2Max - co2Min)) * plotH,
    pt,
  }));

  const tempCoords = points.map((pt, i) => ({
    x: padL + (i / Math.max(1, points.length - 1)) * plotW,
    y: padT + plotH - ((pt.tempAnomalyC - tempMin) / (tempMax - tempMin)) * plotH,
    pt,
  }));

  const co2Path = co2Coords.map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const tempPath = tempCoords.map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between dark:border-slate-800">
        <div className="max-w-3xl space-y-2">
          <p className="text-xs font-semibold tracking-wide text-teal-700 dark:text-teal-400">
            {t.statisticsView.eyebrow}
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white text-balance">
            {t.statisticsView.title}
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
            {t.statisticsView.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setSimulatedError((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <WifiOff className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span>{t.statisticsView.simulateError}</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={simulatedError || sortedCountries.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-800 disabled:opacity-50 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t.common.exportCsv}</span>
          </button>
        </div>
      </div>

      {/* CSV Toast */}
      {csvBanner && (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-200"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" aria-hidden="true" />
          <span>{csvBanner}</span>
        </div>
      )}

      {/* Simulated Error State */}
      {simulatedError ? (
        <div
          role="alert"
          className="flex flex-col items-start justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-6 sm:flex-row sm:items-center dark:border-rose-900/60 dark:bg-rose-950/40"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-700 dark:text-rose-400 shrink-0" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold text-rose-950 dark:text-rose-200">
                {t.statisticsView.errorTitle}
              </h2>
              <p className="mt-1 text-xs text-rose-800 dark:text-rose-300">
                {t.statisticsView.errorDescription}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSimulatedError(false)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-700 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-800 whitespace-nowrap shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t.common.retry}</span>
          </button>
        </div>
      ) : (
        <>
          {/* Charts Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Chart 1: Dual-Axis Time Series */}
            <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    {t.statisticsView.charts.timeSeriesTitle}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {t.statisticsView.charts.timeSeriesSubtitle}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <label htmlFor="chart-region-select" className="text-xs text-slate-500 dark:text-slate-400">
                    {t.statisticsView.charts.regionSelectLabel}:
                  </label>
                  <select
                    id="chart-region-select"
                    value={chartRegion}
                    onChange={(e) => setChartRegion(e.target.value as Exclude<RegionId, 'all'>)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  >
                    {REGIONAL_AGGREGATES.map((agg) => (
                      <option key={agg.region} value={agg.region}>
                        {t.regions[agg.region]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="h-0.5 w-5 bg-teal-600 inline-block" />
                  <span>{t.statisticsView.charts.co2SeriesLabel}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="h-0.5 w-5 border-t-2 border-dashed border-amber-600 inline-block" />
                  <span>{t.statisticsView.charts.tempSeriesLabel}</span>
                </div>
              </div>

              <div className="relative mt-3">
                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto overflow-visible">
                  {/* Horizontal gridlines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = padT + plotH * (1 - ratio);
                    const co2Label = (co2Min + (co2Max - co2Min) * ratio).toFixed(0);
                    const tempLabel = `+${(tempMin + (tempMax - tempMin) * ratio).toFixed(1)}°`;
                    return (
                      <g key={ratio}>
                        <line
                          x1={padL}
                          x2={chartW - padR}
                          y1={y}
                          y2={y}
                          className="stroke-slate-100 dark:stroke-slate-800"
                          strokeWidth={1}
                        />
                        <text
                          x={padL - 8}
                          y={y + 4}
                          textAnchor="end"
                          className="fill-slate-400 font-mono text-[10px]"
                        >
                          {co2Label}
                        </text>
                        <text
                          x={chartW - padR + 8}
                          y={y + 4}
                          textAnchor="start"
                          className="fill-amber-600 dark:fill-amber-400 font-mono text-[10px]"
                        >
                          {tempLabel}
                        </text>
                      </g>
                    );
                  })}

                  {/* CO2 solid curve */}
                  <path d={co2Path} fill="none" stroke="#0d9488" strokeWidth={2.25} />

                  {/* Temperature dashed curve */}
                  <path
                    d={tempPath}
                    fill="none"
                    stroke="#d97706"
                    strokeWidth={2.25}
                    strokeDasharray="5 4"
                  />

                  {/* Interactive Hover Columns */}
                  {points.map((pt, i) => {
                    const x = co2Coords[i].x;
                    const isHovered = hoveredYearIdx === i;
                    return (
                      <g key={pt.year}>
                        {isHovered && (
                          <line
                            x1={x}
                            x2={x}
                            y1={padT}
                            y2={padT + plotH}
                            className="stroke-slate-300 dark:stroke-slate-700"
                            strokeWidth={1}
                          />
                        )}
                        <circle
                          cx={x}
                          cy={co2Coords[i].y}
                          r={isHovered ? 5 : 3.5}
                          fill="#0d9488"
                          className="stroke-white dark:stroke-slate-900"
                          strokeWidth={1.5}
                        />
                        <circle
                          cx={x}
                          cy={tempCoords[i].y}
                          r={isHovered ? 5 : 3.5}
                          fill="#d97706"
                          className="stroke-white dark:stroke-slate-900"
                          strokeWidth={1.5}
                        />
                        <text
                          x={x}
                          y={chartH - 10}
                          textAnchor="middle"
                          className="fill-slate-500 dark:fill-slate-400 font-mono text-[11px]"
                        >
                          {pt.year}
                        </text>
                        <rect
                          x={x - plotW / (points.length * 2)}
                          y={padT}
                          width={plotW / points.length}
                          height={plotH}
                          fill="transparent"
                          className="cursor-crosshair"
                          onMouseEnter={() => setHoveredYearIdx(i)}
                          onMouseLeave={() => setHoveredYearIdx(null)}
                        />
                      </g>
                    );
                  })}
                </svg>

                {hoveredYearIdx !== null && (
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-950">
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                      {t.common.year}: {points[hoveredYearIdx].year}
                    </span>
                    <div className="flex items-center gap-4 font-mono">
                      <span className="text-teal-700 dark:text-teal-400">
                        {t.indicators.co2.short}: {formatCo2(points[hoveredYearIdx].co2)}
                      </span>
                      <span className="text-amber-700 dark:text-amber-400">
                        {t.indicators.tempAnomaly.short}:{' '}
                        {formatTempAnomaly(points[hoveredYearIdx].tempAnomalyC)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Regional Bar Comparison */}
            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  {t.statisticsView.charts.barChartTitle}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {t.statisticsView.charts.barChartSubtitle}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-xs bg-teal-600 inline-block" />
                  <span>{t.statisticsView.charts.renewableLegend}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-xs bg-emerald-600 inline-block" />
                  <span>{t.statisticsView.charts.forestLegend}</span>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {REGIONAL_AGGREGATES.map((agg) => (
                  <div key={agg.region} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {t.regions[agg.region]}
                      </span>
                      <span className="font-mono text-slate-500 dark:text-slate-400">
                        {formatNumber(agg.renewablePct, 1)}% / {formatNumber(agg.forestPct, 1)}%
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          style={{ width: `${agg.renewablePct}%` }}
                          className="h-full rounded-full bg-teal-600 dark:bg-teal-400"
                        />
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          style={{ width: `${agg.forestPct}%` }}
                          className="h-full rounded-full bg-emerald-600 dark:bg-emerald-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 3: Monthly PM2.5 Heatmap Matrix */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  {t.statisticsView.charts.heatmapTitle}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {t.statisticsView.charts.heatmapSubtitle}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span>{t.statisticsView.charts.heatmapLow}</span>
                <div className="flex gap-0.5">
                  <span className="h-2.5 w-4 rounded-xs bg-emerald-200 dark:bg-emerald-900" />
                  <span className="h-2.5 w-4 rounded-xs bg-teal-200 dark:bg-teal-900" />
                  <span className="h-2.5 w-4 rounded-xs bg-amber-200 dark:bg-amber-900" />
                  <span className="h-2.5 w-4 rounded-xs bg-orange-300 dark:bg-orange-900" />
                  <span className="h-2.5 w-4 rounded-xs bg-rose-300 dark:bg-rose-900" />
                </div>
                <span>{t.statisticsView.charts.heatmapHigh}</span>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[680px] border-separate border-spacing-1 text-xs">
                <thead>
                  <tr>
                    <th className="py-1.5 pr-3 text-left font-medium text-slate-500 dark:text-slate-400">
                      {t.common.city}
                    </th>
                    {MONTHS_SHORT[language].map((m) => (
                      <th
                        key={m}
                        className="py-1.5 text-center font-mono font-medium text-slate-500 dark:text-slate-400"
                      >
                        {m}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapCities.map((row) => (
                    <tr key={row.id}>
                      <td className="pr-3 py-1 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {row.name}
                      </td>
                      {row.values.map((val, mIdx) => (
                        <td
                          key={mIdx}
                          onMouseEnter={() =>
                            setHoveredHeatCell({
                              cityName: row.name,
                              month: MONTHS_SHORT[language][mIdx],
                              value: val,
                            })
                          }
                          onMouseLeave={() => setHoveredHeatCell(null)}
                          className={`rounded-sm py-1.5 text-center font-mono text-[11px] font-medium transition-transform hover:scale-105 cursor-default ${getHeatColor(val)}`}
                        >
                          {val.toFixed(0)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hoveredHeatCell && (
              <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 font-mono">
                {hoveredHeatCell.cityName} · {hoveredHeatCell.month}:{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {hoveredHeatCell.value} {t.indicators.pm25.unit}
                </span>
              </div>
            )}
          </div>

          {/* High-Density Sortable Data Table */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  {t.statisticsView.tableTitle}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {t.statisticsView.tableSubtitle}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.statisticsView.searchInputPlaceholder}
                    className="h-9 w-full sm:w-64 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {regionOptions.map((reg) => {
                    const active = regionFilter === reg;
                    return (
                      <button
                        key={reg}
                        type="button"
                        onClick={() => setRegionFilter(reg)}
                        className={`rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                          active
                            ? 'bg-teal-700 text-white dark:bg-teal-500 dark:text-slate-950'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        {t.regions[reg]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {sortedCountries.length === 0 ? (
              <div className="p-10 text-center">
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
                  className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
                >
                  {t.common.reset}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                      <th className="px-4 py-3 font-semibold">
                        <button
                          type="button"
                          onClick={() => handleSort('name')}
                          className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
                        >
                          <span>{t.common.country}</span>
                          <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </th>
                      <th className="px-4 py-3 font-semibold">{t.common.region}</th>
                      <th className="px-4 py-3 font-semibold text-right">
                        <button
                          type="button"
                          onClick={() => handleSort('aqi')}
                          className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
                        >
                          <span>{t.indicators.aqi.short}</span>
                          <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </th>
                      <th className="px-4 py-3 font-semibold text-right">
                        <button
                          type="button"
                          onClick={() => handleSort('pm25')}
                          className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
                        >
                          <span>{t.indicators.pm25.short}</span>
                          <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </th>
                      <th className="px-4 py-3 font-semibold text-right">
                        <button
                          type="button"
                          onClick={() => handleSort('co2')}
                          className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
                        >
                          <span>{t.indicators.co2.short}</span>
                          <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </th>
                      <th className="px-4 py-3 font-semibold text-right">
                        <button
                          type="button"
                          onClick={() => handleSort('forest')}
                          className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
                        >
                          <span>{t.indicators.forest.short}</span>
                          <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </th>
                      <th className="px-4 py-3 font-semibold text-right">
                        <button
                          type="button"
                          onClick={() => handleSort('renewable')}
                          className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
                        >
                          <span>{t.indicators.renewable.short}</span>
                          <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </th>
                      <th className="px-4 py-3 font-semibold text-right">
                        <button
                          type="button"
                          onClick={() => handleSort('temp')}
                          className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
                        >
                          <span>{t.indicators.tempAnomaly.short}</span>
                          <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </th>
                      <th className="px-4 py-3 font-semibold">{t.common.status}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sortedCountries.map((country: CountryRecord) => (
                      <tr
                        key={country.id}
                        onClick={() => onSelectCountry(country.id, 'map')}
                        className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                          {country.name[language]}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {t.regions[country.region]}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                          {country.aqi}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                          {formatNumber(country.pm25, 1)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                          {formatCo2(country.co2PerCapita)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-700 dark:text-emerald-400">
                          {formatNumber(country.forestCoverPct, 1)}%
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-teal-700 dark:text-teal-400">
                          {formatNumber(country.renewablePct, 1)}%
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-amber-700 dark:text-amber-400">
                          {formatTempAnomaly(country.tempAnomalyC)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusLabel status={getStatusFromAqi(country.aqi, aqiThreshold)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};
