export type LanguageCode = 'uz' | 'ru' | 'tr' | 'en';

export type PageView = 'map' | 'statistics' | 'analysis' | 'regions' | 'settings';

export type MapLayer = 'aqi' | 'co2' | 'forest' | 'renewable' | 'temp';

export type RegionId = 'all' | 'central_asia' | 'europe' | 'asia_pacific' | 'americas' | 'mea';

export type UnitSystem = 'metric' | 'imperial';

export type ThemeMode = 'light' | 'dark';

export type StatusLevel = 'good' | 'moderate' | 'critical';

export interface LanguageOption {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  shortCode: string;
  scriptLabel: string;
  isDefault?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'uz',
    nativeName: 'O‘zbekcha',
    englishName: 'Uzbek',
    shortCode: 'UZ',
    scriptLabel: 'Lotin alifbosi',
    isDefault: true,
  },
  {
    code: 'ru',
    nativeName: 'Русский',
    englishName: 'Russian',
    shortCode: 'RU',
    scriptLabel: 'Кириллица',
  },
  {
    code: 'tr',
    nativeName: 'Türkçe',
    englishName: 'Turkish',
    shortCode: 'TR',
    scriptLabel: 'Latin alfabesi',
  },
  {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    shortCode: 'EN',
    scriptLabel: 'Latin script',
  },
];

