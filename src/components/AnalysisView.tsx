import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, RotateCcw, ShieldAlert, TrendingUp } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { CountryRecord } from '../data/geoData';
import { ALL_WORLD_COUNTRIES } from '../data/worldCountriesRegistry';

interface AnalysisViewProps {
  selectedCountryId: string;
  onSelectCountry: (countryId: string) => void;
}

function getRadarScores(country: CountryRecord): number[] {
  const airPurity = Math.max(10, Math.min(100, Math.round(115 - country.aqi * 0.78)));
  const waterQuality = country.waterQualityScore;
  const forestPreservation = Math.min(100, Math.round(country.forestCoverPct * 1.35 + 15));
  const renewableTransition = Math.round(country.renewablePct);
  const biodiversity = country.biodiversityScore;
  const climateStability = Math.max(15, Math.min(100, Math.round(110 - country.tempAnomalyC * 32)));
  return [
    airPurity,
    waterQuality,
    forestPreservation,
    renewableTransition,
    biodiversity,
    climateStability,
  ];
}

const GLOBAL_BENCHMARK_SCORES = [64, 72, 54, 42, 70, 62];

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  selectedCountryId,
  onSelectCountry,
}) => {
  const { language, t, formatNumber, formatCo2, formatTempAnomaly } = useI18n();

  const [compareCountryId, setCompareCountryId] = useState<string>('tur');
  const [renewableBoost, setRenewableBoost] = useState<number>(25);
  const [reforestationBoost, setReforestationBoost] = useState<number>(15);
  const [emissionCut, setEmissionCut] = useState<number>(20);
  const [validationError, setValidationError] = useState<string | null>(null);

  const primaryCountry = useMemo(
    () => ALL_WORLD_COUNTRIES.find((c) => c.id === selectedCountryId) ?? ALL_WORLD_COUNTRIES[0],
    [selectedCountryId],
  );

  const compareCountry = useMemo(
    () =>
      ALL_WORLD_COUNTRIES.find((c) => c.id === compareCountryId) ??
      ALL_WORLD_COUNTRIES.find((c) => c.id !== primaryCountry.id) ??
      ALL_WORLD_COUNTRIES[1],
    [compareCountryId, primaryCountry.id],
  );

  const radarAxes = [
    t.analysisView.axes.airPurity,
    t.analysisView.axes.waterQuality,
    t.analysisView.axes.forestPreservation,
    t.analysisView.axes.renewableTransition,
    t.analysisView.axes.biodiversity,
    t.analysisView.axes.climateStability,
  ];

  const primaryScores = useMemo(() => getRadarScores(primaryCountry), [primaryCountry]);
  const compareScores = useMemo(() => getRadarScores(compareCountry), [compareCountry]);

  // SVG Radar Geometry
  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 110;

  const getPolygonPoints = (scores: number[]) => {
    return scores
      .map((val, idx) => {
        const angle = (Math.PI * 2 * idx) / scores.length - Math.PI / 2;
        const r = (val / 100) * radius;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  // Simulator Calculations
  const projectedAqi = useMemo(() => {
    const reductionFactor =
      (renewableBoost * 0.16 + reforestationBoost * 0.12 + emissionCut * 0.34) / 100;
    return Math.max(10, Math.round(primaryCountry.aqi * (1 - reductionFactor)));
  }, [primaryCountry.aqi, renewableBoost, reforestationBoost, emissionCut]);

  const projectedCo2 = useMemo(() => {
    const reductionFactor =
      (renewableBoost * 0.25 + reforestationBoost * 0.08 + emissionCut * 0.42) / 100;
    return Math.max(0.2, Number((primaryCountry.co2PerCapita * (1 - reductionFactor)).toFixed(1)));
  }, [primaryCountry.co2PerCapita, renewableBoost, reforestationBoost, emissionCut]);

  const projectedTempMitigation = useMemo(() => {
    const delta =
      (renewableBoost * 0.0018 + reforestationBoost * 0.0022 + emissionCut * 0.0024);
    return Number((primaryCountry.tempAnomalyC - delta).toFixed(2));
  }, [primaryCountry.tempAnomalyC, renewableBoost, reforestationBoost, emissionCut]);

  const handleNumericChange = (
    rawValue: string,
    setter: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    const parsed = Number(rawValue);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
      setValidationError(t.analysisView.validationErrorRange);
      return;
    }
    setValidationError(null);
    setter(Math.round(parsed));
  };

  const resetSimulation = () => {
    setRenewableBoost(25);
    setReforestationBoost(15);
    setEmissionCut(20);
    setValidationError(null);
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between dark:border-slate-800">
        <div className="max-w-3xl space-y-2">
          <p className="text-xs font-semibold tracking-wide text-teal-700 dark:text-teal-400">
            {t.analysisView.eyebrow}
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white text-balance">
            {t.analysisView.title}
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
            {t.analysisView.subtitle}
          </p>
        </div>

        {/* Country Selectors */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div>
            <label
              htmlFor="analysis-primary-country"
              className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1"
            >
              {t.analysisView.primaryCountryLabel}
            </label>
            <select
              id="analysis-primary-country"
              value={primaryCountry.id}
              onChange={(e) => onSelectCountry(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {ALL_WORLD_COUNTRIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name[language]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="analysis-compare-country"
              className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1"
            >
              {t.analysisView.comparisonCountryLabel}
            </label>
            <select
              id="analysis-compare-country"
              value={compareCountry.id}
              onChange={(e) => setCompareCountryId(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {ALL_WORLD_COUNTRIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name[language]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Radar Chart + Regional Diagnostics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Radar Chart Card */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              {t.analysisView.radarTitle}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t.analysisView.radarSubtitle}
            </p>
          </div>

          <div className="my-4 flex items-center justify-center">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[330px] h-auto overflow-visible">
              {/* Concentric rings */}
              {[25, 50, 75, 100].map((level) => (
                <polygon
                  key={level}
                  points={getPolygonPoints(new Array(6).fill(level))}
                  fill="none"
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeWidth={1}
                />
              ))}

              {/* Radial axis lines + labels */}
              {radarAxes.map((label, idx) => {
                const angle = (Math.PI * 2 * idx) / 6 - Math.PI / 2;
                const x2 = cx + radius * Math.cos(angle);
                const y2 = cy + radius * Math.sin(angle);
                const lx = cx + (radius + 22) * Math.cos(angle);
                const ly = cy + (radius + 22) * Math.sin(angle);
                const anchor =
                  Math.abs(Math.cos(angle)) < 0.15
                    ? 'middle'
                    : Math.cos(angle) > 0
                      ? 'start'
                      : 'end';

                return (
                  <g key={label}>
                    <line
                      x1={cx}
                      y1={cy}
                      x2={x2}
                      y2={y2}
                      className="stroke-slate-200 dark:stroke-slate-800"
                      strokeWidth={1}
                    />
                    <text
                      x={lx}
                      y={ly + 3}
                      textAnchor={anchor}
                      className="fill-slate-600 dark:fill-slate-300 text-[10px] font-medium"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}

              {/* Global Benchmark */}
              <polygon
                points={getPolygonPoints(GLOBAL_BENCHMARK_SCORES)}
                fill="none"
                stroke="#94a3b8"
                strokeWidth={1.4}
                strokeDasharray="4 3"
              />

              {/* Comparison Country */}
              <polygon
                points={getPolygonPoints(compareScores)}
                fill="rgba(217, 119, 6, 0.16)"
                stroke="#d97706"
                strokeWidth={1.8}
              />

              {/* Primary Country */}
              <polygon
                points={getPolygonPoints(primaryScores)}
                fill="rgba(13, 148, 136, 0.22)"
                stroke="#0d9488"
                strokeWidth={2.2}
              />
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
            <span className="inline-flex items-center gap-1.5 font-medium text-teal-700 dark:text-teal-400">
              <span className="h-2.5 w-2.5 rounded-xs bg-teal-600 inline-block" />
              {primaryCountry.name[language]}
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-amber-700 dark:text-amber-400">
              <span className="h-2.5 w-2.5 rounded-xs bg-amber-600 inline-block" />
              {compareCountry.name[language]}
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="h-0.5 w-4 border-t-2 border-dashed border-slate-400 inline-block" />
              {t.analysisView.globalBenchmark}
            </span>
          </div>
        </div>

        {/* Regional Ecological Diagnostics */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  {t.analysisView.diagnosticsTitle}: {primaryCountry.name[language]}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {t.regions[primaryCountry.region]} · {primaryCountry.climateZone[language]}
                </p>
              </div>
              <div className="flex gap-4 font-mono text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">{t.indicators.waterQuality.short}: </span>
                  <span className="font-bold text-slate-900 dark:text-white">{primaryCountry.waterQualityScore}/100</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">{t.indicators.biodiversity.short}: </span>
                  <span className="font-bold text-slate-900 dark:text-white">{primaryCountry.biodiversityScore}/100</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{t.analysisView.strengthsHeading}</span>
                </div>
                <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {primaryCountry.analysis.strengths[language].map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400" aria-hidden="true">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{t.analysisView.risksHeading}</span>
                </div>
                <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {primaryCountry.analysis.risks[language].map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-amber-600 dark:text-amber-400" aria-hidden="true">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                {t.analysisView.recommendationsHeading}
              </h3>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {primaryCountry.analysis.recommendations[language].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-mono text-teal-700 dark:text-teal-400">0{i + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-teal-50/70 p-3.5 text-xs text-teal-950 dark:bg-teal-950/40 dark:text-teal-200">
            <TrendingUp className="mt-0.5 h-4 w-4 text-teal-700 dark:text-teal-400 shrink-0" aria-hidden="true" />
            <div>
              <span className="font-semibold">{t.analysisView.trajectoryHeading}: </span>
              <span>{primaryCountry.analysis.outlook2030[language]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Scenario Simulator */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              {t.analysisView.simulatorTitle} — {primaryCountry.name[language]}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t.analysisView.simulatorSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={resetSimulation}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t.analysisView.resetSimulation}</span>
          </button>
        </div>

        {validationError && (
          <div
            role="alert"
            className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-200"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-5">
            {[
              {
                id: 'sim-renewable',
                label: t.analysisView.sliderRenewable,
                value: renewableBoost,
                setter: setRenewableBoost,
              },
              {
                id: 'sim-reforest',
                label: t.analysisView.sliderReforestation,
                value: reforestationBoost,
                setter: setReforestationBoost,
              },
              {
                id: 'sim-emissions',
                label: t.analysisView.sliderEmissionCut,
                value: emissionCut,
                setter: setEmissionCut,
              },
            ].map((ctrl) => (
              <div key={ctrl.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor={ctrl.id}
                    className="text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    {ctrl.label}
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={ctrl.value}
                      onChange={(e) => handleNumericChange(e.target.value, ctrl.setter)}
                      aria-label={ctrl.label}
                      className="w-16 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-right font-mono text-xs font-semibold text-slate-900 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                    <span className="font-mono text-xs text-slate-500">%</span>
                  </div>
                </div>
                <input
                  id={ctrl.id}
                  type="range"
                  min={0}
                  max={100}
                  value={ctrl.value}
                  onChange={(e) => {
                    setValidationError(null);
                    ctrl.setter(Number(e.target.value));
                  }}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-teal-700 dark:bg-slate-800 dark:accent-teal-400"
                />
              </div>
            ))}
          </div>

          {/* Projected Outputs */}
          <div className="lg:col-span-5 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-950">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {t.analysisView.projectedAqi}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {t.analysisView.baselineLabel}: {primaryCountry.aqi}
                </div>
              </div>
              <div className="font-mono text-xl font-bold text-teal-700 dark:text-teal-400">
                {projectedAqi}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-950">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {t.analysisView.projectedCo2}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {t.analysisView.baselineLabel}: {formatCo2(primaryCountry.co2PerCapita)}
                </div>
              </div>
              <div className="font-mono text-xl font-bold text-emerald-700 dark:text-emerald-400">
                {formatCo2(projectedCo2)}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-950">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {t.analysisView.projectedTemp}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {t.analysisView.baselineLabel}: {formatTempAnomaly(primaryCountry.tempAnomalyC)}
                </div>
              </div>
              <div className="font-mono text-xl font-bold text-amber-700 dark:text-amber-400">
                {formatTempAnomaly(projectedTempMitigation)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
