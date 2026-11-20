import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { geoGraticule10, geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import countries50m from 'world-atlas/countries-50m.json';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Compass,
  Crosshair,
  Hexagon,
  Layers,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  ZoomIn,
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { MapLayer, PageView, RegionId } from '../i18n/types';
import {
  CityRecord,
  CountryRecord,
  getCityLayerColor,
  getCountryLayerColor,
  getStatusFromAqi,
} from '../data/geoData';
import {
  ALL_WORLD_COUNTRIES,
  getWorldCountryById,
  getWorldCountryByNumericId,
  synthesizeTerritoryProfile,
} from '../data/worldCountriesRegistry';
import { getLocalizedWorldCountryName } from '../data/worldCountryNames';
import {
  CityBoundaryZone,
  computeCityVoronoiZones,
  computeFeatureZoomTransform,
} from '../utils/mapGeometry';
import { StatusLabel } from './StatusLabel';

interface WorldMapViewProps {
  selectedCountryId: string;
  selectedCityId: string | null;
  onSelectCountry: (countryId: string) => void;
  onSelectCity: (countryId: string, cityId: string) => void;
  onNavigate: (page: PageView) => void;
}

const SVG_WIDTH = 960;
const SVG_HEIGHT = 500;
const MIN_ZOOM = 1;
const MAX_ZOOM = 12;

export const WorldMapView: React.FC<WorldMapViewProps> = ({
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
    formatTempAnomaly,
    formatArea,
    formatElevation,
    formatCo2,
  } = useI18n();

  const [activeLayer, setActiveLayer] = useState<MapLayer>('aqi');
  const [regionFilter, setRegionFilter] = useState<RegionId>('all');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [showCityBoundaries, setShowCityBoundaries] = useState(true);
  const [autoZoomOnSelect, setAutoZoomOnSelect] = useState(false);

  const dragStartRef = useRef<{
    x: number;
    y: number;
    panX: number;
    panY: number;
    moved: boolean;
  } | null>(null);
  const pinchRef = useRef<{ dist: number; zoom: number; panX: number; panY: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const zoomStateRef = useRef({ zoom: 1, panX: 0, panY: 0 });

  useEffect(() => {
    zoomStateRef.current = { zoom, panX: pan.x, panY: pan.y };
  }, [zoom, pan]);

  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [hoveredItem, setHoveredItem] = useState<{
    title: string;
    subtitle?: string;
    metricText?: string;
    colorHex?: string;
    status?: 'good' | 'moderate' | 'critical';
    x: number;
    y: number;
  } | null>(null);

  const worldGeo = useMemo(() => {
    const topo = countries50m as unknown as Parameters<typeof feature>[0] & {
      objects: { countries: Parameters<typeof feature>[1] };
    };
    return feature(topo, topo.objects.countries) as unknown as FeatureCollection<
      Geometry,
      { name?: string }
    >;
  }, []);

  const projection = useMemo(() => {
    return geoNaturalEarth1().scale(178).translate([SVG_WIDTH / 2, SVG_HEIGHT / 2 + 12]);
  }, []);

  const pathGenerator = useMemo(() => geoPath(projection), [projection]);
  const graticulePath = useMemo(() => pathGenerator(geoGraticule10()) ?? '', [pathGenerator]);
  const spherePath = useMemo(() => pathGenerator({ type: 'Sphere' }) ?? '', [pathGenerator]);

  // Precompute GeoJSON paths & primary feature per numeric ID (largest bounding area wins for multi-feature territories)
  const { renderedFeatures, featureByNumericId, territoryProfilesByNumericId } = useMemo(() => {
    const primaryMap = new Map<
      string,
      { feat: Feature<Geometry, { name?: string }>; areaScore: number }
    >();
    const rendered: {
      key: string;
      rawId: string;
      feat: Feature<Geometry, { name?: string }>;
      d: string;
    }[] = [];
    const profileMap = new Map<string, CountryRecord>();

    worldGeo.features.forEach((feat, idx) => {
      const d = pathGenerator(feat) ?? '';
      if (!d) return;
      const rawId = feat.id !== undefined ? String(feat.id).padStart(3, '0') : `anon-${idx}`;
      rendered.push({ key: `${rawId}-${idx}`, rawId, feat, d });

      const [[x0, y0], [x1, y1]] = pathGenerator.bounds(feat);
      const areaScore = Math.max(0, (x1 - x0) * (y1 - y0));
      const existing = primaryMap.get(rawId);
      if (!existing || areaScore > existing.areaScore) {
        primaryMap.set(rawId, { feat, areaScore });
      }
    });

    const cleanFeatureMap = new Map<string, Feature<Geometry, { name?: string }>>();
    for (const [rawId, entry] of primaryMap.entries()) {
      cleanFeatureMap.set(rawId, entry.feat);
      const registered = getWorldCountryByNumericId(rawId);
      if (registered) {
        profileMap.set(rawId, registered);
      } else {
        const centroidPx = pathGenerator.centroid(entry.feat);
        const lonLat =
          Number.isFinite(centroidPx[0]) && Number.isFinite(centroidPx[1])
            ? projection.invert?.(centroidPx)
            : null;
        const safeLonLat: [number, number] =
          lonLat && Number.isFinite(lonLat[0]) && Number.isFinite(lonLat[1])
            ? [lonLat[0], lonLat[1]]
            : [0, 20];
        const fallbackEn = entry.feat.properties?.name ?? rawId;
        profileMap.set(
          rawId,
          synthesizeTerritoryProfile(
            rawId,
            {
              uz: getLocalizedWorldCountryName(rawId, fallbackEn, 'uz'),
              ru: getLocalizedWorldCountryName(rawId, fallbackEn, 'ru'),
              tr: getLocalizedWorldCountryName(rawId, fallbackEn, 'tr'),
              en: getLocalizedWorldCountryName(rawId, fallbackEn, 'en'),
            },
            safeLonLat,
          ),
        );
      }
    }

    return {
      renderedFeatures: rendered,
      featureByNumericId: cleanFeatureMap,
      territoryProfilesByNumericId: profileMap,
    };
  }, [worldGeo, pathGenerator, projection]);

  const selectedCountry = useMemo(() => {
    const direct = getWorldCountryById(selectedCountryId);
    if (direct) return direct;
    if (selectedCountryId.startsWith('geo-')) {
      const numeric = selectedCountryId.slice(4);
      const synth = territoryProfilesByNumericId.get(numeric);
      if (synth) return synth;
    }
    return ALL_WORLD_COUNTRIES[0];
  }, [selectedCountryId, territoryProfilesByNumericId]);

  const activeCity = useMemo(() => {
    if (!selectedCountry) return null;
    return (
      selectedCountry.cities.find((city) => city.id === selectedCityId) ?? selectedCountry.cities[0]
    );
  }, [selectedCountry, selectedCityId]);

  const clampPan = useCallback((nextZoom: number, nextX: number, nextY: number) => {
    const maxOffsetX = ((nextZoom - 1) * SVG_WIDTH) / 2 + 40;
    const maxOffsetY = ((nextZoom - 1) * SVG_HEIGHT) / 2 + 30;
    return {
      x: Math.max(-maxOffsetX, Math.min(maxOffsetX, nextX)),
      y: Math.max(-maxOffsetY, Math.min(maxOffsetY, nextY)),
    };
  }, []);

  const focusCountryOnMap = useCallback(
    (country: CountryRecord) => {
      const feat = featureByNumericId.get(country.numericId);
      if (!feat) return;
      const primaryCity = country.cities[0];
      const fallbackLonLat: [number, number] | undefined = primaryCity
        ? [primaryCity.lon, primaryCity.lat]
        : undefined;
      const { zoom: targetZoom, panX, panY } = computeFeatureZoomTransform(
        feat,
        pathGenerator,
        projection,
        SVG_WIDTH,
        SVG_HEIGHT,
        fallbackLonLat,
      );
      setIsInteracting(false);
      setZoom(targetZoom);
      setPan(clampPan(targetZoom, panX, panY));
    },
    [featureByNumericId, pathGenerator, projection, clampPan],
  );

  // Smooth cursor-anchored zoom helper
  const applyAnchoredZoom = useCallback(
    (nextZoomRaw: number, clientX?: number, clientY?: number, smoothTransition = false) => {
      const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number(nextZoomRaw.toFixed(2))));
      const prev = zoomStateRef.current;
      setIsInteracting(!smoothTransition);

      if (nextZoom <= 1.01) {
        setZoom(1);
        setPan({ x: 0, y: 0 });
        return;
      }

      if (clientX !== undefined && clientY !== undefined && svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const svgX = ((clientX - rect.left) / rect.width) * SVG_WIDTH;
        const svgY = ((clientY - rect.top) / rect.height) * SVG_HEIGHT;
        const dxCenter = svgX - SVG_WIDTH / 2;
        const dyCenter = svgY - SVG_HEIGHT / 2;
        const ratio = nextZoom / prev.zoom;
        const nextPanX = dxCenter - (dxCenter - prev.panX) * ratio;
        const nextPanY = dyCenter - (dyCenter - prev.panY) * ratio;
        setZoom(nextZoom);
        setPan(clampPan(nextZoom, nextPanX, nextPanY));
      } else {
        const ratio = nextZoom / prev.zoom;
        setZoom(nextZoom);
        setPan(clampPan(nextZoom, prev.panX * ratio, prev.panY * ratio));
      }
    },
    [clampPan],
  );

  // Non-passive native wheel listener so wheel zoom is buttery smooth and never scrolls page
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { zoom: currentZoom } = zoomStateRef.current;
      const factor = e.ctrlKey
        ? Math.exp(-e.deltaY * 0.012)
        : Math.exp(-e.deltaY * 0.0022);
      const nextZoom = currentZoom * factor;
      applyAnchoredZoom(nextZoom, e.clientX, e.clientY, false);
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [applyAnchoredZoom]);

  const handleZoomIn = () => {
    applyAnchoredZoom(zoom * 1.45, undefined, undefined, true);
  };

  const handleZoomOut = () => {
    applyAnchoredZoom(zoom / 1.45, undefined, undefined, true);
  };

  const handleResetView = () => {
    setIsInteracting(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseMoveSvg = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * SVG_WIDTH;
    const relY = ((e.clientY - rect.top) / rect.height) * SVG_HEIGHT;

    if (dragStartRef.current) {
      const dx = ((e.clientX - dragStartRef.current.x) / rect.width) * SVG_WIDTH;
      const dy = ((e.clientY - dragStartRef.current.y) / rect.height) * SVG_HEIGHT;
      if (Math.hypot(dx, dy) > 2) {
        dragStartRef.current.moved = true;
      }
      setPan(clampPan(zoom, dragStartRef.current.panX + dx, dragStartRef.current.panY + dy));
    }

    const unzoomedX = (relX - SVG_WIDTH / 2 - pan.x) / zoom + SVG_WIDTH / 2;
    const unzoomedY = (relY - SVG_HEIGHT / 2 - pan.y) / zoom + SVG_HEIGHT / 2;
    const inverted = projection.invert?.([unzoomedX, unzoomedY]);
    if (inverted && Number.isFinite(inverted[0]) && Number.isFinite(inverted[1])) {
      if (Math.abs(inverted[0]) <= 180 && Math.abs(inverted[1]) <= 90) {
        setCursorCoords({ lon: inverted[0], lat: inverted[1] });
      }
    }
  };

  const handleMouseDownSvg = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0 || zoom <= 1) return;
    setIsInteracting(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
      moved: false,
    };
  };

  const handleMouseUpSvg = () => {
    setIsInteracting(false);
    dragStartRef.current = null;
  };

  // Touch pan & two-finger pinch zoom
  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1 && zoom > 1) {
      setIsInteracting(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        panX: pan.x,
        panY: pan.y,
        moved: false,
      };
    } else if (e.touches.length === 2) {
      setIsInteracting(true);
      dragStartRef.current = null;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = {
        dist: Math.hypot(dx, dy),
        zoom,
        panX: pan.x,
        panY: pan.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();

    if (e.touches.length === 1 && dragStartRef.current) {
      const dx = ((e.touches[0].clientX - dragStartRef.current.x) / rect.width) * SVG_WIDTH;
      const dy = ((e.touches[0].clientY - dragStartRef.current.y) / rect.height) * SVG_HEIGHT;
      setPan(clampPan(zoom, dragStartRef.current.panX + dx, dragStartRef.current.panY + dy));
    } else if (e.touches.length === 2 && pinchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const scaleFactor = dist / Math.max(10, pinchRef.current.dist);
      applyAnchoredZoom(pinchRef.current.zoom * scaleFactor, midX, midY, false);
    }
  };

  const handleTouchEnd = () => {
    setIsInteracting(false);
    dragStartRef.current = null;
    pinchRef.current = null;
  };

  // Compute Voronoi city boundary zones clipped to national borders for selected country & nearby zoomed countries
  const countryCityBoundaries = useMemo(() => {
    if (!showCityBoundaries) return [];

    const targets: CountryRecord[] = [selectedCountry];
    if (zoom >= 2.1) {
      for (const c of ALL_WORLD_COUNTRIES) {
        if (c.id === selectedCountry.id) continue;
        if (regionFilter !== 'all' && c.region !== regionFilter) continue;
        if (c.cities.length >= 2) {
          targets.push(c);
        }
      }
    }

    return targets
      .map((country) => {
        const feat = featureByNumericId.get(country.numericId);
        if (!feat) return null;
        const bounds = pathGenerator.bounds(feat);
        const seeds = country.cities
          .map((city) => {
            const p = projection([city.lon, city.lat]);
            if (!p) return null;
            return {
              id: city.id,
              x: p[0],
              y: p[1],
              populationMillions: city.populationMillions,
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);

        if (seeds.length === 0) return null;

        const zones: CityBoundaryZone[] = computeCityVoronoiZones(seeds, bounds);
        const cityById = new Map<string, CityRecord>(country.cities.map((c) => [c.id, c]));
        // Collect all polygon paths matching this country's numericId so archipelagos/mainland clip cleanly
        const countryPaths = renderedFeatures
          .filter((rf) => rf.rawId === country.numericId)
          .map((rf) => rf.d);

        return {
          country,
          countryPaths,
          zones: zones
            .map((zone) => {
              const city = cityById.get(zone.cityId);
              return city ? { ...zone, city } : null;
            })
            .filter((item): item is NonNullable<typeof item> => item !== null),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [
    showCityBoundaries,
    selectedCountry,
    zoom,
    regionFilter,
    featureByNumericId,
    pathGenerator,
    projection,
    renderedFeatures,
  ]);

  const visibleCities = useMemo(() => {
    const baseCountries = ALL_WORLD_COUNTRIES.filter(
      (c) => regionFilter === 'all' || c.region === regionFilter,
    );
    const list = baseCountries.flatMap((country) =>
      country.cities.map((city) => ({
        country,
        city,
        projected: projection([city.lon, city.lat]),
      })),
    );
    // Ensure selected synthesized micro-state city also renders cleanly
    if (selectedCountry.id.startsWith('geo-')) {
      for (const city of selectedCountry.cities) {
        list.push({
          country: selectedCountry,
          city,
          projected: projection([city.lon, city.lat]),
        });
      }
    }
    return list;
  }, [regionFilter, projection, selectedCountry]);

  const formatMetricForCountryLayer = (country: CountryRecord, layer: MapLayer): string => {
    switch (layer) {
      case 'aqi':
        return `${country.aqi} ${t.indicators.aqi.short}`;
      case 'co2':
        return formatCo2(country.co2PerCapita);
      case 'forest':
        return `${formatNumber(country.forestCoverPct, 1)}%`;
      case 'renewable':
        return `${formatNumber(country.renewablePct, 1)}%`;
      case 'temp':
        return formatTempAnomaly(country.tempAnomalyC);
    }
  };

  const formatMetricForCityLayer = (city: CityRecord, layer: MapLayer): string => {
    switch (layer) {
      case 'aqi':
        return `${city.aqi} ${t.indicators.aqi.short}`;
      case 'co2':
        return formatCo2(city.co2PerCapita);
      case 'forest':
        return `${formatNumber(city.greenSpacePct, 0)}% ${t.mapView.greenSpaceLabel}`;
      case 'renewable':
        return `${formatNumber(city.renewablePct, 1)}%`;
      case 'temp':
        return formatTempAnomaly(city.tempAnomalyC);
    }
  };

  const layerOptions: { id: MapLayer; label: string }[] = [
    { id: 'aqi', label: t.indicators.aqi.short },
    { id: 'co2', label: t.indicators.co2.short },
    { id: 'forest', label: t.indicators.forest.short },
    { id: 'renewable', label: t.indicators.renewable.short },
    { id: 'temp', label: t.indicators.tempAnomaly.short },
  ];

  const regionOptions: RegionId[] = [
    'all',
    'central_asia',
    'europe',
    'asia_pacific',
    'americas',
    'mea',
  ];

  const legendPalette: Record<MapLayer, string[]> = {
    aqi: ['#0d9488', '#14b8a6', '#d97706', '#dc2626'],
    co2: ['#0d9488', '#0284c7', '#d97706', '#dc2626'],
    forest: ['#ca8a04', '#65a30d', '#16a34a', '#15803d'],
    renewable: ['#64748b', '#0284c7', '#0d9488', '#0f766e'],
    temp: ['#0284c7', '#d97706', '#ea580c', '#dc2626'],
  };

  const showSelectedCityLabels = zoom >= 1.5;

  return (
    <section className="space-y-6">
      {/* Observatory Header & Global KPI Strip */}
      <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="max-w-3xl space-y-2">
          <p className="text-xs font-semibold tracking-wide text-teal-700 dark:text-teal-400">
            {t.mapView.eyebrow}
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white text-balance">
            {t.mapView.title}
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
            {t.mapView.subtitle}
          </p>
        </div>

        {/* 4-column Global KPI Strip */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.mapView.kpiGlobalTemp}
            </div>
            <div className="mt-1.5 font-mono text-2xl font-bold text-amber-700 dark:text-amber-400">
              {formatTempAnomaly(1.28)}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t.common.sourceNote}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.mapView.kpiGlobalAqi}
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
                46
              </span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {t.indicators.aqi.unit}
              </span>
            </div>
            <div className="mt-1">
              <StatusLabel status="good" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.mapView.kpiForestCover}
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {formatNumber(31.1, 1)}%
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t.indicators.forest.short}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.mapView.kpiRenewableShare}
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-teal-700 dark:text-teal-400">
                {formatNumber(30.4, 1)}%
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t.indicators.renewable.short}
            </div>
          </div>
        </div>
      </div>

      {/* Controls Toolbar: Layers + Region Filter */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mr-1">
            <Layers className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" aria-hidden="true" />
            <span>{t.mapView.layerLabel}:</span>
          </span>
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-950">
            {layerOptions.map((opt) => {
              const active = activeLayer === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setActiveLayer(opt.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mr-1">
            {t.mapView.regionFilterLabel}:
          </span>
          {regionOptions.map((reg) => {
            const active = regionFilter === reg;
            return (
              <button
                key={reg}
                type="button"
                onClick={() => setRegionFilter(reg)}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  active
                    ? 'border-teal-700 bg-teal-700 text-white dark:border-teal-500 dark:bg-teal-500 dark:text-slate-950'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {t.regions[reg]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Split: World Map Stage + Country/City Inspector */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Map Stage */}
        <div className="relative lg:col-span-7 flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {/* Top Map Controls Header */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-200 px-4 py-2.5 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" aria-hidden="true" />
                <span className="hidden sm:inline">{t.mapView.cursorCoordinates}:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {cursorCoords
                    ? `${cursorCoords.lat.toFixed(2)}°, ${cursorCoords.lon.toFixed(2)}°`
                    : '—'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowCityBoundaries((prev) => !prev)}
                aria-pressed={showCityBoundaries}
                className={`inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-[11px] font-medium transition-colors whitespace-nowrap ${
                  showCityBoundaries
                    ? 'border-teal-600/40 bg-teal-50 text-teal-800 dark:border-teal-500/40 dark:bg-teal-950/60 dark:text-teal-300'
                    : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                <Hexagon className="h-3 w-3" aria-hidden="true" />
                <span>{t.mapView.cityBoundariesLabel}</span>
              </button>

              <button
                type="button"
                onClick={() => setAutoZoomOnSelect((prev) => !prev)}
                aria-pressed={autoZoomOnSelect}
                className={`inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-[11px] font-medium transition-colors whitespace-nowrap ${
                  autoZoomOnSelect
                    ? 'border-teal-600/40 bg-teal-50 text-teal-800 dark:border-teal-500/40 dark:bg-teal-950/60 dark:text-teal-300'
                    : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                <ZoomIn className="h-3 w-3" aria-hidden="true" />
                <span>{t.mapView.autoZoomLabel}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => focusCountryOnMap(selectedCountry)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-teal-600/30 bg-teal-50 px-2.5 text-xs font-semibold text-teal-800 hover:bg-teal-100 dark:border-teal-500/30 dark:bg-teal-950/60 dark:text-teal-300 dark:hover:bg-teal-900/60 whitespace-nowrap"
              >
                <Crosshair className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.mapView.zoomToCountry}</span>
              </button>

              <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  aria-label={t.mapView.zoomOut}
                  title={t.mapView.zoomOut}
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-700 hover:bg-slate-200/70 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <input
                  type="range"
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={0.1}
                  value={zoom}
                  aria-label={t.mapView.zoomSliderLabel}
                  onChange={(e) => applyAnchoredZoom(Number(e.target.value), undefined, undefined, false)}
                  className="hidden sm:block h-1.5 w-20 accent-teal-700 dark:accent-teal-400 cursor-pointer"
                />
                <span className="min-w-[38px] text-center font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                  {zoom.toFixed(1)}×
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  aria-label={t.mapView.zoomIn}
                  title={t.mapView.zoomIn}
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-700 hover:bg-slate-200/70 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetView}
                aria-label={t.mapView.resetView}
                title={t.mapView.resetView}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{t.mapView.resetView}</span>
              </button>
            </div>
          </div>

          {/* Interactive 50m Vector World Map */}
          <div
            ref={viewportRef}
            className="relative flex-1 bg-slate-50 dark:bg-slate-950 select-none min-h-[440px] touch-none"
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              onMouseMove={handleMouseMoveSvg}
              onMouseDown={handleMouseDownSvg}
              onMouseUp={handleMouseUpSvg}
              onMouseLeave={() => {
                handleMouseUpSvg();
                setHoveredItem(null);
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`h-full w-full ${zoom > 1 ? (isInteracting ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'}`}
              role="img"
              aria-label={t.mapView.title}
            >
              {/* Country ClipPaths for Exact Border-Aligned City Territorial Subdivision */}
              <defs>
                {countryCityBoundaries.map(({ country, countryPaths }) => (
                  <clipPath key={`clip-${country.numericId}`} id={`country-clip-${country.numericId}`}>
                    {countryPaths.map((d, i) => (
                      <path key={i} d={d} />
                    ))}
                  </clipPath>
                ))}
              </defs>

              <g
                style={{
                  transition: isInteracting
                    ? 'none'
                    : 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                transform={`translate(${SVG_WIDTH / 2 + pan.x}, ${SVG_HEIGHT / 2 + pan.y}) scale(${zoom}) translate(${-SVG_WIDTH / 2}, ${-SVG_HEIGHT / 2})`}
              >
                {/* Ocean sphere */}
                <path
                  d={spherePath}
                  className="fill-sky-50/75 stroke-slate-200 dark:fill-slate-900 dark:stroke-slate-800"
                  strokeWidth={1 / zoom}
                />
                {/* Graticule grid */}
                <path
                  d={graticulePath}
                  fill="none"
                  className="stroke-slate-200/65 dark:stroke-slate-800/75"
                  strokeWidth={0.55 / zoom}
                />

                {/* High-Res Country Polygons */}
                {renderedFeatures.map(({ key, rawId, feat, d }) => {
                  const profile = territoryProfilesByNumericId.get(rawId);
                  if (!profile) return null;

                  const isSelected = profile.id === selectedCountry.id;
                  const matchesRegion =
                    regionFilter === 'all' || profile.region === regionFilter;

                  const fill = getCountryLayerColor(profile, activeLayer);
                  const fillOpacity = matchesRegion
                    ? isSelected && showCityBoundaries
                      ? 0.28
                      : isSelected
                        ? 0.88
                        : 0.74
                    : 0.16;

                  return (
                    <path
                      key={key}
                      d={d}
                      fill={fill}
                      fillOpacity={fillOpacity}
                      className="transition-opacity duration-150 stroke-white dark:stroke-slate-950 cursor-pointer"
                      strokeWidth={isSelected ? 1.6 / zoom : 0.45 / zoom}
                      onMouseEnter={(e) => {
                        const rect = svgRef.current?.getBoundingClientRect();
                        if (!rect) return;
                        setHoveredItem({
                          title: profile.name[language],
                          metricText: formatMetricForCountryLayer(profile, activeLayer),
                          colorHex: fill,
                          status: getStatusFromAqi(profile.aqi, aqiThreshold),
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                        });
                      }}
                      onMouseMove={(e) => {
                        const rect = svgRef.current?.getBoundingClientRect();
                        if (!rect) return;
                        setHoveredItem((prev) =>
                          prev
                            ? {
                                ...prev,
                                x: e.clientX - rect.left,
                                y: e.clientY - rect.top,
                              }
                            : null,
                        );
                      }}
                      onClick={() => {
                        if (dragStartRef.current?.moved) return;
                        onSelectCountry(profile.id);
                        if (autoZoomOnSelect) {
                          focusCountryOnMap(profile);
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        onSelectCountry(profile.id);
                        focusCountryOnMap(profile);
                      }}
                    />
                  );
                })}

                {/* Detailed Clipped City Boundaries & Metropolitan Zones */}
                {countryCityBoundaries.map(({ country, zones }) => {
                  const isCountrySelected = country.id === selectedCountry.id;
                  return (
                    <g
                      key={`city-bounds-${country.numericId}`}
                      clipPath={`url(#country-clip-${country.numericId})`}
                    >
                      {zones.map((zone) => {
                        const cityColor = getCityLayerColor(zone.city, activeLayer);
                        const isZoneActive =
                          isCountrySelected && activeCity?.id === zone.city.id;
                        return (
                          <g
                            key={`zone-${zone.city.id}`}
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (dragStartRef.current?.moved) return;
                              onSelectCity(country.id, zone.city.id);
                            }}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              onSelectCity(country.id, zone.city.id);
                              focusCountryOnMap(country);
                            }}
                            onMouseEnter={(e) => {
                              e.stopPropagation();
                              const rect = svgRef.current?.getBoundingClientRect();
                              if (!rect) return;
                              setHoveredItem({
                                title: `${zone.city.name[language]} (${t.mapView.cityZoneSuffix})`,
                                subtitle: country.name[language],
                                metricText: formatMetricForCityLayer(zone.city, activeLayer),
                                colorHex: cityColor,
                                status: getStatusFromAqi(zone.city.aqi, aqiThreshold),
                                x: e.clientX - rect.left,
                                y: e.clientY - rect.top,
                              });
                            }}
                            onMouseMove={(e) => {
                              const rect = svgRef.current?.getBoundingClientRect();
                              if (!rect) return;
                              setHoveredItem((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      x: e.clientX - rect.left,
                                      y: e.clientY - rect.top,
                                    }
                                  : null,
                              );
                            }}
                          >
                            {/* City Territory Polygon colored by active layer */}
                            <polygon
                              points={zone.pointsAttr}
                              fill={cityColor}
                              fillOpacity={isZoneActive ? 0.62 : isCountrySelected ? 0.42 : 0.34}
                              stroke="#ffffff"
                              strokeWidth={(isCountrySelected ? 1.35 : 0.85) / zoom}
                              strokeDasharray={`${3.2 / zoom} ${1.8 / zoom}`}
                              className="transition-opacity duration-150 hover:opacity-90"
                            />

                            {/* Metropolitan Urban Footprint Boundary inside Territory */}
                            <path
                              d={zone.metroRingPath}
                              fill={cityColor}
                              fillOpacity={isZoneActive ? 0.34 : 0.18}
                              stroke={isZoneActive ? '#0f172a' : '#ffffff'}
                              strokeOpacity={0.85}
                              strokeWidth={(isZoneActive ? 1.3 : 0.85) / zoom}
                              strokeDasharray={`${2 / zoom} ${1.5 / zoom}`}
                            />
                          </g>
                        );
                      })}
                    </g>
                  );
                })}

                {/* Re-stroke selected country outer border crisply above city boundaries */}
                {(() => {
                  const selFeat = featureByNumericId.get(selectedCountry.numericId);
                  const selD = selFeat ? pathGenerator(selFeat) : null;
                  if (!selD) return null;
                  return (
                    <path
                      d={selD}
                      fill="none"
                      stroke="#0f172a"
                      strokeOpacity={0.7}
                      strokeWidth={2.0 / zoom}
                      className="pointer-events-none dark:stroke-white"
                    />
                  );
                })()}

                {/* Color-coded City Core Pins & Zoom Labels */}
                {visibleCities.map(({ country, city, projected }) => {
                  if (!projected) return null;
                  const [cx, cy] = projected;
                  const isSelectedCountry = country.id === selectedCountry.id;
                  const isActiveCity = isSelectedCountry && activeCity?.id === city.id;
                  const cityColor = getCityLayerColor(city, activeLayer);
                  const showLabel =
                    (showSelectedCityLabels && isSelectedCountry) || zoom >= 2.7;

                  // Keep pin legible across 1x - 12x zoom
                  const screenRadius = isSelectedCountry ? 4.8 : zoom >= 2.2 ? 3.5 : 2.3;
                  const pinR = (isActiveCity ? screenRadius + 1.5 : screenRadius) / zoom;

                  return (
                    <g
                      key={`${country.id}-${city.id}`}
                      transform={`translate(${cx}, ${cy})`}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (dragStartRef.current?.moved) return;
                        onSelectCity(country.id, city.id);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        onSelectCity(country.id, city.id);
                        focusCountryOnMap(country);
                      }}
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        const rect = svgRef.current?.getBoundingClientRect();
                        if (!rect) return;
                        setHoveredItem({
                          title: city.name[language],
                          subtitle: country.name[language],
                          metricText: formatMetricForCityLayer(city, activeLayer),
                          colorHex: cityColor,
                          status: getStatusFromAqi(city.aqi, aqiThreshold),
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                        });
                      }}
                    >
                      {isActiveCity && (
                        <circle
                          r={10.5 / zoom}
                          fill={cityColor}
                          fillOpacity={0.28}
                          stroke={cityColor}
                          strokeWidth={1.6 / zoom}
                        />
                      )}
                      <circle
                        r={pinR}
                        fill={cityColor}
                        stroke="#ffffff"
                        strokeWidth={1.4 / zoom}
                      />

                      {showLabel && (
                        <g transform={`translate(${7 / zoom}, ${-6 / zoom})`}>
                          <rect
                            x={0}
                            y={-9 / zoom}
                            width={(city.name[language].length * 5.6 + 38) / zoom}
                            height={15 / zoom}
                            rx={3 / zoom}
                            className="fill-white/95 stroke-slate-300 dark:fill-slate-900/95 dark:stroke-slate-700"
                            strokeWidth={0.8 / zoom}
                          />
                          <circle
                            cx={6 / zoom}
                            cy={-1.5 / zoom}
                            r={2.8 / zoom}
                            fill={cityColor}
                          />
                          <text
                            x={12 / zoom}
                            y={1.5 / zoom}
                            style={{ fontSize: `${8.5 / zoom}px` }}
                            className="fill-slate-900 dark:fill-white font-semibold"
                          >
                            {city.name[language]}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Hover Tooltip */}
            {hoveredItem && (
              <div
                style={{
                  left: Math.min(hoveredItem.x + 14, 480),
                  top: Math.max(hoveredItem.y - 14, 12),
                }}
                className="pointer-events-none absolute z-20 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-md backdrop-blur-xs dark:border-slate-700 dark:bg-slate-900/95"
              >
                <div className="flex items-center gap-2">
                  {hoveredItem.colorHex && (
                    <span
                      style={{ backgroundColor: hoveredItem.colorHex }}
                      className="h-2.5 w-2.5 rounded-full shrink-0 border border-white dark:border-slate-800"
                    />
                  )}
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    {hoveredItem.title}
                  </span>
                  {hoveredItem.subtitle && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      · {hoveredItem.subtitle}
                    </span>
                  )}
                </div>
                {hoveredItem.metricText ? (
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-mono font-semibold">{hoveredItem.metricText}</span>
                    {hoveredItem.status && (
                      <>
                        <span aria-hidden="true">·</span>
                        <StatusLabel status={hoveredItem.status} />
                      </>
                    )}
                  </div>
                ) : (
                  <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {t.common.noData}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Legend Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-4 py-2.5 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {layerOptions.find((l) => l.id === activeLayer)?.label}:
              </span>
              <span className="text-[11px]">{t.mapView.legendLow}</span>
              <div className="flex items-center gap-0.5">
                {legendPalette[activeLayer].map((hex) => (
                  <span
                    key={hex}
                    style={{ backgroundColor: hex }}
                    className="h-2.5 w-6 first:rounded-l-xs last:rounded-r-xs"
                  />
                ))}
              </div>
              <span className="text-[11px]">{t.mapView.legendHigh}</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.mapView.zoomCityColorHint}
            </span>
          </div>
        </div>

        {/* Country & City Intelligence Inspector */}
        <aside className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-5">
            {/* Country Header */}
            <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  {selectedCountry.iso2} · {t.regions[selectedCountry.region]}
                </span>
                <StatusLabel status={getStatusFromAqi(selectedCountry.aqi, aqiThreshold)} />
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  {selectedCountry.name[language]}
                </h2>
                <button
                  type="button"
                  onClick={() => focusCountryOnMap(selectedCountry)}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 whitespace-nowrap"
                >
                  <Crosshair className="h-3 w-3 text-teal-700 dark:text-teal-400" aria-hidden="true" />
                  <span>{t.mapView.zoomToCountry}</span>
                </button>
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t.common.capital}:{' '}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {selectedCountry.capital[language]}
                </span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                {t.common.population}:{' '}
                <span className="font-mono text-slate-700 dark:text-slate-200">
                  {formatNumber(selectedCountry.populationMillions, 1)}M
                </span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span className="font-mono">{formatArea(selectedCountry.areaKm2)}</span>
              </div>
            </div>

            {/* Country Key Environmental Metrics */}
            <div className="grid grid-cols-4 gap-2">
              <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-950">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.indicators.aqi.short}
                </div>
                <div className="mt-0.5 font-mono text-base font-bold text-slate-900 dark:text-white">
                  {selectedCountry.aqi}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-950">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.indicators.co2.short}
                </div>
                <div className="mt-0.5 font-mono text-sm font-bold text-slate-900 dark:text-white">
                  {formatCo2(selectedCountry.co2PerCapita)}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-950">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.indicators.forest.short}
                </div>
                <div className="mt-0.5 font-mono text-base font-bold text-emerald-700 dark:text-emerald-400">
                  {formatNumber(selectedCountry.forestCoverPct, 1)}%
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-950">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.indicators.renewable.short}
                </div>
                <div className="mt-0.5 font-mono text-base font-bold text-teal-700 dark:text-teal-400">
                  {formatNumber(selectedCountry.renewablePct, 1)}%
                </div>
              </div>
            </div>

            {/* Geographical & Environmental Overview */}
            <div className="space-y-2 text-xs leading-relaxed">
              <p className="text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {t.mapView.geographicalOverview}:{' '}
                </span>
                {selectedCountry.geoDescription[language]}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {t.mapView.environmentalSummary}:{' '}
                </span>
                {selectedCountry.envDescription[language]}
              </p>
            </div>

            {/* Monitored Cities with Live Map Colors & Boundaries + Strengths & Issues */}
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                  {t.mapView.monitoredCities} ({selectedCountry.cities.length})
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.mapView.cityColorLabel}
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {selectedCountry.cities.map((city) => {
                  const isCityActive = activeCity?.id === city.id;
                  const cityColor = getCityLayerColor(city, activeLayer);
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => onSelectCity(selectedCountry.id, city.id)}
                      className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        isCityActive
                          ? 'border-teal-700 bg-teal-50 text-teal-900 dark:border-teal-400 dark:bg-teal-950/60 dark:text-teal-200'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span
                        style={{ backgroundColor: cityColor }}
                        className="h-2.5 w-2.5 rounded-full shrink-0 border border-white dark:border-slate-900"
                        aria-hidden="true"
                      />
                      <span>{city.name[language]}</span>
                      <span className="font-mono text-[11px] opacity-80">
                        {formatMetricForCityLayer(city, activeLayer)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {activeCity && (
                <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        style={{ backgroundColor: getCityLayerColor(activeCity, activeLayer) }}
                        className="h-3.5 w-3.5 rounded-full border border-white shadow-xs dark:border-slate-800 shrink-0"
                      />
                      <div>
                        <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
                          {activeCity.name[language]}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {formatNumber(activeCity.populationMillions, 2)}M ·{' '}
                          {formatElevation(activeCity.elevationM)} · {activeCity.lat.toFixed(2)}°,{' '}
                          {activeCity.lon.toFixed(2)}°
                        </div>
                      </div>
                    </div>
                    <StatusLabel status={getStatusFromAqi(activeCity.aqi, aqiThreshold)} />
                  </div>

                  {/* City Telemetry Row */}
                  <div className="grid grid-cols-4 gap-2 border-y border-slate-200/80 py-2 text-[11px] dark:border-slate-800">
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">
                        {t.indicators.aqi.short}
                      </div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {activeCity.aqi}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">
                        {t.indicators.pm25.short}
                      </div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {formatNumber(activeCity.pm25, 1)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">
                        {t.mapView.greenSpaceLabel}
                      </div>
                      <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {activeCity.greenSpacePct}%
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">
                        {t.indicators.renewable.short}
                      </div>
                      <div className="font-mono font-bold text-teal-700 dark:text-teal-400">
                        {formatNumber(activeCity.renewablePct, 0)}%
                      </div>
                    </div>
                  </div>

                  <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                    {activeCity.envNote[language]}
                  </p>

                  {/* City Strengths & Issues */}
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div className="rounded-lg border border-emerald-200/70 bg-white p-2.5 dark:border-emerald-900/50 dark:bg-slate-900">
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{t.mapView.cityStrengthsHeading}</span>
                      </div>
                      <ul className="mt-1.5 space-y-1 text-[11px] leading-snug text-slate-700 dark:text-slate-300">
                        {activeCity.strengths[language].map((item, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="text-emerald-600 dark:text-emerald-400" aria-hidden="true">
                              •
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-lg border border-amber-200/70 bg-white p-2.5 dark:border-amber-900/50 dark:bg-slate-900">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{t.mapView.cityIssuesHeading}</span>
                      </div>
                      <ul className="mt-1.5 space-y-1 text-[11px] leading-snug text-slate-700 dark:text-slate-300">
                        {activeCity.issues[language].map((item, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="text-amber-600 dark:text-amber-400" aria-hidden="true">
                              •
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inspector Footer Actions */}
          <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row dark:border-slate-800">
            <button
              type="button"
              onClick={() => onNavigate('analysis')}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-700 px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-teal-800 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 whitespace-nowrap"
            >
              <span>{t.mapView.openFullAnalysis}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('regions')}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.mapView.openRegionsDirectory}</span>
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
};