export interface TranslationSchema {
  meta: {
    pageTitle: string;
    pageDescription: string;
  };
  nav: {
    brand: string;
    map: string;
    statistics: string;
    analysis: string;
    regions: string;
    settings: string;
    searchPlaceholder: string;
    searchButton: string;
    notifications: string;
    languageSelector: string;
    menuOpen: string;
    menuClose: string;
  };
  common: {
    all: string;
    reset: string;
    save: string;
    cancel: string;
    retry: string;
    close: string;
    clear: string;
    exportCsv: string;
    viewDetails: string;
    selectCountry: string;
    selected: string;
    defaultBadge: string;
    active: string;
    loading: string;
    noData: string;
    population: string;
    area: string;
    elevation: string;
    capital: string;
    coordinates: string;
    climateZone: string;
    terrain: string;
    year: string;
    month: string;
    country: string;
    city: string;
    region: string;
    status: string;
    updatedAt: string;
    sourceNote: string;
  };
  statusLabels: {
    good: string;
    moderate: string;
    critical: string;
  };
  regions: {
    all: string;
    central_asia: string;
    europe: string;
    asia_pacific: string;
    americas: string;
    mea: string;
  };
  indicators: {
    aqi: {
      name: string;
      short: string;
      unit: string;
      description: string;
    };
    pm25: {
      name: string;
      short: string;
      unit: string;
      description: string;
    };
    co2: {
      name: string;
      short: string;
      unitMetric: string;
      unitImperial: string;
      description: string;
    };
    forest: {
      name: string;
      short: string;
      unit: string;
      description: string;
    };
    renewable: {
      name: string;
      short: string;
      unit: string;
      description: string;
    };
    tempAnomaly: {
      name: string;
      short: string;
      unitMetric: string;
      unitImperial: string;
      description: string;
    };
    waterQuality: {
      name: string;
      short: string;
      unit: string;
      description: string;
    };
    biodiversity: {
      name: string;
      short: string;
      unit: string;
      description: string;
    };
  };
  mapView: {
    eyebrow: string;
    title: string;
    subtitle: string;
    kpiGlobalTemp: string;
    kpiGlobalAqi: string;
    kpiForestCover: string;
    kpiRenewableShare: string;
    layerLabel: string;
    regionFilterLabel: string;
    zoomIn: string;
    zoomOut: string;
    resetView: string;
    cursorCoordinates: string;
    legendLow: string;
    legendMid: string;
    legendHigh: string;
    inspectorTitle: string;
    inspectorEmptyTitle: string;
    inspectorEmptyBody: string;
    monitoredCities: string;
    geographicalOverview: string;
    environmentalSummary: string;
    openFullAnalysis: string;
    openRegionsDirectory: string;
    unprofiledCountryNote: string;
    cityPinHint: string;
    zoomToCountry: string;
    zoomCityColorHint: string;
    cityColorLabel: string;
    cityStrengthsHeading: string;
    cityIssuesHeading: string;
    greenSpaceLabel: string;
    cityBoundariesLabel: string;
    autoZoomLabel: string;
    cityZoneSuffix: string;
    zoomSliderLabel: string;
  };
  statisticsView: {
    eyebrow: string;
    title: string;
    subtitle: string;
    searchInputPlaceholder: string;
    simulateError: string;
    errorTitle: string;
    errorDescription: string;
    emptyTableTitle: string;
    emptyTableDescription: string;
    tableTitle: string;
    tableSubtitle: string;
    sortAsc: string;
    sortDesc: string;
    charts: {
      timeSeriesTitle: string;
      timeSeriesSubtitle: string;
      co2SeriesLabel: string;
      tempSeriesLabel: string;
      regionSelectLabel: string;
      barChartTitle: string;
      barChartSubtitle: string;
      renewableLegend: string;
      forestLegend: string;
      heatmapTitle: string;
      heatmapSubtitle: string;
      heatmapLow: string;
      heatmapHigh: string;
    };
    csvSuccess: string;
  };
  analysisView: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCountryLabel: string;
    comparisonCountryLabel: string;
    radarTitle: string;
    radarSubtitle: string;
    globalBenchmark: string;
    axes: {
      airPurity: string;
      waterQuality: string;
      forestPreservation: string;
      renewableTransition: string;
      biodiversity: string;
      climateStability: string;
    };
    diagnosticsTitle: string;
    strengthsHeading: string;
    risksHeading: string;
    recommendationsHeading: string;
    trajectoryHeading: string;
    simulatorTitle: string;
    simulatorSubtitle: string;
    sliderRenewable: string;
    sliderReforestation: string;
    sliderEmissionCut: string;
    projectedAqi: string;
    projectedCo2: string;
    projectedTemp: string;
    baselineLabel: string;
    projectedLabel: string;
    resetSimulation: string;
    validationErrorRange: string;
  };
  regionsView: {
    eyebrow: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    countriesCountLabel: string;
    citiesCountLabel: string;
    countryProfileHeading: string;
    citiesHeading: string;
    selectCityPrompt: string;
    cityTelemetryHeading: string;
    seasonalTrendHeading: string;
    methodologyTitle: string;
    methodologySubtitle: string;
    glossaryItems: {
      title: string;
      body: string;
    }[];
  };
  settingsView: {
    eyebrow: string;
    title: string;
    subtitle: string;
    languageSectionTitle: string;
    languageSectionSubtitle: string;
    languageSavedNote: string;
    languageSwitchedToast: string;
    displaySectionTitle: string;
    displaySectionSubtitle: string;
    themeLabel: string;
    themeLight: string;
    themeDark: string;
    unitsLabel: string;
    unitsMetric: string;
    unitsMetricDesc: string;
    unitsImperial: string;
    unitsImperialDesc: string;
    alertsSectionTitle: string;
    alertsSectionSubtitle: string;
    aqiThresholdLabel: string;
    aqiThresholdHelp: string;
    aqiThresholdError: string;
    applyThreshold: string;
    thresholdSaved: string;
    resetAllLabel: string;
    resetAllButton: string;
    resetAllSuccess: string;
    aboutSectionTitle: string;
    aboutSectionBody: string;
    creatorLabel: string;
    creatorName: string;
  };
  notifications: {
    title: string;
    filterAll: string;
    filterUnread: string;
    filterCritical: string;
    markAllRead: string;
    dismiss: string;
    emptyTitle: string;
    emptyBody: string;
    unreadCountLabel: string;
  };
  searchModal: {
    title: string;
    placeholder: string;
    shortcutHint: string;
    countriesGroup: string;
    citiesGroup: string;
    indicatorsGroup: string;
    emptyTitle: string;
    emptyBody: string;
    errorInputTooShort: string;
    navigateHint: string;
  };
  footer: {
    tagline: string;
    copyright: string;
    quickLinksTitle: string;
    activeLanguageLabel: string;
    methodologyLink: string;
    creatorLabel: string;
  };
}
