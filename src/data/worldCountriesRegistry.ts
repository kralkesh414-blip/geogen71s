import { LanguageCode, RegionId } from '../i18n/types';
import {
  COUNTRIES_DATA,
  CityRecord,
  CountryRecord,
  LocalizedString,
  LocalizedStringList,
} from './geoData';

type BiomeType =
  | 'arid'
  | 'coastal'
  | 'alpine'
  | 'temperate'
  | 'tropical'
  | 'boreal'
  | 'mediterranean'
  | 'steppe'
  | 'monsoon';

type CityRole = 'capital' | 'port' | 'industrial' | 'alpine' | 'oasis' | 'river' | 'green';

interface CompactCitySpec {
  id: string;
  name: LocalizedString;
  lat: number;
  lon: number;
  pop: number;
  elev: number;
  aqi: number;
  pm25: number;
  co2: number;
  ren: number;
  water: number;
  temp: number;
  green: number;
  role: CityRole;
}

interface CompactCountrySpec {
  id: string;
  numericId: string;
  iso2: string;
  region: Exclude<RegionId, 'all'>;
  name: LocalizedString;
  pop: number;
  area: number;
  aqi: number;
  pm25: number;
  co2: number;
  forest: number;
  ren: number;
  temp: number;
  water: number;
  bio: number;
  biome: BiomeType;
  cities: CompactCitySpec[];
}

const BIOME_LABELS: Record<BiomeType, { climate: LocalizedString; terrain: LocalizedString }> = {
  arid: {
    climate: {
      uz: 'Quruq cho‘l va yarimcho‘l iqlimi',
      ru: 'Засушливый пустынный и полупустынный климат',
      tr: 'Kurak çöl ve yarı kurak iklim',
      en: 'Arid desert and semi-arid climate',
    },
    terrain: {
      uz: 'Keng cho‘l tekisliklari, platolar va vohalar',
      ru: 'Обширные пустынные равнины, плато и оазисы',
      tr: 'Geniş çöl düzlükleri, platolar ve vahalar',
      en: 'Expansive desert plains, plateaus, and oasis basins',
    },
  },
  coastal: {
    climate: {
      uz: 'Dengizbo‘yi yumshoq va nam iqlim',
      ru: 'Мягкий морской и влажный прибрежный климат',
      tr: 'Ilıman denizel ve nemli kıyı iklimi',
      en: 'Mild maritime and humid coastal climate',
    },
    terrain: {
      uz: 'Sohil tekisliklari, estuariylar va port ko‘rfazlari',
      ru: 'Прибрежные низменности, эстуарии и морские заливы',
      tr: 'Kıyı ovaları, haliçler ve doğal körfezler',
      en: 'Coastal lowlands, estuaries, and sheltered bays',
    },
  },
  alpine: {
    climate: {
      uz: 'Tog‘li va salqin kontinental iqlim',
      ru: 'Горный и прохладный континентальный климат',
      tr: 'Dağlık ve serin karasal iklim',
      en: 'Montane alpine and cool continental climate',
    },
    terrain: {
      uz: 'Baland tog‘ tizmalari, muzlik vodiylari va daryo havzalari',
      ru: 'Высокие горные хребты, ледниковые долины и речные бассейны',
      tr: 'Yüksek dağ sıraları, buzul vadileri ve akarsu havzaları',
      en: 'High mountain ridges, glacial valleys, and watershed basins',
    },
  },
  temperate: {
    climate: {
      uz: 'Mo‘tadil kontinental va to‘rt faslli iqlim',
      ru: 'Умеренный континентальный климат с чёткими сезонами',
      tr: 'Ilıman karasal ve dört mevsimli iklim',
      en: 'Temperate seasonal continental climate',
    },
    terrain: {
      uz: 'Unudor tekisliklar, daryo vodiylari va aralash o‘rmonlar',
      ru: 'Плодородные равнины, речные долины и смешанные леса',
      tr: 'Verimli ovalar, nehir vadileri ve karma ormanlar',
      en: 'Fertile plains, river valleys, and broadleaf woodlands',
    },
  },
  tropical: {
    climate: {
      uz: 'Ekvatorial va nam tropik iqlim',
      ru: 'Экваториальный и влажный тропический климат',
      tr: 'Ekvatoral ve nemli tropikal iklim',
      en: 'Equatorial and humid tropical climate',
    },
    terrain: {
      uz: 'Tropik yomg‘ir o‘rmonlari, daryo deltalari va tepaliklar',
      ru: 'Тропические дождевые леса, дельты рек и нагорья',
      tr: 'Tropikal yağmur ormanları, nehir deltaları ve yaylalar',
      en: 'Tropical rainforests, river deltas, and highland plateaus',
    },
  },
  boreal: {
    climate: {
      uz: 'Subarktik va salqin shimoliy iqlim',
      ru: 'Субарктический и прохладный бореальный климат',
      tr: 'Subarktik ve serin kuzey iklimi',
      en: 'Boreal subarctic and cool northern climate',
    },
    terrain: {
      uz: 'Tayga o‘rmonlari, ko‘llar tizimi va qadimiy qoyali tekisliklar',
      ru: 'Таёжные леса, озёрные системы и кристаллические щиты',
      tr: 'Tayga ormanları, göl havzaları ve buzul aşındırmalı araziler',
      en: 'Boreal taiga forests, glacial lake basins, and rocky shields',
    },
  },
  mediterranean: {
    climate: {
      uz: 'O‘rta yer dengizi subtropik iqlimi',
      ru: 'Средиземноморский субтропический климат',
      tr: 'Akdeniz subtropikal iklimi',
      en: 'Mediterranean subtropical climate',
    },
    terrain: {
      uz: 'Sohil tizmalari, zaytunzor tepaliklar va dengiz yarimorollari',
      ru: 'Прибрежные хребты, холмистые долины и морские полуострова',
      tr: 'Kıyı dağları, makilik tepeler ve yarımadalar',
      en: 'Coastal ridges, sun-drenched hills, and maritime peninsulas',
    },
  },
  steppe: {
    climate: {
      uz: 'Dasht va quruq kontinental iqlim',
      ru: 'Степной и сухой континентальный климат',
      tr: 'Bozkır ve yarı kurak karasal iklim',
      en: 'Continental steppe and dryland climate',
    },
    terrain: {
      uz: 'Keng dasht yaylovlari, daryo o‘zanlari va past tog‘lar',
      ru: 'Широкие степные плато, речные поймы и мелкосопочник',
      tr: 'Geniş bozkır platoları, nehir yatakları ve alçak dağlar',
      en: 'Open steppe plateaus, river floodplains, and rolling uplands',
    },
  },
  monsoon: {
    climate: {
      uz: 'Mavsumiy musson va subtropik iqlim',
      ru: 'Сезонный муссонный и субтропический климат',
      tr: 'Mevsimsel muson ve subtropikal iklim',
      en: 'Seasonal monsoon and subtropical climate',
    },
    terrain: {
      uz: 'Allyuvial tekisliklar, tog‘ oldi daralari va yirik deltalar',
      ru: 'Аллювиальные равнины, предгорные долины и крупные дельты',
      tr: 'Alüvyal ovalar, dağ etekleri ve geniş deltalar',
      en: 'Alluvial river plains, foothill basins, and fertile deltas',
    },
  },
};

function buildCityStrengths(city: CompactCitySpec, biome: BiomeType): LocalizedStringList {
  const cUz = city.name.uz;
  const cRu = city.name.ru;
  const cTr = city.name.tr;
  const cEn = city.name.en;

  const list: Record<LanguageCode, string[]> = { uz: [], ru: [], tr: [], en: [] };

  if (city.aqi <= 45) {
    list.uz.push(`${cUz} atmosferasida past PM2.5 ko‘rsatkichi (${city.pm25} mkg/m³)`);
    list.ru.push(`Низкий уровень PM2.5 в атмосфере г. ${cRu} (${city.pm25} мкг/м³)`);
    list.tr.push(`${cTr} atmosferinde düşük PM2.5 yoğunluğu (${city.pm25} µg/m³)`);
    list.en.push(`Clean ambient air with low PM2.5 (${city.pm25} µg/m³) across ${cEn}`);
  } else if (city.ren >= 35) {
    list.uz.push(`${cUz} energiya tizimida yashil manbalar ulushi (${city.ren}%)`);
    list.ru.push(`Высокая доля чистой генерации в г. ${cRu} (${city.ren}%)`);
    list.tr.push(`${cTr} enerji şebekesinde yüksek yenilenebilir pay (${city.ren}%)`);
    list.en.push(`Strong clean-power integration (${city.ren}%) serving ${cEn}`);
  } else {
    list.uz.push(`${cUz} shahar hududida yashil belbog‘lar ulushi (${city.green}%)`);
    list.ru.push(`Доля городских зелёных поясов и парков в г. ${cRu} (${city.green}%)`);
    list.tr.push(`${cTr} kent sınırlarında korunan yeşil koridorlar (%${city.green})`);
    list.en.push(`Urban green belts and park corridors covering ${city.green}% of ${cEn}`);
  }

  switch (city.role) {
    case 'port':
      list.uz.push('Dengiz shamollari havoning tabiiy yangilanishini tezlashtiradi');
      list.ru.push('Морские бризы ускоряют естественное проветривание и рассеивание примесей');
      list.tr.push('Deniz meltemleri şehir havasının doğal dolaşımını güçlendirir');
      list.en.push('Coastal sea breezes accelerate natural dispersion of urban emissions');
      break;
    case 'alpine':
      list.uz.push('Tog‘ daryolari va salqin havo oqimlari suv hamda havo sifatini qo‘llaydi');
      list.ru.push('Горные реки и чистые воздушные потоки поддерживают высокое качество воды');
      list.tr.push('Dağ nehirleri ve serin rüzgar akımları su ile hava kalitesini destekler');
      list.en.push('Mountain watersheds and valley breezes sustain freshwater and air clarity');
      break;
    case 'green':
      list.uz.push('Jamoat transportini elektrlashtirish va veloyo‘laklar tarmog‘i rivojlangan');
      list.ru.push('Развита сеть электротранспорта и устойчивой городской мобильности');
      list.tr.push('Elektrikli toplu taşıma ve sürdürülebilir kent içi ulaşım ağı güçlüdür');
      list.en.push('High uptake of electrified public transit and low-emission corridors');
      break;
    case 'oasis':
      list.uz.push('Quyosh radiatsiyasi salohiyati tufayli quyosh elektr stansiyalari kengaymoqda');
      list.ru.push('Высокий солнечный потенциал стимулирует переход на фотоэлектрическую генерацию');
      list.tr.push('Yüksek güneş enerjisi potansiyeli temiz elektrik yatırımlarını hızlandırır');
      list.en.push('Abundant solar irradiance fuels rapid expansion of clean solar capacity');
      break;
    case 'river':
      list.uz.push('Daryo bo‘yi ekoparklari va gidroenergetika infratuzilmasi mavjud');
      list.ru.push('Благоустроенные речные набережные и потенциал гидроресурсов');
      list.tr.push('Nehir kıyısı ekoparkları ve su kaynakları altyapısı güçlüdür');
      list.en.push('Riparian greenways and freshwater corridors moderate urban summer heat');
      break;
    case 'industrial':
      list.uz.push('Sanoat chiqindilarini zamonaviy filtratsiya va monitoring tizimiga o‘tkazish');
      list.ru.push('Модернизация промышленной фильтрации и автоматический контроль выбросов');
      list.tr.push('Sanayi tesislerinde modern emisyon filtrasyonu ve anlık izleme');
      list.en.push('Ongoing industrial stack filtration upgrades and continuous emissions tracking');
      break;
    default:
      list.uz.push(`Markaziy ekologik monitoring tarmog‘i va suv sifati nazorati (${city.water}/100)`);
      list.ru.push(`Сеть стационарного экомониторинга и контроль водных систем (${city.water}/100)`);
      list.tr.push(`Gelişmiş hava izleme istasyonları ve su kalitesi denetimi (${city.water}/100)`);
      list.en.push(`Dense environmental sensor coverage and municipal water quality (${city.water}/100)`);
      break;
  }

  if (biome === 'boreal' || biome === 'tropical') {
    list.uz.push('Atrofdagi tabiiy o‘rmon massivlari uglerodni yutish imkonini oshiradi');
    list.ru.push('Окружающие лесные массивы обеспечивают высокий потенциал поглощения углерода');
    list.tr.push('Çevredeki yoğun orman örtüsü güçlü doğal karbon yutağı oluşturur');
    list.en.push('Surrounding forest ecosystems provide strong natural carbon sequestration');
  }

  return list;
}

function buildCityIssues(city: CompactCitySpec, biome: BiomeType): LocalizedStringList {
  const cUz = city.name.uz;
  const cRu = city.name.ru;
  const cTr = city.name.tr;
  const cEn = city.name.en;

  const list: Record<LanguageCode, string[]> = { uz: [], ru: [], tr: [], en: [] };

  if (city.aqi >= 70) {
    list.uz.push(`${cUz} havosida mavsumiy PM2.5 yuklamasi (${city.pm25} mkg/m³) yuqori`);
    list.ru.push(`Повышенная сезонная концентрация PM2.5 в г. ${cRu} (${city.pm25} мкг/м³)`);
    list.tr.push(`${cTr} genelinde mevsimsel PM2.5 yoğunluğu (${city.pm25} µg/m³) yüksektir`);
    list.en.push(`Elevated seasonal PM2.5 concentrations (${city.pm25} µg/m³) in ${cEn}`);
  } else {
    list.uz.push(`${cUz} markazida avtotransport harakati NO₂ chiqindilarini oshirmoqda`);
    list.ru.push(`Интенсивный автотрафик в центре г. ${cRu} повышает уровень NO₂`);
    list.tr.push(`${cTr} merkezindeki yoğun kara yolu trafiği NO₂ baskısını artırmaktadır`);
    list.en.push(`Peak-hour road traffic corridors contribute to localized NO₂ spikes in ${cEn}`);
  }

  if (biome === 'arid' || biome === 'steppe' || city.water < 60) {
    list.uz.push('Qurg‘oqchilik mavsumida chuchuk suv tanqisligi va chang bo‘ronlari xavfi');
    list.ru.push('Дефицит пресной воды в засушливый период и риск пылевых аэрозолей');
    list.tr.push('Kurak dönemlerde tatlı su stresi ve rüzgar kaynaklı toz taşınımı');
    list.en.push('Dry-season freshwater stress and wind-driven mineral dust episodes');
  } else if (city.role === 'port' || biome === 'coastal') {
    list.uz.push('Dengiz porti logistikasi va sohil hududlarida toshqin xavfi');
    list.ru.push('Эмиссия портовой логистики и уязвимость береговой зоны к штормовым нагонам');
    list.tr.push('Liman gemi trafiği emisyonları ve kıyı taşkını hassasiyeti');
    list.en.push('Maritime port shipping emissions and coastal storm-surge exposure');
  } else if (city.co2 >= 7.5 || city.role === 'industrial') {
    list.uz.push(`Aholi jon boshiga uglerod izi (${city.co2} t/yil) va sanoat issiqlik oroli`);
    list.ru.push(`Повышенный углеродный след (${city.co2} т/год) и эффект теплового острова`);
    list.tr.push(`Kişi başı karbon yoğunluğu (${city.co2} t/yıl) ve kentsel ısı adası etkisi`);
    list.en.push(`High per-capita carbon footprint (${city.co2} t/yr) and urban heat-island buildup`);
  } else {
    list.uz.push(`Yozgi harorat anomaliyasi (+${city.temp}°C) va zich qurilish bosimi`);
    list.ru.push(`Летняя температурная аномалия (+${city.temp}°C) и уплотнение застройки`);
    list.tr.push(`Yaz sıcaklık anomalisi (+${city.temp}°C) ve yoğun kentleşme baskısı`);
    list.en.push(`Rising summer thermal anomaly (+${city.temp}°C) and peri-urban land pressure`);
  }

  return list;
}

function buildCityMonthlyAqi(baseAqi: number, biome: BiomeType): number[] {
  const weights =
    biome === 'arid' || biome === 'steppe'
      ? [1.14, 1.08, 0.96, 0.88, 0.94, 1.02, 1.09, 1.12, 1.0, 0.95, 1.06, 1.18]
      : biome === 'monsoon'
        ? [1.26, 1.18, 1.04, 0.92, 0.85, 0.72, 0.68, 0.7, 0.82, 1.06, 1.24, 1.32]
        : [1.18, 1.12, 1.02, 0.92, 0.86, 0.84, 0.88, 0.9, 0.92, 1.0, 1.1, 1.2];

  return weights.map((w) => Math.max(10, Math.round(baseAqi * w)));
}

function hydrateCountry(spec: CompactCountrySpec): CountryRecord {
  const biomeMeta = BIOME_LABELS[spec.biome];
  const cap = spec.cities[0];

  const cities: CityRecord[] = spec.cities.map((c) => ({
    id: c.id,
    name: c.name,
    lat: c.lat,
    lon: c.lon,
    populationMillions: c.pop,
    elevationM: c.elev,
    aqi: c.aqi,
    pm25: c.pm25,
    co2PerCapita: c.co2,
    renewablePct: c.ren,
    waterQualityScore: c.water,
    tempAnomalyC: c.temp,
    greenSpacePct: c.green,
    climateNote: biomeMeta.climate,
    envNote: {
      uz: `${c.name.uz} shahrida o‘rtacha AQI ${c.aqi}, yashil maydonlar ${c.green}% va qayta tiklanuvchi energiya ulushi ${c.ren}% ni tashkil etadi.`,
      ru: `В городе ${c.name.ru} средний индекс AQI составляет ${c.aqi}, доля зелёных зон — ${c.green}%, доля ВИЭ — ${c.ren}%.`,
      tr: `${c.name.tr} şehrinde ortalama AQI ${c.aqi}, yeşil alan oranı %${c.green} ve yenilenebilir enerji payı %${c.ren} düzeyindedir.`,
      en: `${c.name.en} records a mean AQI of ${c.aqi}, ${c.green}% urban green cover, and ${c.ren}% renewable electricity integration.`,
    },
    strengths: buildCityStrengths(c, spec.biome),
    issues: buildCityIssues(c, spec.biome),
    monthlyAqi: buildCityMonthlyAqi(c.aqi, spec.biome),
  }));

  const nUz = spec.name.uz;
  const nRu = spec.name.ru;
  const nTr = spec.name.tr;
  const nEn = spec.name.en;

  return {
    id: spec.id,
    numericId: spec.numericId,
    iso2: spec.iso2,
    region: spec.region,
    name: spec.name,
    capital: cap.name,
    populationMillions: spec.pop,
    areaKm2: spec.area,
    aqi: spec.aqi,
    pm25: spec.pm25,
    co2PerCapita: spec.co2,
    forestCoverPct: spec.forest,
    renewablePct: spec.ren,
    tempAnomalyC: spec.temp,
    waterQualityScore: spec.water,
    biodiversityScore: spec.bio,
    climateZone: biomeMeta.climate,
    terrain: biomeMeta.terrain,
    geoDescription: {
      uz: `${nUz} umumiy maydoni ${spec.area.toLocaleString('en-US')} km² bo‘lib, poytaxti ${cap.name.uz} shahridir. Mamlakat landshaftini ${biomeMeta.terrain.uz.toLowerCase()} shakllantiradi.`,
      ru: `${nRu} занимает площадь ${spec.area.toLocaleString('en-US')} км², столица — ${cap.name.ru}. Природный облик формируют ${biomeMeta.terrain.ru.toLowerCase()}.`,
      tr: `${nTr}, ${spec.area.toLocaleString('en-US')} km² yüzölçümüne ve başkent ${cap.name.tr} şehrine sahiptir. Coğrafi yapısını ${biomeMeta.terrain.tr.toLowerCase()} belirler.`,
      en: `${nEn} spans ${spec.area.toLocaleString('en-US')} km² with its capital at ${cap.name.en}, defined geographically by ${biomeMeta.terrain.en.toLowerCase()}.`,
    },
    envDescription: {
      uz: `Mamlakat bo‘yicha o‘rtacha AQI ${spec.aqi}, o‘rmon qoplami ${spec.forest}% va yashil energetika ulushi ${spec.ren}%. Suv sifati indeksi ${spec.water}/100 darajada kuzatilmoqda.`,
      ru: `Средний национальный индекс AQI составляет ${spec.aqi}, лесистость — ${spec.forest}%, доля ВИЭ — ${spec.ren}%, индекс качества воды — ${spec.water}/100.`,
      tr: `Ülke genelinde ortalama AQI ${spec.aqi}, orman örtüsü %${spec.forest}, yenilenebilir enerji payı %${spec.ren} ve su kalitesi skoru ${spec.water}/100 seviyesindedir.`,
      en: `Nationally, ${nEn} averages an AQI of ${spec.aqi}, ${spec.forest}% forest cover, ${spec.ren}% renewable electricity, and a water quality score of ${spec.water}/100.`,
    },
    analysis: {
      strengths: {
        uz: [
          `Qayta tiklanuvchi energetika (${spec.ren}%) va hududiy ekologik monitoring`,
          `${spec.forest}% o‘rmon qoplami va bioxilma-xillik (${spec.bio}/100)`,
        ],
        ru: [
          `Развитие возобновляемой энергетики (${spec.ren}%) и локальный мониторинг`,
          `Лесной фонд (${spec.forest}%) и индекс биоразнообразия (${spec.bio}/100)`,
        ],
        tr: [
          `Yenilenebilir enerji payı (%${spec.ren}) ve şehir bazlı çevresel izleme`,
          `Orman varlığı (%${spec.forest}) ve biyoçeşitlilik koruma skoru (${spec.bio}/100)`,
        ],
        en: [
          `Clean power share (${spec.ren}%) supported by multi-city monitoring`,
          `Natural forest cover (${spec.forest}%) and biodiversity resilience (${spec.bio}/100)`,
        ],
      },
      risks: {
        uz: [
          `Yirik shaharlarda PM2.5 (${spec.pm25} mkg/m³) va transport emissiyasi`,
          `Iqlimiy harorat og‘ishi (+${spec.temp}°C) sababli suv va ekotizim bosimi`,
        ],
        ru: [
          `Нагрузка от частиц PM2.5 (${spec.pm25} мкг/м³) и городского транспорта`,
          `Климатическое смещение (+${spec.temp}°C), влияющее на водный баланс`,
        ],
        tr: [
          `Kent merkezlerinde PM2.5 (${spec.pm25} µg/m³) ve ulaşım kaynaklı emisyonlar`,
          `Sıcaklık artışı (+${spec.temp}°C) nedeniyle su ve ekosistem stresi`,
        ],
        en: [
          `Urban particulate load (PM2.5 ${spec.pm25} µg/m³) in dense corridors`,
          `Thermal shift (+${spec.temp}°C) increasing seasonal water and ecosystem pressure`,
        ],
      },
      recommendations: {
        uz: [
          'Shaharlarda jamoat transportini elektrlashtirish va yashil hududlarni kengaytirish',
          'Suv resurslarini tejash va qayta tiklanuvchi generatsiyani oshirish',
        ],
        ru: [
          'Электрификация городского транспорта и расширение зелёных коридоров',
          'Повышение энергоэффективности и инвестиции в чистую генерацию',
        ],
        tr: [
          'Şehir içi ulaşımda elektrifikasyon ve yeşil koridorların genişletilmesi',
          'Su verimliliği ile güneş ve rüzgar kapasitesinin artırılması',
        ],
        en: [
          'Accelerate zero-emission urban transit and green belt expansion',
          'Scale clean electricity storage and watershed conservation programs',
        ],
      },
      outlook2030: {
        uz: `${nUz} 2030-yilgacha toza energetika va shahar ekotizimlarini modernizatsiya qilish orqali uglerod yukini kamaytirishni maqsad qilgan.`,
        ru: `К 2030 году ${nRu} ориентируется на снижение углеродной нагрузки за счёт чистой энергии и городского озеленения.`,
        tr: `${nTr}, 2030 yılına kadar temiz enerji yatırımları ve kentsel yeşillendirme ile karbon yoğunluğunu düşürmeyi hedeflemektedir.`,
        en: `By 2030, ${nEn} targets measurable carbon-intensity reductions via clean grid upgrades and urban resilience measures.`,
      },
    },
    cities,
  };
}

// Helper shorthand for defining compact cities cleanly
const c = (
  id: string,
  uz: string,
  ru: string,
  tr: string,
  en: string,
  lat: number,
  lon: number,
  pop: number,
  elev: number,
  aqi: number,
  pm25: number,
  co2: number,
  ren: number,
  water: number,
  temp: number,
  green: number,
  role: CityRole,
): CompactCitySpec => ({
  id,
  name: { uz, ru, tr, en },
  lat,
  lon,
  pop,
  elev,
  aqi,
  pm25,
  co2,
  ren,
  water,
  temp,
  green,
  role,
});

const EXTENDED_SPECS: CompactCountrySpec[] = [
  // Central Asia & Caucasus
  {
    id: 'tjk', numericId: '762', iso2: 'TJ', region: 'central_asia',
    name: { uz: 'Tojikiston', ru: 'Таджикистан', tr: 'Tacikistan', en: 'Tajikistan' },
    pop: 10.3, area: 143100, aqi: 66, pm25: 22.8, co2: 1.1, forest: 3.1, ren: 91.4, temp: 1.48, water: 76, bio: 71, biome: 'alpine',
    cities: [
      c('dushanbe', 'Dushanbe', 'Душанбе', 'Duşanbe', 'Dushanbe', 38.56, 68.78, 1.24, 706, 71, 24.4, 1.3, 88, 78, 1.45, 29, 'capital'),
      c('khujand', 'Xo‘jand', 'Худжанд', 'Hocent', 'Khujand', 40.28, 69.62, 0.21, 300, 62, 20.5, 1.1, 90, 72, 1.52, 24, 'river'),
      c('khorog', 'Xorug‘', 'Хорог', 'Horog', 'Khorog', 37.49, 71.55, 0.04, 2123, 34, 9.8, 0.6, 97, 86, 1.62, 32, 'alpine'),
    ],
  },
  {
    id: 'tkm', numericId: '795', iso2: 'TM', region: 'central_asia',
    name: { uz: 'Turkmaniston', ru: 'Туркменистан', tr: 'Türkmenistan', en: 'Turkmenistan' },
    pop: 6.6, area: 488100, aqi: 74, pm25: 26.2, co2: 11.2, forest: 8.6, ren: 1.2, temp: 1.64, water: 52, bio: 54, biome: 'arid',
    cities: [
      c('ashgabat', 'Ashxobod', 'Ашхабад', 'Aşkabat', 'Ashgabat', 37.96, 58.33, 1.03, 219, 72, 25.1, 10.4, 2, 56, 1.65, 22, 'capital'),
      c('turkmenabat', 'Turkmanobod', 'Туркменабат', 'Türkmenabat', 'Turkmenabat', 39.07, 63.58, 0.28, 187, 78, 28.4, 9.8, 1, 50, 1.62, 18, 'river'),
      c('turkmenbashi', 'Turkmanboshi', 'Туркменбаши', 'Türkmenbaşı', 'Turkmenbashi', 40.02, 52.97, 0.09, -20, 65, 21.8, 13.1, 3, 51, 1.54, 14, 'port'),
    ],
  },
  {
    id: 'aze', numericId: '031', iso2: 'AZ', region: 'central_asia',
    name: { uz: 'Ozarbayjon', ru: 'Азербайджан', tr: 'Azerbaycan', en: 'Azerbaijan' },
    pop: 10.2, area: 86600, aqi: 58, pm25: 18.4, co2: 3.8, forest: 13.7, ren: 8.9, temp: 1.46, water: 66, bio: 68, biome: 'steppe',
    cities: [
      c('baku', 'Boku', 'Баку', 'Bakü', 'Baku', 40.41, 49.87, 2.34, -28, 63, 20.1, 4.5, 9, 64, 1.48, 21, 'port'),
      c('ganja', 'Ganja', 'Гянджа', 'Gence', 'Ganja', 40.68, 46.36, 0.34, 408, 49, 14.9, 3.1, 12, 71, 1.42, 28, 'alpine'),
      c('sumqayit', 'Sumqayit', 'Сумгайыт', 'Sumgayıt', 'Sumqayit', 40.59, 49.67, 0.36, 26, 67, 21.4, 4.9, 7, 61, 1.46, 17, 'industrial'),
    ],
  },
  {
    id: 'geo', numericId: '268', iso2: 'GE', region: 'europe',
    name: { uz: 'Gruziya', ru: 'Грузия', tr: 'Gürcistan', en: 'Georgia' },
    pop: 3.7, area: 69700, aqi: 46, pm25: 13.8, co2: 2.9, forest: 40.6, ren: 77.5, temp: 1.38, water: 79, bio: 77, biome: 'alpine',
    cities: [
      c('tbilisi', 'Tbilisi', 'Тбилиси', 'Tiflis', 'Tbilisi', 41.72, 44.78, 1.24, 451, 52, 16.2, 3.2, 76, 78, 1.42, 27, 'capital'),
      c('batumi', 'Batumi', 'Батуми', 'Batum', 'Batumi', 41.62, 41.64, 0.18, 5, 34, 9.5, 2.1, 82, 83, 1.28, 42, 'port'),
      c('kutaisi', 'Kutaisi', 'Кутаиси', 'Kutaisi', 'Kutaisi', 42.27, 42.7, 0.14, 160, 41, 11.8, 2.4, 84, 80, 1.34, 38, 'river'),
    ],
  },
  {
    id: 'arm', numericId: '051', iso2: 'AM', region: 'europe',
    name: { uz: 'Armaniston', ru: 'Армения', tr: 'Ermenistan', en: 'Armenia' },
    pop: 2.9, area: 29743, aqi: 54, pm25: 17.1, co2: 2.4, forest: 11.8, ren: 32.1, temp: 1.45, water: 72, bio: 69, biome: 'alpine',
    cities: [
      c('yerevan', 'Yerevan', 'Ереван', 'Erivan', 'Yerevan', 40.18, 44.51, 1.1, 990, 61, 19.6, 2.7, 29, 71, 1.48, 24, 'capital'),
      c('gyumri', 'Gyumri', 'Гюмри', 'Gümrü', 'Gyumri', 40.79, 43.85, 0.12, 1509, 43, 12.6, 1.9, 36, 75, 1.41, 29, 'alpine'),
    ],
  },
  // Europe
  {
    id: 'ita', numericId: '380', iso2: 'IT', region: 'europe',
    name: { uz: 'Italiya', ru: 'Италия', tr: 'İtalya', en: 'Italy' },
    pop: 58.8, area: 301340, aqi: 49, pm25: 14.5, co2: 5.3, forest: 32.5, ren: 43.8, temp: 1.44, water: 81, bio: 76, biome: 'mediterranean',
    cities: [
      c('rome', 'Rim', 'Рим', 'Roma', 'Rome', 41.9, 12.5, 2.87, 21, 47, 13.8, 4.9, 44, 80, 1.42, 33, 'capital'),
      c('milan', 'Milan', 'Милан', 'Milano', 'Milan', 45.46, 9.19, 1.37, 122, 69, 22.9, 6.4, 41, 79, 1.56, 23, 'industrial'),
      c('naples', 'Neapol', 'Неаполь', 'Napoli', 'Naples', 40.85, 14.27, 0.91, 17, 51, 15.2, 4.3, 46, 77, 1.38, 26, 'port'),
    ],
  },
  {
    id: 'esp', numericId: '724', iso2: 'ES', region: 'europe',
    name: { uz: 'Ispaniya', ru: 'Испания', tr: 'İspanya', en: 'Spain' },
    pop: 48.3, area: 505990, aqi: 38, pm25: 10.6, co2: 4.8, forest: 37.2, ren: 51.4, temp: 1.51, water: 82, bio: 79, biome: 'mediterranean',
    cities: [
      c('madrid', 'Madrid', 'Мадрид', 'Madrid', 'Madrid', 40.42, -3.7, 3.33, 650, 42, 11.4, 4.5, 53, 83, 1.56, 36, 'capital'),
      c('barcelona', 'Barselona', 'Барселона', 'Barselona', 'Barcelona', 41.39, 2.17, 1.66, 12, 44, 12.6, 4.8, 49, 81, 1.44, 31, 'port'),
      c('seville', 'Sevilya', 'Севилья', 'Sevilla', 'Seville', 37.39, -5.98, 0.68, 7, 39, 10.9, 3.9, 64, 76, 1.68, 29, 'oasis'),
    ],
  },
  {
    id: 'prt', numericId: '620', iso2: 'PT', region: 'europe',
    name: { uz: 'Portugaliya', ru: 'Португалия', tr: 'Portekiz', en: 'Portugal' },
    pop: 10.4, area: 92212, aqi: 29, pm25: 8.1, co2: 3.9, forest: 36.1, ren: 62.5, temp: 1.31, water: 86, bio: 78, biome: 'coastal',
    cities: [
      c('lisbon', 'Lissabon', 'Лиссабон', 'Lizbon', 'Lisbon', 38.72, -9.14, 0.55, 15, 31, 8.6, 3.8, 63, 87, 1.29, 37, 'port'),
      c('porto', 'Portu', 'Порту', 'Porto', 'Porto', 41.16, -8.63, 0.24, 96, 28, 7.8, 3.5, 68, 86, 1.25, 41, 'port'),
    ],
  },
  {
    id: 'che', numericId: '756', iso2: 'CH', region: 'europe',
    name: { uz: 'Shveytsariya', ru: 'Швейцария', tr: 'İsviçre', en: 'Switzerland' },
    pop: 8.9, area: 41285, aqi: 26, pm25: 7.4, co2: 4.1, forest: 31.8, ren: 64.2, temp: 1.62, water: 95, bio: 84, biome: 'alpine',
    cities: [
      c('zurich', 'Syurix', 'Цюрих', 'Zürih', 'Zurich', 47.37, 8.54, 0.43, 408, 27, 7.9, 4.2, 66, 96, 1.58, 44, 'green'),
      c('geneva', 'Jeneva', 'Женева', 'Cenevre', 'Geneva', 46.2, 6.14, 0.21, 375, 29, 8.2, 3.9, 69, 95, 1.54, 42, 'alpine'),
      c('bern', 'Bern', 'Берн', 'Bern', 'Bern', 46.95, 7.45, 0.14, 540, 23, 6.5, 3.6, 71, 97, 1.61, 47, 'capital'),
    ],
  },
  {
    id: 'aut', numericId: '040', iso2: 'AT', region: 'europe',
    name: { uz: 'Avstriya', ru: 'Австрия', tr: 'Avusturya', en: 'Austria' },
    pop: 9.1, area: 83879, aqi: 31, pm25: 9.2, co2: 6.4, forest: 47.9, ren: 78.2, temp: 1.55, water: 93, bio: 83, biome: 'alpine',
    cities: [
      c('vienna', 'Vena', 'Вена', 'Viyana', 'Vienna', 48.21, 16.37, 1.98, 171, 33, 9.8, 5.9, 76, 94, 1.52, 49, 'green'),
      c('graz', 'Grats', 'Грац', 'Graz', 'Graz', 47.07, 15.44, 0.3, 353, 35, 10.6, 6.2, 81, 91, 1.56, 43, 'alpine'),
      c('salzburg', 'Zalsburg', 'Зальцбург', 'Salzburg', 'Salzburg', 47.8, 13.05, 0.16, 424, 24, 6.8, 5.4, 86, 95, 1.59, 52, 'alpine'),
    ],
  },
  {
    id: 'nld', numericId: '528', iso2: 'NL', region: 'europe',
    name: { uz: 'Niderlandiya', ru: 'Нидерланды', tr: 'Hollanda', en: 'Netherlands' },
    pop: 17.9, area: 41543, aqi: 36, pm25: 10.1, co2: 7.4, forest: 11.2, ren: 48.1, temp: 1.48, water: 88, bio: 73, biome: 'coastal',
    cities: [
      c('amsterdam', 'Amsterdam', 'Амстердам', 'Amsterdam', 'Amsterdam', 52.37, 4.9, 0.92, 2, 34, 9.5, 6.8, 51, 89, 1.46, 38, 'green'),
      c('rotterdam', 'Rotterdam', 'Роттердам', 'Rotterdam', 'Rotterdam', 51.92, 4.48, 0.67, 0, 44, 12.2, 9.6, 42, 86, 1.49, 29, 'port'),
      c('utrecht', 'Utrext', 'Утрехт', 'Utrecht', 'Utrecht', 52.09, 5.12, 0.37, 5, 32, 9.0, 6.1, 54, 90, 1.45, 41, 'green'),
    ],
  },
  {
    id: 'bel', numericId: '056', iso2: 'BE', region: 'europe',
    name: { uz: 'Belgiya', ru: 'Бельгия', tr: 'Belçika', en: 'Belgium' },
    pop: 11.7, area: 30688, aqi: 39, pm25: 11.2, co2: 7.8, forest: 22.8, ren: 28.4, temp: 1.46, water: 84, bio: 72, biome: 'temperate',
    cities: [
      c('brussels', 'Bryussel', 'Брюссель', 'Brüksel', 'Brussels', 50.85, 4.35, 1.24, 15, 41, 11.6, 7.1, 31, 85, 1.45, 36, 'capital'),
      c('antwerp', 'Antverpen', 'Антверпен', 'Anvers', 'Antwerp', 51.22, 4.4, 0.54, 7, 46, 12.9, 9.8, 26, 82, 1.48, 28, 'port'),
    ],
  },
  {
    id: 'swe', numericId: '752', iso2: 'SE', region: 'europe',
    name: { uz: 'Shvetsiya', ru: 'Швеция', tr: 'İsveç', en: 'Sweden' },
    pop: 10.6, area: 450295, aqi: 19, pm25: 5.1, co2: 3.4, forest: 68.7, ren: 68.9, temp: 1.49, water: 95, bio: 87, biome: 'boreal',
    cities: [
      c('stockholm', 'Stokgolm', 'Стокгольм', 'Stokholm', 'Stockholm', 59.33, 18.07, 0.99, 28, 21, 5.4, 3.2, 72, 96, 1.46, 51, 'green'),
      c('gothenburg', 'Gyoteborg', 'Гётеборг', 'Göteborg', 'Gothenburg', 57.71, 11.97, 0.6, 12, 23, 5.9, 3.8, 67, 94, 1.42, 46, 'port'),
      c('malmo', 'Malmyo', 'Мальмё', 'Malmö', 'Malmö', 55.6, 13.0, 0.36, 12, 25, 6.6, 3.5, 69, 92, 1.4, 42, 'port'),
    ],
  },
  {
    id: 'fin', numericId: '246', iso2: 'FI', region: 'europe',
    name: { uz: 'Finlandiya', ru: 'Финляндия', tr: 'Finlandiya', en: 'Finland' },
    pop: 5.6, area: 338455, aqi: 17, pm25: 4.8, co2: 6.1, forest: 73.7, ren: 52.3, temp: 1.54, water: 96, bio: 86, biome: 'boreal',
    cities: [
      c('helsinki', 'Xelsinki', 'Хельсинки', 'Helsinki', 'Helsinki', 60.17, 24.94, 0.67, 17, 19, 5.1, 5.8, 55, 97, 1.51, 54, 'green'),
      c('tampere', 'Tampere', 'Тампере', 'Tampere', 'Tampere', 61.5, 23.79, 0.25, 95, 16, 4.4, 5.4, 58, 96, 1.54, 58, 'river'),
      c('oulu', 'Oulu', 'Оулу', 'Oulu', 'Oulu', 65.01, 25.47, 0.21, 15, 15, 4.1, 6.2, 61, 95, 1.62, 60, 'port'),
    ],
  },
  {
    id: 'dnk', numericId: '208', iso2: 'DK', region: 'europe',
    name: { uz: 'Daniya', ru: 'Дания', tr: 'Danimarka', en: 'Denmark' },
    pop: 5.9, area: 42933, aqi: 24, pm25: 7.2, co2: 4.6, forest: 15.8, ren: 81.4, temp: 1.38, water: 92, bio: 81, biome: 'coastal',
    cities: [
      c('copenhagen', 'Kopengagen', 'Копенгаген', 'Kopenhag', 'Copenhagen', 55.68, 12.57, 0.66, 14, 25, 7.4, 4.1, 84, 93, 1.36, 45, 'green'),
      c('aarhus', 'Orxus', 'Орхус', 'Aarhus', 'Aarhus', 56.16, 10.2, 0.36, 30, 22, 6.6, 4.4, 86, 92, 1.39, 43, 'port'),
    ],
  },
  {
    id: 'isl', numericId: '352', iso2: 'IS', region: 'europe',
    name: { uz: 'Islandiya', ru: 'Исландия', tr: 'İzlanda', en: 'Iceland' },
    pop: 0.39, area: 103000, aqi: 13, pm25: 3.4, co2: 8.9, forest: 2.1, ren: 99.8, temp: 1.41, water: 98, bio: 82, biome: 'boreal',
    cities: [
      c('reykjavik', 'Reykyavik', 'Рейкьявик', 'Reykjavik', 'Reykjavik', 64.15, -21.94, 0.14, 14, 14, 3.6, 8.1, 100, 99, 1.39, 48, 'green'),
      c('akureyri', 'Akureyri', 'Акюрейри', 'Akureyri', 'Akureyri', 65.68, -18.09, 0.02, 20, 11, 2.9, 7.4, 100, 99, 1.44, 52, 'port'),
    ],
  },
  {
    id: 'irl', numericId: '372', iso2: 'IE', region: 'europe',
    name: { uz: 'Irlandiya', ru: 'Ирландия', tr: 'İrlanda', en: 'Ireland' },
    pop: 5.3, area: 70273, aqi: 24, pm25: 6.9, co2: 7.2, forest: 11.6, ren: 41.5, temp: 1.18, water: 89, bio: 77, biome: 'coastal',
    cities: [
      c('dublin', 'Dublin', 'Дублин', 'Dublin', 'Dublin', 53.35, -6.26, 0.59, 20, 27, 7.6, 6.8, 43, 88, 1.19, 39, 'port'),
      c('cork', 'Kork', 'Корк', 'Cork', 'Cork', 51.9, -8.47, 0.22, 18, 21, 5.9, 6.4, 46, 90, 1.16, 44, 'port'),
    ],
  },
  {
    id: 'pol', numericId: '616', iso2: 'PL', region: 'europe',
    name: { uz: 'Polsha', ru: 'Польша', tr: 'Polonya', en: 'Poland' },
    pop: 36.8, area: 312696, aqi: 54, pm25: 17.8, co2: 8.1, forest: 31.0, ren: 26.8, temp: 1.49, water: 76, bio: 74, biome: 'temperate',
    cities: [
      c('warsaw', 'Varshava', 'Варшава', 'Varşova', 'Warsaw', 52.23, 21.01, 1.86, 113, 52, 16.8, 7.4, 28, 77, 1.48, 35, 'capital'),
      c('krakow', 'Krakov', 'Краков', 'Krakow', 'Kraków', 50.06, 19.94, 0.8, 219, 67, 22.1, 8.2, 22, 74, 1.52, 31, 'industrial'),
      c('gdansk', 'Gdansk', 'Гданьск', 'Gdansk', 'Gdańsk', 54.35, 18.65, 0.49, 13, 36, 10.9, 6.9, 39, 81, 1.41, 41, 'port'),
    ],
  },
  {
    id: 'cze', numericId: '203', iso2: 'CZ', region: 'europe',
    name: { uz: 'Chexiya', ru: 'Чехия', tr: 'Çekya', en: 'Czechia' },
    pop: 10.9, area: 78871, aqi: 44, pm25: 13.6, co2: 8.6, forest: 34.7, ren: 18.2, temp: 1.51, water: 83, bio: 76, biome: 'temperate',
    cities: [
      c('prague', 'Praga', 'Прага', 'Prag', 'Prague', 50.08, 14.44, 1.36, 235, 41, 12.4, 7.6, 21, 85, 1.49, 41, 'capital'),
      c('brno', 'Brno', 'Брно', 'Brno', 'Brno', 49.2, 16.61, 0.4, 237, 45, 13.9, 8.1, 19, 82, 1.52, 36, 'river'),
      c('ostrava', 'Ostrava', 'Острава', 'Ostrava', 'Ostrava', 49.82, 18.26, 0.28, 210, 62, 20.3, 10.8, 14, 76, 1.54, 29, 'industrial'),
    ],
  },
  {
    id: 'hun', numericId: '348', iso2: 'HU', region: 'europe',
    name: { uz: 'Vengriya', ru: 'Венгрия', tr: 'Macaristan', en: 'Hungary' },
    pop: 9.6, area: 93028, aqi: 46, pm25: 14.2, co2: 4.9, forest: 22.8, ren: 21.6, temp: 1.53, water: 79, bio: 73, biome: 'temperate',
    cities: [
      c('budapest', 'Budapesht', 'Будапешт', 'Budapeşte', 'Budapest', 47.5, 19.04, 1.67, 102, 48, 14.9, 5.1, 22, 80, 1.54, 34, 'river'),
      c('debrecen', 'Debretsen', 'Дебрецен', 'Debrecen', 'Debrecen', 47.53, 21.63, 0.2, 121, 42, 12.8, 4.4, 25, 78, 1.52, 32, 'capital'),
    ],
  },
  {
    id: 'rou', numericId: '642', iso2: 'RO', region: 'europe',
    name: { uz: 'Ruminiya', ru: 'Румыния', tr: 'Romanya', en: 'Romania' },
    pop: 19.0, area: 238397, aqi: 48, pm25: 15.1, co2: 3.9, forest: 30.1, ren: 42.7, temp: 1.48, water: 77, bio: 79, biome: 'temperate',
    cities: [
      c('bucharest', 'Buxarest', 'Бухарест', 'Bükreş', 'Bucharest', 44.43, 26.1, 1.72, 85, 58, 18.4, 4.6, 39, 75, 1.52, 26, 'capital'),
      c('cluj', 'Kluj-Napoka', 'Клуж-Напока', 'Kaloşvar', 'Cluj-Napoca', 46.77, 23.62, 0.29, 340, 39, 11.8, 3.4, 48, 82, 1.44, 37, 'alpine'),
      c('constanta', 'Konstansa', 'Констанца', 'Köstence', 'Constanța', 44.16, 28.63, 0.26, 25, 42, 12.5, 3.9, 51, 76, 1.39, 28, 'port'),
    ],
  },
  {
    id: 'bgr', numericId: '100', iso2: 'BG', region: 'europe',
    name: { uz: 'Bolgariya', ru: 'Болгария', tr: 'Bulgaristan', en: 'Bulgaria' },
    pop: 6.4, area: 110994, aqi: 52, pm25: 16.5, co2: 5.7, forest: 35.9, ren: 24.3, temp: 1.46, water: 76, bio: 78, biome: 'temperate',
    cities: [
      c('sofia', 'Sofiya', 'София', 'Sofya', 'Sofia', 42.7, 23.32, 1.28, 595, 59, 18.8, 5.4, 23, 78, 1.48, 33, 'alpine'),
      c('plovdiv', 'Plovdiv', 'Пловдив', 'Filibe', 'Plovdiv', 42.14, 24.75, 0.32, 164, 54, 17.2, 5.1, 25, 74, 1.49, 28, 'river'),
      c('varna', 'Varna', 'Варна', 'Varna', 'Varna', 43.21, 27.91, 0.31, 38, 39, 11.4, 4.7, 29, 77, 1.36, 35, 'port'),
    ],
  },
  {
    id: 'grc', numericId: '300', iso2: 'GR', region: 'europe',
    name: { uz: 'Gretsiya', ru: 'Греция', tr: 'Yunanistan', en: 'Greece' },
    pop: 10.4, area: 131957, aqi: 43, pm25: 13.1, co2: 5.1, forest: 31.7, ren: 47.6, temp: 1.47, water: 80, bio: 77, biome: 'mediterranean',
    cities: [
      c('athens', 'Afina', 'Афины', 'Atina', 'Athens', 37.98, 23.73, 3.15, 70, 49, 14.8, 5.2, 46, 81, 1.54, 22, 'capital'),
      c('thessaloniki', 'Saloniki', 'Салоники', 'Selanik', 'Thessaloniki', 40.64, 22.94, 0.81, 15, 52, 15.9, 5.0, 49, 78, 1.45, 25, 'port'),
    ],
  },
  {
    id: 'ukr', numericId: '804', iso2: 'UA', region: 'europe',
    name: { uz: 'Ukraina', ru: 'Украина', tr: 'Ukrayna', en: 'Ukraine' },
    pop: 37.0, area: 603550, aqi: 51, pm25: 16.0, co2: 3.9, forest: 16.7, ren: 16.5, temp: 1.52, water: 69, bio: 71, biome: 'temperate',
    cities: [
      c('kyiv', 'Kiyev', 'Киев', 'Kiev', 'Kyiv', 50.45, 30.52, 2.95, 179, 51, 15.8, 4.1, 18, 72, 1.51, 41, 'river'),
      c('lviv', 'Lvov', 'Львов', 'Lviv', 'Lviv', 49.84, 24.03, 0.72, 296, 40, 12.1, 3.2, 22, 76, 1.46, 38, 'capital'),
      c('odesa', 'Odessa', 'Одесса', 'Odessa', 'Odesa', 46.48, 30.72, 1.01, 50, 46, 14.0, 3.8, 25, 67, 1.44, 29, 'port'),
    ],
  },
  {
    id: 'blr', numericId: '112', iso2: 'BY', region: 'europe',
    name: { uz: 'Belarus', ru: 'Беларусь', tr: 'Belarus', en: 'Belarus' },
    pop: 9.2, area: 207600, aqi: 38, pm25: 11.4, co2: 6.0, forest: 42.8, ren: 9.4, temp: 1.53, water: 79, bio: 77, biome: 'temperate',
    cities: [
      c('minsk', 'Minsk', 'Минск', 'Minsk', 'Minsk', 53.9, 27.57, 1.99, 220, 41, 12.3, 6.2, 10, 81, 1.53, 42, 'capital'),
      c('brest', 'Brest', 'Брест', 'Brest', 'Brest', 52.1, 23.69, 0.34, 140, 33, 9.6, 5.1, 12, 80, 1.48, 45, 'river'),
    ],
  },
  {
    id: 'srb', numericId: '688', iso2: 'RS', region: 'europe',
    name: { uz: 'Serbiya', ru: 'Сербия', tr: 'Sırbistan', en: 'Serbia' },
    pop: 6.6, area: 88361, aqi: 63, pm25: 20.4, co2: 6.3, forest: 31.1, ren: 29.8, temp: 1.49, water: 73, bio: 74, biome: 'temperate',
    cities: [
      c('belgrade', 'Belgrad', 'Белград', 'Belgrad', 'Belgrade', 44.82, 20.46, 1.38, 117, 68, 22.1, 6.5, 29, 73, 1.51, 29, 'river'),
      c('novisad', 'Novi-Sad', 'Нови-Сад', 'Novi Sad', 'Novi Sad', 45.27, 19.83, 0.37, 80, 56, 18.0, 5.8, 32, 75, 1.47, 33, 'river'),
    ],
  },
  {
    id: 'hrv', numericId: '191', iso2: 'HR', region: 'europe',
    name: { uz: 'Xorvatiya', ru: 'Хорватия', tr: 'Hırvatistan', en: 'Croatia' },
    pop: 3.9, area: 56594, aqi: 36, pm25: 10.8, co2: 4.5, forest: 34.4, ren: 58.6, temp: 1.44, water: 86, bio: 81, biome: 'mediterranean',
    cities: [
      c('zagreb', 'Zagreb', 'Загреб', 'Zagreb', 'Zagreb', 45.81, 15.98, 0.77, 158, 42, 12.6, 4.8, 56, 86, 1.47, 43, 'capital'),
      c('split', 'Split', 'Сплит', 'Split', 'Split', 43.51, 16.44, 0.16, 10, 29, 8.1, 3.9, 64, 89, 1.38, 39, 'port'),
    ],
  },
  {
    id: 'svk', numericId: '703', iso2: 'SK', region: 'europe',
    name: { uz: 'Slovakiya', ru: 'Словакия', tr: 'Slovakya', en: 'Slovakia' },
    pop: 5.4, area: 49035, aqi: 42, pm25: 12.9, co2: 5.9, forest: 40.2, ren: 24.5, temp: 1.5, water: 84, bio: 78, biome: 'alpine',
    cities: [
      c('bratislava', 'Bratislava', 'Братислава', 'Bratislava', 'Bratislava', 48.15, 17.11, 0.48, 134, 41, 12.3, 5.8, 25, 85, 1.51, 41, 'river'),
      c('kosice', 'Koshitse', 'Кошице', 'Košice', 'Košice', 48.72, 21.26, 0.23, 206, 46, 14.1, 6.4, 23, 82, 1.48, 38, 'industrial'),
    ],
  },
  {
    id: 'svn', numericId: '705', iso2: 'SI', region: 'europe',
    name: { uz: 'Sloveniya', ru: 'Словения', tr: 'Slovenya', en: 'Slovenia' },
    pop: 2.1, area: 20273, aqi: 34, pm25: 10.2, co2: 6.1, forest: 58.3, ren: 38.4, temp: 1.52, water: 90, bio: 84, biome: 'alpine',
    cities: [
      c('ljubljana', 'Lyublyana', 'Любляна', 'Ljubljana', 'Ljubljana', 46.05, 14.51, 0.29, 295, 36, 10.7, 5.9, 41, 91, 1.53, 56, 'green'),
      c('maribor', 'Maribor', 'Марибор', 'Maribor', 'Maribor', 46.55, 15.65, 0.11, 275, 32, 9.6, 5.4, 44, 89, 1.5, 51, 'river'),
    ],
  },
  {
    id: 'ltu', numericId: '440', iso2: 'LT', region: 'europe',
    name: { uz: 'Litva', ru: 'Литва', tr: 'Litvanya', en: 'Lithuania' },
    pop: 2.9, area: 65300, aqi: 29, pm25: 8.6, co2: 4.8, forest: 35.1, ren: 44.2, temp: 1.48, water: 86, bio: 78, biome: 'temperate',
    cities: [
      c('vilnius', 'Vilnyus', 'Вильнюс', 'Vilnius', 'Vilnius', 54.69, 25.28, 0.59, 112, 30, 8.9, 4.5, 45, 87, 1.49, 48, 'green'),
      c('kaunas', 'Kaunas', 'Каунас', 'Kaunas', 'Kaunas', 54.9, 23.9, 0.3, 65, 28, 8.2, 4.3, 47, 86, 1.46, 44, 'river'),
    ],
  },
  {
    id: 'lva', numericId: '428', iso2: 'LV', region: 'europe',
    name: { uz: 'Latviya', ru: 'Латвия', tr: 'Letonya', en: 'Latvia' },
    pop: 1.9, area: 64589, aqi: 26, pm25: 7.8, co2: 3.7, forest: 54.1, ren: 56.8, temp: 1.47, water: 88, bio: 80, biome: 'temperate',
    cities: [
      c('riga', 'Riga', 'Рига', 'Riga', 'Riga', 56.95, 24.11, 0.61, 8, 28, 8.3, 3.8, 56, 88, 1.47, 47, 'port'),
      c('liepaja', 'Liyepaya', 'Лиепая', 'Liepāja', 'Liepāja', 56.51, 21.01, 0.07, 10, 21, 6.1, 3.1, 64, 89, 1.41, 49, 'port'),
    ],
  },
  {
    id: 'est', numericId: '233', iso2: 'EE', region: 'europe',
    name: { uz: 'Estoniya', ru: 'Эстония', tr: 'Estonya', en: 'Estonia' },
    pop: 1.4, area: 45339, aqi: 21, pm25: 5.8, co2: 7.4, forest: 57.0, ren: 38.9, temp: 1.5, water: 90, bio: 82, biome: 'boreal',
    cities: [
      c('tallinn', 'Tallin', 'Таллин', 'Tallinn', 'Tallinn', 59.44, 24.75, 0.45, 9, 22, 6.1, 6.8, 42, 91, 1.49, 49, 'port'),
      c('tartu', 'Tartu', 'Тарту', 'Tartu', 'Tartu', 58.38, 26.72, 0.1, 57, 19, 5.2, 5.9, 46, 90, 1.51, 52, 'river'),
    ],
  },
  // Asia-Pacific
  {
    id: 'pak', numericId: '586', iso2: 'PK', region: 'asia_pacific',
    name: { uz: 'Pokiston', ru: 'Пакистан', tr: 'Pakistan', en: 'Pakistan' },
    pop: 241.0, area: 881913, aqi: 138, pm25: 54.6, co2: 0.9, forest: 4.8, ren: 31.2, temp: 1.32, water: 44, bio: 58, biome: 'monsoon',
    cities: [
      c('islamabad', 'Islomobod', 'Исламабад', 'İslamabad', 'Islamabad', 33.68, 73.05, 1.24, 540, 88, 31.2, 1.2, 42, 56, 1.38, 34, 'capital'),
      c('karachi', 'Karachi', 'Карачи', 'Karaçi', 'Karachi', 24.86, 67.01, 17.6, 10, 122, 46.8, 1.4, 24, 42, 1.29, 11, 'port'),
      c('lahore', 'Lahor', 'Лахор', 'Lahor', 'Lahore', 31.52, 74.36, 13.9, 217, 168, 69.5, 1.1, 21, 41, 1.36, 14, 'industrial'),
    ],
  },
  {
    id: 'afg', numericId: '004', iso2: 'AF', region: 'asia_pacific',
    name: { uz: 'Afg‘oniston', ru: 'Афганистан', tr: 'Afganistan', en: 'Afghanistan' },
    pop: 42.2, area: 652864, aqi: 96, pm25: 36.4, co2: 0.3, forest: 1.8, ren: 82.0, temp: 1.54, water: 39, bio: 52, biome: 'arid',
    cities: [
      c('kabul', 'Kobul', 'Кабул', 'Kabil', 'Kabul', 34.56, 69.21, 4.7, 1791, 112, 42.1, 0.4, 78, 41, 1.55, 13, 'alpine'),
      c('herat', 'Hirot', 'Герат', 'Herat', 'Herat', 34.35, 62.2, 0.65, 920, 82, 29.8, 0.3, 84, 44, 1.58, 16, 'oasis'),
      c('mazar', 'Mozori-Sharif', 'Мазари-Шариф', 'Mezar-ı Şerif', 'Mazar-i-Sharif', 36.71, 67.11, 0.52, 357, 89, 32.5, 0.3, 80, 42, 1.61, 15, 'oasis'),
    ],
  },
  {
    id: 'bgd', numericId: '050', iso2: 'BD', region: 'asia_pacific',
    name: { uz: 'Bangladesh', ru: 'Бангладеш', tr: 'Bangladeş', en: 'Bangladesh' },
    pop: 173.0, area: 148460, aqi: 144, pm25: 58.2, co2: 0.6, forest: 14.5, ren: 3.1, temp: 1.24, water: 46, bio: 59, biome: 'monsoon',
    cities: [
      c('dhaka', 'Dakka', 'Дакка', 'Dakka', 'Dhaka', 23.81, 90.41, 23.2, 8, 158, 64.5, 0.8, 3, 45, 1.28, 11, 'capital'),
      c('chattogram', 'Chattogram', 'Чаттограм', 'Chittagong', 'Chattogram', 22.36, 91.78, 5.4, 29, 112, 42.6, 0.7, 5, 49, 1.21, 19, 'port'),
    ],
  },
  {
    id: 'vnm', numericId: '704', iso2: 'VN', region: 'asia_pacific',
    name: { uz: 'Vyetnam', ru: 'Вьетнам', tr: 'Vietnam', en: 'Vietnam' },
    pop: 100.3, area: 331212, aqi: 82, pm25: 27.6, co2: 3.4, forest: 42.0, ren: 41.2, temp: 1.18, water: 64, bio: 73, biome: 'tropical',
    cities: [
      c('hanoi', 'Xanoy', 'Ханой', 'Hanoi', 'Hanoi', 21.03, 105.85, 8.4, 16, 94, 32.8, 3.6, 38, 63, 1.21, 21, 'river'),
      c('hochiminh', 'Xoshimin', 'Хошимин', 'Ho Chi Minh', 'Ho Chi Minh City', 10.82, 106.63, 9.5, 19, 76, 25.4, 3.8, 43, 61, 1.17, 19, 'port'),
      c('danang', 'Danang', 'Дананг', 'Da Nang', 'Da Nang', 16.05, 108.2, 1.23, 10, 52, 16.2, 2.9, 48, 71, 1.14, 34, 'port'),
    ],
  },
  {
    id: 'tha', numericId: '764', iso2: 'TH', region: 'asia_pacific',
    name: { uz: 'Tailand', ru: 'Таиланд', tr: 'Tayland', en: 'Thailand' },
    pop: 71.8, area: 513120, aqi: 74, pm25: 24.1, co2: 3.9, forest: 31.6, ren: 18.7, temp: 1.22, water: 66, bio: 72, biome: 'tropical',
    cities: [
      c('bangkok', 'Bangkok', 'Бангкок', 'Bangkok', 'Bangkok', 13.76, 100.5, 11.2, 2, 79, 26.2, 4.4, 18, 65, 1.26, 17, 'port'),
      c('chiangmai', 'Chiangmay', 'Чиангмай', 'Chiang Mai', 'Chiang Mai', 18.79, 98.98, 1.2, 310, 84, 28.9, 2.8, 24, 71, 1.24, 36, 'alpine'),
      c('phuket', 'Pxuket', 'Пхукет', 'Phuket', 'Phuket', 7.88, 98.39, 0.42, 15, 34, 9.8, 3.2, 27, 74, 1.12, 44, 'port'),
    ],
  },
  {
    id: 'mys', numericId: '458', iso2: 'MY', region: 'asia_pacific',
    name: { uz: 'Malayziya', ru: 'Малайзия', tr: 'Malezya', en: 'Malaysia' },
    pop: 34.3, area: 330803, aqi: 54, pm25: 17.2, co2: 8.1, forest: 58.2, ren: 19.4, temp: 1.15, water: 72, bio: 80, biome: 'tropical',
    cities: [
      c('kualalumpur', 'Kuala-Lumpur', 'Куала-Лумпур', 'Kuala Lumpur', 'Kuala Lumpur', 3.14, 101.69, 8.6, 56, 58, 18.4, 8.4, 18, 73, 1.18, 33, 'capital'),
      c('penang', 'Jorjtaun', 'Джорджтаун', 'George Town', 'George Town', 5.41, 100.33, 0.79, 14, 46, 14.2, 7.6, 22, 75, 1.12, 38, 'port'),
    ],
  },
  {
    id: 'idn', numericId: '360', iso2: 'ID', region: 'asia_pacific',
    name: { uz: 'Indoneziya', ru: 'Индонезия', tr: 'Endonezya', en: 'Indonesia' },
    pop: 279.0, area: 1904569, aqi: 84, pm25: 29.4, co2: 2.5, forest: 49.1, ren: 19.6, temp: 1.14, water: 59, bio: 83, biome: 'tropical',
    cities: [
      c('jakarta', 'Jakarta', 'Джакарта', 'Cakarta', 'Jakarta', -6.21, 106.85, 11.3, 8, 98, 34.6, 3.2, 16, 54, 1.19, 12, 'port'),
      c('surabaya', 'Surabaya', 'Сурабая', 'Surabaya', 'Surabaya', -7.25, 112.75, 2.9, 5, 76, 25.1, 2.7, 21, 60, 1.15, 21, 'port'),
      c('bandung', 'Bandung', 'Бандунг', 'Bandung', 'Bandung', -6.91, 107.61, 2.5, 768, 72, 23.8, 2.4, 24, 64, 1.14, 28, 'alpine'),
    ],
  },
  {
    id: 'phl', numericId: '608', iso2: 'PH', region: 'asia_pacific',
    name: { uz: 'Filippin', ru: 'Филиппины', tr: 'Filipinler', en: 'Philippines' },
    pop: 117.3, area: 300000, aqi: 68, pm25: 21.8, co2: 1.4, forest: 24.1, ren: 22.8, temp: 1.16, water: 62, bio: 76, biome: 'tropical',
    cities: [
      c('manila', 'Manila', 'Манила', 'Manila', 'Manila', 14.6, 120.98, 14.6, 16, 79, 25.6, 1.7, 20, 60, 1.18, 14, 'port'),
      c('cebu', 'Sebu', 'Себу', 'Cebu', 'Cebu City', 10.32, 123.89, 0.99, 15, 58, 18.2, 1.3, 27, 65, 1.14, 23, 'port'),
      c('davao', 'Davao', 'Давао', 'Davao', 'Davao City', 7.19, 125.46, 1.82, 22, 46, 13.8, 1.1, 31, 69, 1.12, 34, 'port'),
    ],
  },
  {
    id: 'sgp', numericId: '702', iso2: 'SG', region: 'asia_pacific',
    name: { uz: 'Singapur', ru: 'Сингапур', tr: 'Singapur', en: 'Singapore' },
    pop: 5.9, area: 734, aqi: 42, pm25: 12.1, co2: 8.6, forest: 22.0, ren: 4.8, temp: 1.25, water: 91, bio: 69, biome: 'tropical',
    cities: [
      c('singapore', 'Singapur', 'Сингапур', 'Singapur', 'Singapore', 1.35, 103.82, 5.9, 15, 42, 12.1, 8.6, 5, 91, 1.25, 47, 'green'),
    ],
  },
  {
    id: 'twn', numericId: '158', iso2: 'TW', region: 'asia_pacific',
    name: { uz: 'Tayvan', ru: 'Тайвань', tr: 'Tayvan', en: 'Taiwan' },
    pop: 23.4, area: 36197, aqi: 52, pm25: 16.4, co2: 11.4, forest: 60.7, ren: 10.6, temp: 1.31, water: 82, bio: 78, biome: 'coastal',
    cities: [
      c('taipei', 'Taypey', 'Тайбэй', 'Taipei', 'Taipei', 25.03, 121.57, 2.5, 10, 49, 15.1, 10.2, 11, 84, 1.32, 36, 'capital'),
      c('kaohsiung', 'Gaosyun', 'Гаосюн', 'Kaohsiung', 'Kaohsiung', 22.63, 120.3, 2.7, 9, 61, 19.8, 12.8, 13, 79, 1.29, 27, 'industrial'),
    ],
  },
  {
    id: 'mng', numericId: '496', iso2: 'MN', region: 'asia_pacific',
    name: { uz: 'Mongoliya', ru: 'Монголия', tr: 'Moğolistan', en: 'Mongolia' },
    pop: 3.4, area: 1564116, aqi: 92, pm25: 34.5, co2: 8.9, forest: 9.1, ren: 10.4, temp: 1.78, water: 58, bio: 67, biome: 'steppe',
    cities: [
      c('ulaanbaatar', 'Ulan-Bator', 'Улан-Батор', 'Ulan Batur', 'Ulaanbaatar', 47.89, 106.91, 1.67, 1350, 114, 43.2, 9.6, 9, 58, 1.82, 18, 'alpine'),
      c('darkhan', 'Darxan', 'Дархан', 'Darhan', 'Darkhan', 49.49, 105.92, 0.11, 707, 68, 23.4, 8.1, 12, 60, 1.74, 24, 'industrial'),
    ],
  },
  {
    id: 'nzl', numericId: '554', iso2: 'NZ', region: 'asia_pacific',
    name: { uz: 'Yangi Zelandiya', ru: 'Новая Зеландия', tr: 'Yeni Zelanda', en: 'New Zealand' },
    pop: 5.2, area: 268021, aqi: 18, pm25: 5.2, co2: 6.1, forest: 38.6, ren: 84.5, temp: 1.09, water: 94, bio: 86, biome: 'coastal',
    cities: [
      c('auckland', 'Oklend', 'Окленд', 'Auckland', 'Auckland', -36.85, 174.76, 1.72, 26, 21, 5.8, 5.9, 82, 93, 1.08, 49, 'port'),
      c('wellington', 'Vellington', 'Веллингтон', 'Wellington', 'Wellington', -41.29, 174.78, 0.22, 12, 14, 3.9, 5.2, 91, 95, 1.06, 54, 'port'),
      c('christchurch', 'Kraystcherch', 'Крайстчерч', 'Christchurch', 'Christchurch', -43.53, 172.64, 0.39, 20, 22, 6.2, 6.1, 86, 94, 1.12, 48, 'alpine'),
    ],
  },
  {
    id: 'lka', numericId: '144', iso2: 'LK', region: 'asia_pacific',
    name: { uz: 'Shri-Lanka', ru: 'Шри-Ланка', tr: 'Sri Lanka', en: 'Sri Lanka' },
    pop: 22.0, area: 65610, aqi: 56, pm25: 18.1, co2: 1.0, forest: 34.2, ren: 48.2, temp: 1.15, water: 69, bio: 79, biome: 'tropical',
    cities: [
      c('colombo', 'Kolombo', 'Коломбо', 'Kolombo', 'Colombo', 6.93, 79.86, 0.65, 4, 62, 19.8, 1.2, 44, 68, 1.16, 29, 'port'),
      c('kandy', 'Kandi', 'Канди', 'Kandy', 'Kandy', 7.29, 80.63, 0.13, 500, 46, 14.1, 0.8, 56, 74, 1.13, 45, 'alpine'),
    ],
  },
  {
    id: 'npl', numericId: '524', iso2: 'NP', region: 'asia_pacific',
    name: { uz: 'Nepal', ru: 'Непал', tr: 'Nepal', en: 'Nepal' },
    pop: 30.9, area: 147516, aqi: 108, pm25: 40.5, co2: 0.5, forest: 41.6, ren: 96.4, temp: 1.48, water: 61, bio: 77, biome: 'alpine',
    cities: [
      c('kathmandu', 'Katmandu', 'Катманду', 'Katmandu', 'Kathmandu', 27.72, 85.32, 1.57, 1400, 126, 48.2, 0.6, 94, 58, 1.49, 19, 'alpine'),
      c('pokhara', 'Pokxara', 'Покхара', 'Pokhara', 'Pokhara', 28.21, 83.99, 0.52, 822, 68, 23.1, 0.4, 98, 72, 1.46, 41, 'alpine'),
    ],
  },
  {
    id: 'mmr', numericId: '104', iso2: 'MM', region: 'asia_pacific',
    name: { uz: 'Myanma', ru: 'Мьянма', tr: 'Myanmar', en: 'Myanmar' },
    pop: 54.6, area: 676578, aqi: 86, pm25: 30.2, co2: 0.6, forest: 43.7, ren: 54.8, temp: 1.19, water: 57, bio: 76, biome: 'monsoon',
    cities: [
      c('yangon', 'Yangon', 'Янгон', 'Yangon', 'Yangon', 16.84, 96.17, 5.6, 15, 89, 31.4, 0.8, 49, 56, 1.2, 24, 'port'),
      c('mandalay', 'Mandalay', 'Мандалай', 'Mandalay', 'Mandalay', 21.96, 96.09, 1.5, 76, 82, 28.9, 0.6, 58, 59, 1.23, 21, 'river'),
    ],
  },
  {
    id: 'khm', numericId: '116', iso2: 'KH', region: 'asia_pacific',
    name: { uz: 'Kambodja', ru: 'Камбоджа', tr: 'Kamboçya', en: 'Cambodia' },
    pop: 17.0, area: 181035, aqi: 66, pm25: 21.8, co2: 1.2, forest: 45.7, ren: 52.4, temp: 1.18, water: 58, bio: 74, biome: 'tropical',
    cities: [
      c('phnompenh', 'Pnompen', 'Пномпень', 'Phnom Penh', 'Phnom Penh', 11.56, 104.92, 2.3, 12, 71, 23.6, 1.3, 49, 57, 1.19, 22, 'river'),
      c('siemreap', 'Siyemreap', 'Сиемреап', 'Siem Reap', 'Siem Reap', 13.36, 103.86, 0.25, 18, 54, 17.4, 0.9, 56, 61, 1.16, 36, 'oasis'),
    ],
  },
  // Americas
  {
    id: 'mex', numericId: '484', iso2: 'MX', region: 'americas',
    name: { uz: 'Meksika', ru: 'Мексика', tr: 'Meksika', en: 'Mexico' },
    pop: 128.5, area: 1964375, aqi: 68, pm25: 22.1, co2: 3.7, forest: 33.8, ren: 26.4, temp: 1.38, water: 64, bio: 81, biome: 'steppe',
    cities: [
      c('mexicocity', 'Mexiko', 'Мехико', 'Meksiko', 'Mexico City', 19.43, -99.13, 22.3, 2240, 86, 26.8, 4.1, 24, 62, 1.42, 24, 'alpine'),
      c('guadalajara', 'Gvadalaxara', 'Гвадалахара', 'Guadalajara', 'Guadalajara', 20.66, -103.35, 5.4, 1566, 61, 19.4, 3.4, 31, 67, 1.36, 28, 'capital'),
      c('monterrey', 'Monterrey', 'Монтеррей', 'Monterrey', 'Monterrey', 25.69, -100.32, 5.2, 540, 74, 24.5, 4.8, 22, 58, 1.48, 21, 'industrial'),
    ],
  },
  {
    id: 'arg', numericId: '032', iso2: 'AR', region: 'americas',
    name: { uz: 'Argentina', ru: 'Аргентина', tr: 'Arjantin', en: 'Argentina' },
    pop: 46.2, area: 2780400, aqi: 38, pm25: 11.4, co2: 4.1, forest: 10.4, ren: 34.8, temp: 1.26, water: 79, bio: 76, biome: 'steppe',
    cities: [
      c('buenosaires', 'Buenos-Ayres', 'Буэнос-Айрес', 'Buenos Aires', 'Buenos Aires', -34.6, -58.38, 15.5, 25, 41, 12.2, 4.3, 33, 78, 1.25, 29, 'port'),
      c('cordoba', 'Kordova', 'Кордова', 'Córdoba', 'Córdoba', -31.42, -64.18, 1.6, 390, 36, 10.6, 3.6, 39, 80, 1.28, 34, 'alpine'),
      c('mendoza', 'Mendosa', 'Мендоса', 'Mendoza', 'Mendoza', -32.89, -68.85, 1.2, 746, 34, 9.8, 3.4, 48, 76, 1.34, 31, 'alpine'),
    ],
  },
  {
    id: 'chl', numericId: '152', iso2: 'CL', region: 'americas',
    name: { uz: 'Chili', ru: 'Чили', tr: 'Şili', en: 'Chile' },
    pop: 19.6, area: 756102, aqi: 54, pm25: 17.4, co2: 4.3, forest: 24.5, ren: 63.2, temp: 1.21, water: 81, bio: 77, biome: 'alpine',
    cities: [
      c('santiago', 'Santyago', 'Сантьяго', 'Santiago', 'Santiago', -33.45, -70.67, 6.9, 570, 68, 22.8, 4.4, 62, 81, 1.29, 25, 'alpine'),
      c('valparaiso', 'Valparaiso', 'Вальпараисо', 'Valparaíso', 'Valparaíso', -33.05, -71.61, 0.96, 18, 36, 10.4, 3.8, 67, 83, 1.15, 34, 'port'),
      c('antofagasta', 'Antofagasta', 'Антофагаста', 'Antofagasta', 'Antofagasta', -23.65, -70.4, 0.42, 40, 44, 13.6, 5.2, 71, 70, 1.24, 12, 'oasis'),
    ],
  },
  {
    id: 'col', numericId: '170', iso2: 'CO', region: 'americas',
    name: { uz: 'Kolumbiya', ru: 'Колумбия', tr: 'Kolombiya', en: 'Colombia' },
    pop: 52.2, area: 1141748, aqi: 46, pm25: 14.5, co2: 1.8, forest: 53.3, ren: 72.4, temp: 1.18, water: 77, bio: 91, biome: 'tropical',
    cities: [
      c('bogota', 'Bogota', 'Богота', 'Bogota', 'Bogotá', 4.71, -74.07, 11.5, 2640, 52, 16.4, 1.9, 71, 79, 1.21, 33, 'alpine'),
      c('medellin', 'Medellin', 'Медельин', 'Medellín', 'Medellín', 6.24, -75.58, 4.1, 1495, 48, 15.1, 1.6, 78, 81, 1.18, 38, 'alpine'),
      c('cartagena', 'Kartaxena', 'Картахена', 'Cartagena', 'Cartagena', 10.39, -75.48, 1.05, 2, 34, 9.8, 1.7, 65, 74, 1.14, 29, 'port'),
    ],
  },
  {
    id: 'per', numericId: '604', iso2: 'PE', region: 'americas',
    name: { uz: 'Peru', ru: 'Перу', tr: 'Peru', en: 'Peru' },
    pop: 34.4, area: 1285216, aqi: 59, pm25: 19.6, co2: 1.7, forest: 56.5, ren: 58.1, temp: 1.24, water: 71, bio: 88, biome: 'alpine',
    cities: [
      c('lima', 'Lima', 'Лима', 'Lima', 'Lima', -12.05, -77.04, 11.2, 154, 71, 23.8, 2.0, 54, 68, 1.22, 16, 'port'),
      c('cusco', 'Kusko', 'Куско', 'Cusco', 'Cusco', -13.53, -71.97, 0.49, 3399, 34, 9.9, 0.9, 72, 76, 1.31, 41, 'alpine'),
      c('arequipa', 'Arekipa', 'Арекипа', 'Arequipa', 'Arequipa', -16.41, -71.54, 1.1, 2335, 51, 16.2, 1.5, 66, 71, 1.27, 25, 'alpine'),
    ],
  },
  {
    id: 'ven', numericId: '862', iso2: 'VE', region: 'americas',
    name: { uz: 'Venesuela', ru: 'Венесуэла', tr: 'Venezuela', en: 'Venezuela' },
    pop: 28.8, area: 916445, aqi: 49, pm25: 15.4, co2: 3.6, forest: 52.4, ren: 68.5, temp: 1.21, water: 65, bio: 84, biome: 'tropical',
    cities: [
      c('caracas', 'Karakas', 'Каракас', 'Caracas', 'Caracas', 10.48, -66.9, 2.9, 900, 52, 16.2, 3.4, 69, 66, 1.22, 34, 'capital'),
      c('maracaibo', 'Marakaybo', 'Маракайбо', 'Maracaibo', 'Maracaibo', 10.65, -71.63, 2.2, 6, 56, 17.8, 4.9, 61, 61, 1.26, 21, 'port'),
    ],
  },
  {
    id: 'ecu', numericId: '218', iso2: 'EC', region: 'americas',
    name: { uz: 'Ekvador', ru: 'Эквадор', tr: 'Ekvador', en: 'Ecuador' },
    pop: 18.2, area: 283561, aqi: 41, pm25: 12.6, co2: 2.3, forest: 50.2, ren: 77.4, temp: 1.19, water: 75, bio: 89, biome: 'tropical',
    cities: [
      c('quito', 'Kito', 'Кито', 'Quito', 'Quito', -0.18, -78.47, 2.8, 2850, 44, 13.5, 2.2, 79, 78, 1.21, 39, 'alpine'),
      c('guayaquil', 'Guayakil', 'Гуаякиль', 'Guayaquil', 'Guayaquil', -2.17, -79.92, 3.1, 4, 48, 14.9, 2.5, 74, 71, 1.18, 27, 'port'),
    ],
  },
  {
    id: 'bol', numericId: '068', iso2: 'BO', region: 'americas',
    name: { uz: 'Boliviya', ru: 'Боливия', tr: 'Bolivya', en: 'Bolivia' },
    pop: 12.4, area: 1098581, aqi: 54, pm25: 17.8, co2: 1.9, forest: 46.9, ren: 36.2, temp: 1.28, water: 68, bio: 85, biome: 'alpine',
    cities: [
      c('lapaz', 'La-Pas', 'Ла-Пас', 'La Paz', 'La Paz', -16.5, -68.15, 1.9, 3640, 56, 18.2, 1.8, 41, 71, 1.32, 23, 'alpine'),
      c('santacruz', 'Santa-Krus', 'Санта-Крус', 'Santa Cruz', 'Santa Cruz', -17.78, -63.18, 1.9, 416, 52, 16.9, 2.1, 32, 67, 1.25, 34, 'tropical' as unknown as CityRole),
    ],
  },
  {
    id: 'ury', numericId: '858', iso2: 'UY', region: 'americas',
    name: { uz: 'Urugvay', ru: 'Уругвай', tr: 'Uruguay', en: 'Uruguay' },
    pop: 3.4, area: 176215, aqi: 24, pm25: 7.1, co2: 2.1, forest: 11.6, ren: 94.8, temp: 1.18, water: 86, bio: 74, biome: 'coastal',
    cities: [
      c('montevideo', 'Montevideo', 'Монтевидео', 'Montevideo', 'Montevideo', -34.9, -56.16, 1.38, 43, 25, 7.3, 2.2, 95, 86, 1.18, 41, 'port'),
      c('salto', 'Salto', 'Сальто', 'Salto', 'Salto', -31.38, -57.96, 0.11, 48, 21, 5.9, 1.7, 97, 87, 1.19, 44, 'river'),
    ],
  },
  {
    id: 'pry', numericId: '600', iso2: 'PY', region: 'americas',
    name: { uz: 'Paragvay', ru: 'Парагвай', tr: 'Paraguay', en: 'Paraguay' },
    pop: 6.9, area: 406752, aqi: 42, pm25: 13.4, co2: 1.3, forest: 40.5, ren: 99.7, temp: 1.27, water: 73, bio: 75, biome: 'steppe',
    cities: [
      c('asuncion', 'Asunson', 'Асунсьон', 'Asunción', 'Asunción', -25.26, -57.58, 0.53, 43, 44, 14.1, 1.4, 100, 74, 1.28, 34, 'river'),
      c('cde', 'Syudad-del-Este', 'Сьюдад-дель-Эсте', 'Ciudad del Este', 'Ciudad del Este', -25.51, -54.61, 0.31, 185, 38, 11.8, 1.2, 100, 76, 1.24, 39, 'river'),
    ],
  },
  {
    id: 'cri', numericId: '188', iso2: 'CR', region: 'americas',
    name: { uz: 'Kosta-Rika', ru: 'Коста-Рика', tr: 'Kosta Rika', en: 'Costa Rica' },
    pop: 5.2, area: 51100, aqi: 27, pm25: 7.9, co2: 1.6, forest: 59.4, ren: 98.6, temp: 1.12, water: 88, bio: 93, biome: 'tropical',
    cities: [
      c('sanjose', 'San-Xose', 'Сан-Хосе', 'San José', 'San José', 9.93, -84.09, 0.35, 1172, 31, 8.8, 1.7, 98, 88, 1.14, 44, 'green'),
      c('liberia', 'Liberiya', 'Либерия', 'Liberia', 'Liberia', 10.63, -85.44, 0.08, 144, 21, 5.8, 1.2, 99, 86, 1.11, 52, 'oasis'),
    ],
  },
  {
    id: 'cub', numericId: '192', iso2: 'CU', region: 'americas',
    name: { uz: 'Kuba', ru: 'Куба', tr: 'Küba', en: 'Cuba' },
    pop: 11.1, area: 109884, aqi: 35, pm25: 10.4, co2: 2.2, forest: 31.2, ren: 5.6, temp: 1.17, water: 73, bio: 78, biome: 'coastal',
    cities: [
      c('havana', 'Gavana', 'Гавана', 'Havana', 'Havana', 23.11, -82.37, 2.13, 59, 39, 11.6, 2.5, 6, 74, 1.18, 29, 'port'),
      c('santiagocu', 'Santyago-de-Kuba', 'Сантьяго-де-Куба', 'Santiago de Cuba', 'Santiago de Cuba', 20.02, -75.82, 0.51, 82, 31, 8.9, 1.8, 7, 72, 1.15, 34, 'port'),
    ],
  },
  // Middle East & Africa
  {
    id: 'irn', numericId: '364', iso2: 'IR', region: 'mea',
    name: { uz: 'Eron', ru: 'Иран', tr: 'İran', en: 'Iran' },
    pop: 89.2, area: 1648195, aqi: 86, pm25: 30.8, co2: 8.4, forest: 6.6, ren: 6.8, temp: 1.61, water: 53, bio: 62, biome: 'arid',
    cities: [
      c('tehran', 'Tehron', 'Тегеран', 'Tahran', 'Tehran', 35.69, 51.39, 9.4, 1189, 106, 38.4, 9.1, 6, 56, 1.66, 17, 'alpine'),
      c('isfahan', 'Isfahon', 'Исфахан', 'İsfahan', 'Isfahan', 32.65, 51.67, 2.2, 1574, 84, 29.8, 8.2, 8, 50, 1.62, 19, 'oasis'),
      c('mashhad', 'Mashhad', 'Мешхед', 'Meşhed', 'Mashhad', 36.26, 59.62, 3.3, 995, 79, 27.6, 7.6, 7, 54, 1.59, 21, 'steppe' as unknown as CityRole),
    ],
  },
  {
    id: 'sau', numericId: '682', iso2: 'SA', region: 'mea',
    name: { uz: 'Saudiya Arabistoni', ru: 'Саудовская Аравия', tr: 'Suudi Arabistan', en: 'Saudi Arabia' },
    pop: 36.9, area: 2149690, aqi: 91, pm25: 34.2, co2: 18.2, forest: 0.5, ren: 4.1, temp: 1.68, water: 62, bio: 54, biome: 'arid',
    cities: [
      c('riyadh', 'Ar-Riyod', 'Эр-Рияд', 'Riyad', 'Riyadh', 24.71, 46.68, 7.6, 612, 98, 36.8, 18.9, 5, 64, 1.72, 14, 'oasis'),
      c('jeddah', 'Jidda', 'Джидда', 'Cidde', 'Jeddah', 21.49, 39.19, 4.7, 12, 84, 31.1, 16.4, 4, 62, 1.58, 12, 'port'),
      c('dammam', 'Dammom', 'Даммам', 'Dammam', 'Dammam', 26.42, 50.09, 1.5, 10, 96, 35.9, 21.4, 3, 60, 1.69, 11, 'industrial'),
    ],
  },
  {
    id: 'irq', numericId: '368', iso2: 'IQ', region: 'mea',
    name: { uz: 'Iroq', ru: 'Ирак', tr: 'Irak', en: 'Iraq' },
    pop: 45.5, area: 438317, aqi: 108, pm25: 41.2, co2: 4.4, forest: 1.9, ren: 3.2, temp: 1.69, water: 45, bio: 51, biome: 'arid',
    cities: [
      c('baghdad', 'Bag‘dod', 'Багдад', 'Bağdat', 'Baghdad', 33.31, 44.36, 7.7, 34, 116, 44.5, 4.6, 2, 46, 1.72, 12, 'river'),
      c('basra', 'Basra', 'Басра', 'Basra', 'Basra', 30.51, 47.78, 1.5, 5, 118, 45.2, 5.8, 2, 41, 1.74, 10, 'port'),
      c('erbil', 'Erbil', 'Эрбиль', 'Erbil', 'Erbil', 36.19, 44.01, 1.0, 414, 86, 31.2, 3.5, 6, 52, 1.61, 18, 'oasis'),
    ],
  },
  {
    id: 'isr', numericId: '376', iso2: 'IL', region: 'mea',
    name: { uz: 'Isroil', ru: 'Израиль', tr: 'İsrail', en: 'Israel' },
    pop: 9.7, area: 22072, aqi: 49, pm25: 15.6, co2: 6.2, forest: 7.1, ren: 12.4, temp: 1.54, water: 83, bio: 69, biome: 'mediterranean',
    cities: [
      c('telaviv', 'Tel-Aviv', 'Тель-Авив', 'Tel Aviv', 'Tel Aviv', 32.09, 34.78, 1.4, 5, 51, 16.2, 6.4, 13, 84, 1.52, 26, 'port'),
      c('haifa', 'Xayfa', 'Хайфа', 'Hayfa', 'Haifa', 32.79, 34.99, 0.29, 28, 46, 14.5, 6.1, 14, 83, 1.49, 31, 'port'),
    ],
  },
  {
    id: 'jor', numericId: '400', iso2: 'JO', region: 'mea',
    name: { uz: 'Iordaniya', ru: 'Иордания', tr: 'Ürdün', en: 'Jordan' },
    pop: 11.3, area: 89342, aqi: 66, pm25: 22.8, co2: 2.3, forest: 1.1, ren: 26.8, temp: 1.52, water: 58, bio: 61, biome: 'arid',
    cities: [
      c('amman', 'Amman', 'Амман', 'Amman', 'Amman', 31.95, 35.91, 4.1, 777, 68, 23.4, 2.4, 27, 58, 1.53, 16, 'capital'),
      c('aqaba', 'Aqaba', 'Акаба', 'Akabe', 'Aqaba', 29.53, 35.01, 0.21, 6, 56, 18.6, 2.1, 31, 62, 1.48, 15, 'port'),
    ],
  },
  {
    id: 'qat', numericId: '634', iso2: 'QA', region: 'mea',
    name: { uz: 'Qatar', ru: 'Катар', tr: 'Katar', en: 'Qatar' },
    pop: 2.7, area: 11586, aqi: 84, pm25: 31.2, co2: 32.4, forest: 0.1, ren: 5.4, temp: 1.66, water: 72, bio: 49, biome: 'arid',
    cities: [
      c('doha', 'Doxa', 'Доха', 'Doha', 'Doha', 25.29, 51.53, 1.19, 10, 84, 31.2, 32.4, 6, 72, 1.66, 16, 'port'),
    ],
  },
  {
    id: 'omn', numericId: '512', iso2: 'OM', region: 'mea',
    name: { uz: 'Ummon', ru: 'Оман', tr: 'Umman', en: 'Oman' },
    pop: 4.6, area: 309500, aqi: 64, pm25: 22.1, co2: 15.8, forest: 0.1, ren: 4.2, temp: 1.48, water: 69, bio: 63, biome: 'arid',
    cities: [
      c('muscat', 'Maskat', 'Маскат', 'Maskat', 'Muscat', 23.59, 58.38, 1.5, 12, 66, 22.8, 15.9, 5, 71, 1.49, 19, 'port'),
      c('salalah', 'Salola', 'Салала', 'Salalah', 'Salalah', 17.02, 54.09, 0.36, 21, 46, 14.8, 11.2, 6, 72, 1.32, 26, 'port'),
    ],
  },
  {
    id: 'mar', numericId: '504', iso2: 'MA', region: 'mea',
    name: { uz: 'Marokash', ru: 'Марокко', tr: 'Fas', en: 'Morocco' },
    pop: 37.8, area: 446550, aqi: 54, pm25: 17.6, co2: 1.9, forest: 12.9, ren: 38.4, temp: 1.47, water: 64, bio: 70, biome: 'mediterranean',
    cities: [
      c('casablanca', 'Kasablanka', 'Касабланка', 'Kazablanka', 'Casablanca', 33.57, -7.59, 3.8, 27, 62, 20.1, 2.3, 35, 65, 1.42, 20, 'port'),
      c('rabat', 'Rabot', 'Рабат', 'Rabat', 'Rabat', 34.02, -6.84, 0.58, 35, 44, 13.8, 1.8, 41, 70, 1.38, 34, 'port'),
      c('marrakesh', 'Marokash', 'Марракеш', 'Marakeş', 'Marrakesh', 31.63, -7.98, 1.0, 466, 56, 18.4, 1.6, 48, 59, 1.58, 24, 'oasis'),
    ],
  },
  {
    id: 'dza', numericId: '012', iso2: 'DZ', region: 'mea',
    name: { uz: 'Jazoir', ru: 'Алжир', tr: 'Cezayir', en: 'Algeria' },
    pop: 45.6, area: 2381741, aqi: 63, pm25: 21.4, co2: 3.9, forest: 0.8, ren: 2.4, temp: 1.56, water: 59, bio: 61, biome: 'arid',
    cities: [
      c('algiers', 'Jazoir', 'Алжир', 'Cezayir', 'Algiers', 36.75, 3.06, 2.9, 30, 66, 22.1, 4.1, 2, 62, 1.49, 22, 'port'),
      c('oran', 'Oran', 'Оран', 'Oran', 'Oran', 35.7, -0.63, 1.1, 100, 61, 20.2, 3.8, 3, 58, 1.52, 19, 'port'),
      c('constantine', 'Konstantina', 'Константина', 'Konstantine', 'Constantine', 36.37, 6.61, 0.45, 694, 52, 16.9, 3.2, 4, 61, 1.54, 24, 'alpine'),
    ],
  },
  {
    id: 'tun', numericId: '788', iso2: 'TN', region: 'mea',
    name: { uz: 'Tunis', ru: 'Тунис', tr: 'Tunus', en: 'Tunisia' },
    pop: 12.5, area: 163610, aqi: 54, pm25: 17.8, co2: 2.6, forest: 4.5, ren: 5.8, temp: 1.51, water: 63, bio: 65, biome: 'mediterranean',
    cities: [
      c('tunis', 'Tunis', 'Тунис', 'Tunus', 'Tunis', 36.81, 10.18, 2.4, 14, 56, 18.2, 2.7, 6, 65, 1.49, 23, 'port'),
      c('sfax', 'Sfaks', 'Сфакс', 'Sfaks', 'Sfax', 34.74, 10.76, 0.33, 21, 59, 19.6, 2.9, 5, 59, 1.53, 18, 'industrial'),
    ],
  },
  {
    id: 'zaf', numericId: '710', iso2: 'ZA', region: 'mea',
    name: { uz: 'Janubiy Afrika', ru: 'ЮАР', tr: 'Güney Afrika', en: 'South Africa' },
    pop: 60.4, area: 1221037, aqi: 58, pm25: 19.2, co2: 6.9, forest: 14.0, ren: 14.6, temp: 1.39, water: 67, bio: 82, biome: 'steppe',
    cities: [
      c('johannesburg', 'Yoxannesburg', 'Йоханнесбург', 'Johannesburg', 'Johannesburg', -26.2, 28.05, 6.2, 1753, 68, 22.8, 7.6, 12, 68, 1.44, 29, 'alpine'),
      c('capetown', 'Keyptaun', 'Кейптаун', 'Cape Town', 'Cape Town', -33.92, 18.42, 4.9, 25, 36, 10.4, 5.4, 19, 75, 1.28, 38, 'port'),
      c('durban', 'Durban', 'Дурбан', 'Durban', 'Durban', -29.86, 31.02, 3.2, 20, 48, 15.1, 6.1, 15, 69, 1.26, 34, 'port'),
    ],
  },
  {
    id: 'nga', numericId: '566', iso2: 'NG', region: 'mea',
    name: { uz: 'Nigeriya', ru: 'Нигерия', tr: 'Nijerya', en: 'Nigeria' },
    pop: 223.8, area: 923768, aqi: 96, pm25: 35.4, co2: 0.6, forest: 23.6, ren: 22.4, temp: 1.29, water: 47, bio: 69, biome: 'tropical',
    cities: [
      c('lagos', 'Lagos', 'Лагос', 'Lagos', 'Lagos', 6.52, 3.38, 15.9, 11, 102, 37.8, 0.8, 14, 46, 1.26, 14, 'port'),
      c('abuja', 'Abuja', 'Абуджа', 'Abuja', 'Abuja', 9.08, 7.4, 3.8, 476, 76, 26.2, 0.6, 26, 55, 1.32, 32, 'capital'),
      c('kano', 'Kano', 'Кано', 'Kano', 'Kano', 12.0, 8.59, 4.3, 481, 114, 43.4, 0.5, 22, 44, 1.39, 16, 'oasis'),
    ],
  },
  {
    id: 'eth', numericId: '231', iso2: 'ET', region: 'mea',
    name: { uz: 'Efiopiya', ru: 'Эфиопия', tr: 'Etiyopya', en: 'Ethiopia' },
    pop: 126.5, area: 1104300, aqi: 64, pm25: 21.5, co2: 0.2, forest: 15.1, ren: 96.8, temp: 1.35, water: 52, bio: 74, biome: 'alpine',
    cities: [
      c('addisababa', 'Addis-Abeba', 'Аддис-Абеба', 'Addis Ababa', 'Addis Ababa', 9.03, 38.74, 5.4, 2355, 72, 24.1, 0.2, 97, 56, 1.34, 28, 'alpine'),
      c('diredawa', 'Dire-Dava', 'Дыре-Дауа', 'Dire Dawa', 'Dire Dawa', 9.6, 41.85, 0.48, 1276, 61, 20.1, 0.2, 95, 51, 1.39, 22, 'oasis'),
    ],
  },
  {
    id: 'tza', numericId: '834', iso2: 'TZ', region: 'mea',
    name: { uz: 'Tanzaniya', ru: 'Танзания', tr: 'Tanzanya', en: 'Tanzania' },
    pop: 67.4, area: 945087, aqi: 46, pm25: 14.8, co2: 0.2, forest: 51.0, ren: 41.2, temp: 1.24, water: 58, bio: 84, biome: 'tropical',
    cities: [
      c('daressalaam', 'Dor-us-Salom', 'Дар-эс-Салам', 'Darüsselam', 'Dar es Salaam', -6.79, 39.21, 7.8, 14, 56, 18.2, 0.3, 38, 57, 1.22, 27, 'port'),
      c('dodoma', 'Dodoma', 'Додома', 'Dodoma', 'Dodoma', -6.16, 35.75, 0.77, 1120, 41, 12.9, 0.2, 46, 61, 1.27, 35, 'capital'),
      c('arusha', 'Arusha', 'Аруша', 'Arusha', 'Arusha', -3.39, 36.68, 0.62, 1400, 34, 10.1, 0.2, 54, 66, 1.25, 44, 'alpine'),
    ],
  },
  {
    id: 'gha', numericId: '288', iso2: 'GH', region: 'mea',
    name: { uz: 'Gana', ru: 'Гана', tr: 'Gana', en: 'Ghana' },
    pop: 34.1, area: 238533, aqi: 68, pm25: 22.9, co2: 0.6, forest: 35.1, ren: 36.4, temp: 1.26, water: 59, bio: 72, biome: 'tropical',
    cities: [
      c('accra', 'Akkra', 'Аккра', 'Akra', 'Accra', 5.6, -0.19, 2.7, 61, 74, 25.1, 0.7, 34, 59, 1.25, 22, 'port'),
      c('kumasi', 'Kumasi', 'Кумаси', 'Kumasi', 'Kumasi', 6.69, -1.62, 3.8, 250, 62, 20.4, 0.5, 41, 61, 1.27, 29, 'capital'),
    ],
  },
  {
    id: 'sen', numericId: '686', iso2: 'SN', region: 'mea',
    name: { uz: 'Senegal', ru: 'Сенегал', tr: 'Senegal', en: 'Senegal' },
    pop: 17.8, area: 196722, aqi: 69, pm25: 24.2, co2: 0.7, forest: 41.9, ren: 28.4, temp: 1.33, water: 57, bio: 68, biome: 'arid',
    cities: [
      c('dakar', 'Dakar', 'Дакар', 'Dakar', 'Dakar', 14.72, -17.47, 3.9, 22, 72, 25.1, 0.9, 27, 58, 1.29, 18, 'port'),
      c('saintlouis', 'Sen-Lui', 'Сен-Луи', 'Saint-Louis', 'Saint-Louis', 16.02, -16.49, 0.26, 4, 61, 20.8, 0.5, 33, 55, 1.36, 22, 'port'),
    ],
  },
  {
    id: 'cod', numericId: '180', iso2: 'CD', region: 'mea',
    name: { uz: 'Kongo DR', ru: 'ДР Конго', tr: 'Kongo DC', en: 'DR Congo' },
    pop: 102.3, area: 2344858, aqi: 66, pm25: 22.1, co2: 0.1, forest: 55.6, ren: 98.2, temp: 1.21, water: 49, bio: 89, biome: 'tropical',
    cities: [
      c('kinshasa', 'Kinshasa', 'Киншаса', 'Kinşasa', 'Kinshasa', -4.32, 15.31, 16.3, 240, 74, 24.8, 0.1, 98, 48, 1.21, 24, 'river'),
      c('lubumbashi', 'Lubumbashi', 'Лубумбаши', 'Lubumbashi', 'Lubumbashi', -11.69, 27.48, 2.8, 1208, 61, 20.2, 0.2, 97, 52, 1.23, 28, 'industrial'),
    ],
  },
];

// Additional major countries (concise single-capital + key regional city coverage)
const MORE_COUNTRIES: CompactCountrySpec[] = [
  {
    id: 'ago', numericId: '024', iso2: 'AO', region: 'mea',
    name: { uz: 'Angola', ru: 'Ангола', tr: 'Angola', en: 'Angola' },
    pop: 36.7, area: 1246700, aqi: 59, pm25: 19.4, co2: 0.6, forest: 53.4, ren: 72.1, temp: 1.25, water: 53, bio: 76, biome: 'tropical',
    cities: [
      c('luanda', 'Luanda', 'Луанда', 'Luanda', 'Luanda', -8.84, 13.23, 9.3, 6, 64, 21.1, 0.8, 70, 52, 1.24, 19, 'port'),
      c('benguela', 'Bengela', 'Бенгела', 'Benguela', 'Benguela', -12.58, 13.41, 0.65, 18, 48, 15.6, 0.5, 76, 56, 1.22, 27, 'port'),
    ],
  },
  {
    id: 'zmb', numericId: '894', iso2: 'ZM', region: 'mea',
    name: { uz: 'Zambiya', ru: 'Замбия', tr: 'Zambiya', en: 'Zambia' },
    pop: 20.6, area: 752618, aqi: 48, pm25: 15.6, co2: 0.4, forest: 60.3, ren: 87.4, temp: 1.29, water: 58, bio: 78, biome: 'steppe',
    cities: [
      c('lusaka', 'Lusaka', 'Лусака', 'Lusaka', 'Lusaka', -15.39, 28.32, 3.1, 1279, 52, 16.9, 0.5, 86, 58, 1.3, 31, 'capital'),
      c('ndola', 'Ndola', 'Ндола', 'Ndola', 'Ndola', -12.96, 28.64, 0.62, 1270, 49, 15.8, 0.4, 89, 60, 1.28, 35, 'industrial'),
    ],
  },
  {
    id: 'zwe', numericId: '716', iso2: 'ZW', region: 'mea',
    name: { uz: 'Zimbabve', ru: 'Зимбабве', tr: 'Zimbabve', en: 'Zimbabwe' },
    pop: 16.7, area: 390757, aqi: 51, pm25: 16.8, co2: 0.6, forest: 45.1, ren: 54.2, temp: 1.31, water: 56, bio: 75, biome: 'steppe',
    cities: [
      c('harare', 'Xarare', 'Хараре', 'Harare', 'Harare', -17.83, 31.05, 1.6, 1490, 54, 17.6, 0.7, 52, 57, 1.32, 34, 'capital'),
      c('bulawayo', 'Bulavayo', 'Булавайо', 'Bulawayo', 'Bulawayo', -20.13, 28.63, 0.67, 1358, 46, 14.8, 0.5, 58, 54, 1.31, 32, 'oasis'),
    ],
  },
  {
    id: 'moz', numericId: '508', iso2: 'MZ', region: 'mea',
    name: { uz: 'Mozambik', ru: 'Мозамбик', tr: 'Mozambik', en: 'Mozambique' },
    pop: 33.9, area: 801590, aqi: 44, pm25: 14.1, co2: 0.3, forest: 46.7, ren: 84.5, temp: 1.24, water: 54, bio: 79, biome: 'tropical',
    cities: [
      c('maputo', 'Maputu', 'Мапуту', 'Maputo', 'Maputo', -25.97, 32.57, 1.13, 47, 48, 15.4, 0.4, 82, 55, 1.24, 28, 'port'),
      c('beira', 'Beyra', 'Бейра', 'Beira', 'Beira', -19.84, 34.84, 0.59, 14, 41, 13.1, 0.3, 86, 52, 1.22, 31, 'port'),
    ],
  },
  {
    id: 'mdg', numericId: '450', iso2: 'MG', region: 'mea',
    name: { uz: 'Madagaskar', ru: 'Мадагаскар', tr: 'Madagaskar', en: 'Madagascar' },
    pop: 30.3, area: 587041, aqi: 49, pm25: 15.8, co2: 0.1, forest: 21.4, ren: 48.2, temp: 1.19, water: 49, bio: 86, biome: 'tropical',
    cities: [
      c('antananarivo', 'Antananarivu', 'Антананариву', 'Antananarivo', 'Antananarivo', -18.88, 47.51, 3.8, 1276, 59, 19.2, 0.2, 46, 51, 1.2, 23, 'alpine'),
      c('toamasina', 'Toamasina', 'Туамасина', 'Toamasina', 'Toamasina', -18.15, 49.4, 0.36, 5, 36, 11.2, 0.1, 52, 53, 1.16, 34, 'port'),
    ],
  },
  {
    id: 'nam', numericId: '516', iso2: 'NA', region: 'mea',
    name: { uz: 'Namibiya', ru: 'Намибия', tr: 'Namibya', en: 'Namibia' },
    pop: 2.6, area: 825615, aqi: 31, pm25: 9.4, co2: 1.6, forest: 8.1, ren: 74.2, temp: 1.38, water: 66, bio: 73, biome: 'arid',
    cities: [
      c('windhoek', 'Vindxuk', 'Виндхук', 'Windhoek', 'Windhoek', -22.56, 17.07, 0.49, 1655, 33, 9.8, 1.7, 76, 68, 1.39, 26, 'alpine'),
      c('walvisbay', 'Uolfish-Bey', 'Уолфиш-Бей', 'Walvis Bay', 'Walvis Bay', -22.96, 14.51, 0.1, 6, 28, 8.2, 1.4, 71, 64, 1.24, 14, 'port'),
    ],
  },
  {
    id: 'bwa', numericId: '072', iso2: 'BW', region: 'mea',
    name: { uz: 'Botsvana', ru: 'Ботсвана', tr: 'Botsvana', en: 'Botswana' },
    pop: 2.7, area: 581730, aqi: 34, pm25: 10.6, co2: 2.6, forest: 26.9, ren: 12.4, temp: 1.42, water: 65, bio: 79, biome: 'arid',
    cities: [
      c('gaborone', 'Gaborone', 'Габороне', 'Gaborone', 'Gaborone', -24.63, 25.92, 0.28, 1014, 38, 11.8, 2.8, 14, 66, 1.43, 28, 'capital'),
      c('maun', 'Maun', 'Маун', 'Maun', 'Maun', -19.99, 23.42, 0.08, 945, 24, 7.2, 1.9, 18, 69, 1.41, 41, 'oasis'),
    ],
  },
  {
    id: 'uga', numericId: '800', iso2: 'UG', region: 'mea',
    name: { uz: 'Uganda', ru: 'Уганда', tr: 'Uganda', en: 'Uganda' },
    pop: 48.6, area: 241550, aqi: 68, pm25: 22.9, co2: 0.1, forest: 11.7, ren: 91.4, temp: 1.28, water: 56, bio: 78, biome: 'tropical',
    cities: [
      c('kampala', 'Kampala', 'Кампала', 'Kampala', 'Kampala', 0.35, 32.58, 3.8, 1190, 76, 25.4, 0.2, 91, 56, 1.28, 26, 'capital'),
      c('entebbe', 'Entebbe', 'Энтеббе', 'Entebbe', 'Entebbe', 0.05, 32.46, 0.09, 1180, 48, 15.2, 0.1, 93, 62, 1.25, 42, 'river'),
    ],
  },
  {
    id: 'rwa', numericId: '646', iso2: 'RW', region: 'mea',
    name: { uz: 'Ruanda', ru: 'Руанда', tr: 'Ruanda', en: 'Rwanda' },
    pop: 14.1, area: 26338, aqi: 54, pm25: 17.6, co2: 0.1, forest: 30.4, ren: 54.6, temp: 1.29, water: 67, bio: 77, biome: 'alpine',
    cities: [
      c('kigali', 'Kigali', 'Кигали', 'Kigali', 'Kigali', -1.94, 30.06, 1.26, 1567, 56, 18.2, 0.1, 56, 68, 1.29, 39, 'green'),
      c('rubavu', 'Rubavu', 'Рубаву', 'Rubavu', 'Rubavu', -1.68, 29.26, 0.15, 1480, 41, 12.8, 0.1, 61, 71, 1.26, 46, 'alpine'),
    ],
  },
  {
    id: 'civ', numericId: '384', iso2: 'CI', region: 'mea',
    name: { uz: 'Kot-d’Ivuar', ru: 'Кот-д’Ивуар', tr: 'Fildişi Sahili', en: "Côte d'Ivoire" },
    pop: 28.9, area: 322463, aqi: 66, pm25: 22.4, co2: 0.4, forest: 9.2, ren: 29.8, temp: 1.24, water: 55, bio: 71, biome: 'tropical',
    cities: [
      c('abidjan', 'Abidjan', 'Абиджан', 'Abidjan', 'Abidjan', 5.36, -4.01, 5.7, 18, 72, 24.4, 0.5, 28, 55, 1.23, 21, 'port'),
      c('yamoussoukro', 'Yamusukro', 'Ямусукро', 'Yamoussoukro', 'Yamoussoukro', 6.82, -5.28, 0.42, 210, 54, 17.8, 0.3, 34, 58, 1.26, 33, 'capital'),
    ],
  },
  {
    id: 'cmr', numericId: '120', iso2: 'CM', region: 'mea',
    name: { uz: 'Kamerun', ru: 'Камерун', tr: 'Kamerun', en: 'Cameroon' },
    pop: 28.6, area: 475442, aqi: 72, pm25: 24.8, co2: 0.3, forest: 43.0, ren: 76.2, temp: 1.26, water: 54, bio: 80, biome: 'tropical',
    cities: [
      c('yaounde', 'Yaunde', 'Яунде', 'Yaoundé', 'Yaoundé', 3.85, 11.5, 4.5, 726, 71, 24.2, 0.3, 78, 56, 1.26, 29, 'capital'),
      c('douala', 'Duala', 'Дуала', 'Douala', 'Douala', 4.05, 9.77, 4.1, 13, 78, 26.8, 0.4, 73, 52, 1.24, 21, 'port'),
    ],
  },
  {
    id: 'sdn', numericId: '729', iso2: 'SD', region: 'mea',
    name: { uz: 'Sudan', ru: 'Судан', tr: 'Sudan', en: 'Sudan' },
    pop: 48.1, area: 1886068, aqi: 89, pm25: 33.4, co2: 0.5, forest: 9.8, ren: 61.2, temp: 1.56, water: 46, bio: 58, biome: 'arid',
    cities: [
      c('khartoum', 'Xartum', 'Хартум', 'Hartum', 'Khartoum', 15.5, 32.56, 6.3, 381, 96, 36.2, 0.6, 58, 46, 1.58, 13, 'river'),
      c('portsudan', 'Port-Sudan', 'Порт-Судан', 'Port Sudan', 'Port Sudan', 19.62, 37.22, 0.58, 4, 74, 26.4, 0.4, 52, 48, 1.49, 11, 'port'),
    ],
  },
  {
    id: 'lby', numericId: '434', iso2: 'LY', region: 'mea',
    name: { uz: 'Liviya', ru: 'Ливия', tr: 'Libya', en: 'Libya' },
    pop: 6.9, area: 1759540, aqi: 78, pm25: 27.9, co2: 8.8, forest: 0.1, ren: 0.8, temp: 1.59, water: 52, bio: 49, biome: 'arid',
    cities: [
      c('tripoli', 'Tripoli', 'Триполи', 'Trablus', 'Tripoli', 32.89, 13.19, 1.2, 21, 79, 28.4, 8.9, 1, 54, 1.56, 15, 'port'),
      c('benghazi', 'Beng‘ozi', 'Бенгази', 'Bingazi', 'Benghazi', 32.12, 20.07, 0.65, 11, 74, 26.2, 8.4, 1, 51, 1.58, 14, 'port'),
    ],
  },
  {
    id: 'yem', numericId: '887', iso2: 'YE', region: 'mea',
    name: { uz: 'Yaman', ru: 'Йемен', tr: 'Yemen', en: 'Yemen' },
    pop: 34.4, area: 527968, aqi: 84, pm25: 30.2, co2: 0.3, forest: 1.0, ren: 14.5, temp: 1.46, water: 36, bio: 54, biome: 'arid',
    cities: [
      c('sanaa', 'Sano', 'Сана', 'Sana', "Sana'a", 15.37, 44.19, 3.3, 2250, 88, 31.6, 0.4, 16, 35, 1.49, 13, 'alpine'),
      c('aden', 'Adan', 'Аден', 'Aden', 'Aden', 12.79, 45.02, 1.1, 6, 76, 26.8, 0.3, 12, 39, 1.38, 11, 'port'),
    ],
  },
  {
    id: 'syr', numericId: '760', iso2: 'SY', region: 'mea',
    name: { uz: 'Suriya', ru: 'Сирия', tr: 'Suriye', en: 'Syria' },
    pop: 23.2, area: 185180, aqi: 76, pm25: 26.8, co2: 1.2, forest: 2.8, ren: 7.4, temp: 1.54, water: 48, bio: 53, biome: 'arid',
    cities: [
      c('damascus', 'Damashq', 'Дамаск', 'Şam', 'Damascus', 33.51, 36.28, 2.6, 680, 79, 27.9, 1.3, 8, 49, 1.55, 16, 'oasis'),
      c('aleppo', 'Halab', 'Алеппо', 'Halep', 'Aleppo', 36.2, 37.13, 2.2, 379, 74, 26.1, 1.1, 7, 46, 1.53, 14, 'capital'),
    ],
  },
  {
    id: 'lbn', numericId: '422', iso2: 'LB', region: 'mea',
    name: { uz: 'Livan', ru: 'Ливан', tr: 'Lübnan', en: 'Lebanon' },
    pop: 5.4, area: 10452, aqi: 66, pm25: 22.1, co2: 3.1, forest: 13.6, ren: 18.2, temp: 1.52, water: 59, bio: 64, biome: 'mediterranean',
    cities: [
      c('beirut', 'Bayrut', 'Бейрут', 'Beyrut', 'Beirut', 33.89, 35.5, 2.4, 40, 69, 23.1, 3.3, 18, 59, 1.51, 17, 'port'),
      c('tripolilb', 'Tripoli', 'Триполи', 'Trablusşam', 'Tripoli', 34.44, 35.85, 0.36, 18, 61, 20.2, 2.8, 19, 60, 1.49, 22, 'port'),
    ],
  },
  {
    id: 'kwt', numericId: '414', iso2: 'KW', region: 'mea',
    name: { uz: 'Quvayt', ru: 'Кувейт', tr: 'Kuveyt', en: 'Kuwait' },
    pop: 4.3, area: 17818, aqi: 96, pm25: 36.4, co2: 24.8, forest: 0.4, ren: 1.8, temp: 1.69, water: 68, bio: 47, biome: 'arid',
    cities: [
      c('kuwaitcity', 'Al-Quvayt', 'Эль-Кувейт', 'Kuveyt', 'Kuwait City', 29.38, 47.98, 3.2, 5, 96, 36.4, 24.8, 2, 68, 1.69, 13, 'port'),
    ],
  },
  {
    id: 'gtm', numericId: '320', iso2: 'GT', region: 'americas',
    name: { uz: 'Gvatemala', ru: 'Гватемала', tr: 'Guatemala', en: 'Guatemala' },
    pop: 18.1, area: 108889, aqi: 56, pm25: 18.4, co2: 1.1, forest: 32.9, ren: 62.4, temp: 1.22, water: 61, bio: 80, biome: 'tropical',
    cities: [
      c('guatemalacity', 'Gvatemala', 'Гватемала', 'Guatemala', 'Guatemala City', 14.63, -90.51, 3.1, 1500, 62, 20.4, 1.3, 61, 62, 1.24, 24, 'alpine'),
      c('xela', 'Ketsaltenango', 'Кесальтенанго', 'Quetzaltenango', 'Quetzaltenango', 14.84, -91.52, 0.21, 2333, 41, 12.9, 0.7, 68, 65, 1.25, 36, 'alpine'),
    ],
  },
  {
    id: 'pan', numericId: '591', iso2: 'PA', region: 'americas',
    name: { uz: 'Panama', ru: 'Панама', tr: 'Panama', en: 'Panama' },
    pop: 4.5, area: 75417, aqi: 36, pm25: 11.2, co2: 2.6, forest: 56.8, ren: 78.2, temp: 1.14, water: 79, bio: 86, biome: 'tropical',
    cities: [
      c('panamacity', 'Panama', 'Панама', 'Panama', 'Panama City', 8.98, -79.52, 1.9, 2, 39, 12.1, 2.8, 76, 80, 1.15, 34, 'port'),
      c('colon', 'Kolon', 'Колон', 'Colón', 'Colón', 9.36, -79.9, 0.24, 3, 34, 10.4, 2.2, 81, 77, 1.12, 38, 'port'),
    ],
  },
  {
    id: 'dom', numericId: '214', iso2: 'DO', region: 'americas',
    name: { uz: 'Dominikana', ru: 'Доминикана', tr: 'Dominik Cum.', en: 'Dominican Rep.' },
    pop: 11.3, area: 48671, aqi: 39, pm25: 12.2, co2: 2.4, forest: 44.4, ren: 19.8, temp: 1.18, water: 69, bio: 76, biome: 'tropical',
    cities: [
      c('santodomingo', 'Santo-Domingo', 'Санто-Доминго', 'Santo Domingo', 'Santo Domingo', 18.49, -69.93, 3.5, 14, 43, 13.4, 2.6, 19, 69, 1.19, 26, 'port'),
      c('santiago_do', 'Santyago', 'Сантьяго', 'Santiago', 'Santiago', 19.45, -70.7, 0.8, 175, 34, 10.4, 2.1, 22, 71, 1.17, 34, 'capital'),
    ],
  },
  {
    id: 'hnd', numericId: '340', iso2: 'HN', region: 'americas',
    name: { uz: 'Gonduras', ru: 'Гондурас', tr: 'Honduras', en: 'Honduras' },
    pop: 10.6, area: 112492, aqi: 52, pm25: 17.1, co2: 1.0, forest: 56.8, ren: 58.6, temp: 1.21, water: 61, bio: 79, biome: 'tropical',
    cities: [
      c('tegucigalpa', 'Tegusigalpa', 'Тегусигальпа', 'Tegucigalpa', 'Tegucigalpa', 14.07, -87.19, 1.5, 990, 56, 18.4, 1.1, 58, 62, 1.22, 26, 'alpine'),
      c('sanpedrosula', 'San-Pedro-Sula', 'Сан-Педро-Сула', 'San Pedro Sula', 'San Pedro Sula', 15.5, -88.03, 0.9, 83, 52, 16.9, 1.0, 61, 60, 1.19, 29, 'industrial'),
    ],
  },
  {
    id: 'nic', numericId: '558', iso2: 'NI', region: 'americas',
    name: { uz: 'Nikaragua', ru: 'Никарагуа', tr: 'Nikaragua', en: 'Nicaragua' },
    pop: 7.0, area: 130373, aqi: 44, pm25: 14.1, co2: 0.8, forest: 28.4, ren: 66.2, temp: 1.19, water: 64, bio: 78, biome: 'tropical',
    cities: [
      c('managua', 'Managua', 'Манагуа', 'Managua', 'Managua', 12.11, -86.24, 1.06, 83, 48, 15.2, 0.9, 65, 64, 1.2, 27, 'capital'),
      c('leon_ni', 'Leon', 'Леон', 'León', 'León', 12.44, -86.88, 0.21, 109, 39, 12.2, 0.6, 69, 65, 1.18, 32, 'oasis'),
    ],
  },
  {
    id: 'slv', numericId: '222', iso2: 'SV', region: 'americas',
    name: { uz: 'Salvador', ru: 'Сальвадор', tr: 'El Salvador', en: 'El Salvador' },
    pop: 6.4, area: 21041, aqi: 54, pm25: 17.9, co2: 1.1, forest: 28.1, ren: 79.4, temp: 1.21, water: 59, bio: 69, biome: 'tropical',
    cities: [
      c('sansalvador', 'San-Salvador', 'Сан-Сальвадор', 'San Salvador', 'San Salvador', 13.69, -89.22, 1.1, 658, 56, 18.5, 1.2, 79, 59, 1.22, 25, 'capital'),
    ],
  },
  {
    id: 'jam', numericId: '388', iso2: 'JM', region: 'americas',
    name: { uz: 'Yamayka', ru: 'Ямайка', tr: 'Jamaika', en: 'Jamaica' },
    pop: 2.8, area: 10991, aqi: 36, pm25: 10.9, co2: 2.8, forest: 55.1, ren: 14.2, temp: 1.16, water: 72, bio: 74, biome: 'coastal',
    cities: [
      c('kingston', 'Kingston', 'Кингстон', 'Kingston', 'Kingston', 18.0, -76.79, 0.67, 9, 39, 11.8, 3.0, 14, 72, 1.17, 29, 'port'),
    ],
  },
  {
    id: 'hti', numericId: '332', iso2: 'HT', region: 'americas',
    name: { uz: 'Gaiti', ru: 'Гаити', tr: 'Haiti', en: 'Haiti' },
    pop: 11.7, area: 27750, aqi: 66, pm25: 22.8, co2: 0.3, forest: 12.6, ren: 16.4, temp: 1.2, water: 41, bio: 56, biome: 'tropical',
    cities: [
      c('portauprince', 'Port-o-Prens', 'Порт-о-Пренс', 'Port-au-Prince', 'Port-au-Prince', 18.59, -72.31, 2.9, 98, 69, 23.6, 0.4, 16, 41, 1.21, 15, 'port'),
    ],
  },
  {
    id: 'guy', numericId: '328', iso2: 'GY', region: 'americas',
    name: { uz: 'Gayana', ru: 'Гайана', tr: 'Guyana', en: 'Guyana' },
    pop: 0.81, area: 214969, aqi: 29, pm25: 8.8, co2: 4.1, forest: 93.6, ren: 8.2, temp: 1.17, water: 72, bio: 89, biome: 'tropical',
    cities: [
      c('georgetown', 'Jorjtaun', 'Джорджтаун', 'Georgetown', 'Georgetown', 6.8, -58.16, 0.24, 1, 31, 9.2, 4.3, 9, 72, 1.18, 38, 'port'),
    ],
  },
  {
    id: 'sur', numericId: '740', iso2: 'SR', region: 'americas',
    name: { uz: 'Surinam', ru: 'Суринам', tr: 'Surinam', en: 'Suriname' },
    pop: 0.62, area: 163820, aqi: 26, pm25: 7.9, co2: 4.4, forest: 97.4, ren: 42.1, temp: 1.16, water: 75, bio: 90, biome: 'tropical',
    cities: [
      c('paramaribo', 'Paramaribo', 'Парамарибо', 'Paramaribo', 'Paramaribo', 5.85, -55.2, 0.25, 3, 28, 8.4, 4.5, 42, 75, 1.16, 41, 'port'),
    ],
  },
  {
    id: 'alb', numericId: '008', iso2: 'AL', region: 'europe',
    name: { uz: 'Albaniya', ru: 'Албания', tr: 'Arnavutluk', en: 'Albania' },
    pop: 2.8, area: 28748, aqi: 46, pm25: 14.8, co2: 1.7, forest: 28.8, ren: 98.5, temp: 1.46, water: 76, bio: 74, biome: 'mediterranean',
    cities: [
      c('tirana', 'Tirana', 'Тирана', 'Tiran', 'Tirana', 41.33, 19.82, 0.56, 110, 51, 16.2, 1.9, 98, 76, 1.48, 29, 'capital'),
      c('durres', 'Durres', 'Дуррес', 'Dıraç', 'Durrës', 41.32, 19.45, 0.18, 5, 39, 12.1, 1.5, 99, 78, 1.41, 31, 'port'),
    ],
  },
  {
    id: 'bih', numericId: '070', iso2: 'BA', region: 'europe',
    name: { uz: 'Bosniya va Gersegovina', ru: 'Босния и Герцеговина', tr: 'Bosna Hersek', en: 'Bosnia & Herz.' },
    pop: 3.2, area: 51209, aqi: 68, pm25: 22.8, co2: 6.4, forest: 42.7, ren: 38.4, temp: 1.49, water: 79, bio: 77, biome: 'alpine',
    cities: [
      c('sarajevo', 'Sarayevo', 'Сараево', 'Saraybosna', 'Sarajevo', 43.86, 18.41, 0.41, 518, 74, 25.1, 6.2, 39, 80, 1.51, 36, 'alpine'),
      c('banjaluka', 'Banya-Luka', 'Баня-Лука', 'Banja Luka', 'Banja Luka', 44.77, 17.19, 0.19, 163, 62, 20.4, 5.9, 42, 78, 1.48, 39, 'river'),
    ],
  },
  {
    id: 'mkd', numericId: '807', iso2: 'MK', region: 'europe',
    name: { uz: 'Shimoliy Makedoniya', ru: 'Северная Македония', tr: 'Kuzey Makedonya', en: 'North Macedonia' },
    pop: 1.8, area: 25713, aqi: 66, pm25: 21.8, co2: 4.1, forest: 39.7, ren: 26.4, temp: 1.48, water: 75, bio: 74, biome: 'alpine',
    cities: [
      c('skopje', 'Skopye', 'Скопье', 'Üsküp', 'Skopje', 42.0, 21.43, 0.53, 240, 72, 24.2, 4.3, 25, 75, 1.5, 29, 'alpine'),
      c('bitola', 'Bitola', 'Битола', 'Manastır', 'Bitola', 41.03, 21.33, 0.08, 615, 58, 18.9, 3.8, 29, 77, 1.46, 33, 'alpine'),
    ],
  },
  {
    id: 'mda', numericId: '498', iso2: 'MD', region: 'europe',
    name: { uz: 'Moldova', ru: 'Молдова', tr: 'Moldova', en: 'Moldova' },
    pop: 2.5, area: 33846, aqi: 46, pm25: 14.5, co2: 2.1, forest: 11.7, ren: 8.6, temp: 1.51, water: 69, bio: 67, biome: 'temperate',
    cities: [
      c('chisinau', 'Kishinyov', 'Кишинёв', 'Kişinev', 'Chișinău', 47.01, 28.86, 0.68, 85, 48, 15.1, 2.3, 9, 70, 1.52, 34, 'capital'),
      c('balti', 'Belts', 'Бельцы', 'Bălți', 'Bălți', 47.76, 27.93, 0.1, 102, 42, 13.1, 1.9, 10, 68, 1.5, 36, 'river'),
    ],
  },
  {
    id: 'mne', numericId: '499', iso2: 'ME', region: 'europe',
    name: { uz: 'Chernogoriya', ru: 'Черногория', tr: 'Karadağ', en: 'Montenegro' },
    pop: 0.62, area: 13812, aqi: 42, pm25: 13.4, co2: 4.0, forest: 61.5, ren: 62.4, temp: 1.46, water: 83, bio: 80, biome: 'alpine',
    cities: [
      c('podgorica', 'Podgoritsa', 'Подгорица', 'Podgorica', 'Podgorica', 42.44, 19.26, 0.19, 44, 44, 13.9, 4.1, 61, 83, 1.48, 41, 'capital'),
    ],
  },
  {
    id: 'lux', numericId: '442', iso2: 'LU', region: 'europe',
    name: { uz: 'Lyuksemburg', ru: 'Люксембург', tr: 'Lüksemburg', en: 'Luxembourg' },
    pop: 0.66, area: 2586, aqi: 29, pm25: 8.4, co2: 11.6, forest: 34.4, ren: 26.8, temp: 1.49, water: 91, bio: 78, biome: 'temperate',
    cities: [
      c('luxembourgcity', 'Lyuksemburg', 'Люксембург', 'Lüksemburg', 'Luxembourg City', 49.61, 6.13, 0.13, 304, 29, 8.4, 11.6, 28, 91, 1.49, 48, 'green'),
    ],
  },
  {
    id: 'cyp', numericId: '196', iso2: 'CY', region: 'europe',
    name: { uz: 'Kipr', ru: 'Кипр', tr: 'Kıbrıs', en: 'Cyprus' },
    pop: 1.3, area: 9251, aqi: 42, pm25: 13.2, co2: 5.8, forest: 18.7, ren: 21.4, temp: 1.49, water: 76, bio: 71, biome: 'mediterranean',
    cities: [
      c('nicosia', 'Nikosiya', 'Никосия', 'Lefkoşa', 'Nicosia', 35.19, 33.38, 0.34, 149, 44, 13.8, 5.9, 22, 76, 1.52, 24, 'capital'),
      c('limassol', 'Limasol', 'Лимасол', 'Limasol', 'Limassol', 34.68, 33.04, 0.24, 12, 39, 12.1, 5.6, 24, 77, 1.45, 27, 'port'),
    ],
  },
  {
    id: 'lao', numericId: '418', iso2: 'LA', region: 'asia_pacific',
    name: { uz: 'Laos', ru: 'Лаос', tr: 'Laos', en: 'Laos' },
    pop: 7.6, area: 236800, aqi: 61, pm25: 19.8, co2: 2.8, forest: 71.9, ren: 81.4, temp: 1.21, water: 62, bio: 79, biome: 'tropical',
    cities: [
      c('vientiane', 'Vyentyan', 'Вьентьян', 'Vientiane', 'Vientiane', 17.97, 102.63, 0.99, 174, 64, 20.8, 2.9, 81, 62, 1.22, 34, 'river'),
      c('luangprabang', 'Luangprabang', 'Луангпхабанг', 'Luang Prabang', 'Luang Prabang', 19.89, 102.13, 0.09, 305, 48, 15.2, 1.8, 86, 67, 1.19, 46, 'river'),
    ],
  },
  {
    id: 'prk', numericId: '408', iso2: 'KP', region: 'asia_pacific',
    name: { uz: 'Shimoliy Koreya', ru: 'КНДР', tr: 'Kuzey Kore', en: 'North Korea' },
    pop: 26.1, area: 120540, aqi: 72, pm25: 24.4, co2: 2.1, forest: 48.2, ren: 56.4, temp: 1.38, water: 59, bio: 66, biome: 'temperate',
    cities: [
      c('pyongyang', 'Pxenyan', 'Пхеньян', 'Pyongyang', 'Pyongyang', 39.04, 125.76, 3.1, 29, 74, 25.1, 2.3, 55, 60, 1.39, 31, 'river'),
      c('hamhung', 'Xamxin', 'Хамхын', 'Hamhung', 'Hamhung', 39.92, 127.54, 0.77, 12, 68, 22.8, 2.1, 58, 58, 1.36, 26, 'port'),
    ],
  },
  {
    id: 'png', numericId: '598', iso2: 'PG', region: 'asia_pacific',
    name: { uz: 'Papua-Yangi Gvineya', ru: 'Папуа — Новая Гвинея', tr: 'Papua Yeni Gine', en: 'Papua New Guinea' },
    pop: 10.3, area: 462840, aqi: 31, pm25: 9.4, co2: 0.7, forest: 79.1, ren: 28.4, temp: 1.09, water: 56, bio: 88, biome: 'tropical',
    cities: [
      c('portmoresby', 'Port-Morsbi', 'Порт-Морсби', 'Port Moresby', 'Port Moresby', -9.44, 147.18, 0.41, 35, 34, 10.2, 0.8, 29, 58, 1.1, 39, 'port'),
      c('lae', 'Lae', 'Лаэ', 'Lae', 'Lae', -6.73, 147.0, 0.15, 8, 28, 8.4, 0.6, 34, 57, 1.08, 46, 'port'),
    ],
  },
  {
    id: 'pse', numericId: '275', iso2: 'PS', region: 'mea',
    name: { uz: 'Falastin', ru: 'Палестина', tr: 'Filistin', en: 'Palestine' },
    pop: 5.4, area: 6020, aqi: 59, pm25: 19.2, co2: 0.7, forest: 1.6, ren: 16.4, temp: 1.52, water: 48, bio: 56, biome: 'mediterranean',
    cities: [
      c('ramallah', 'Ramalloh', 'Рамалла', 'Ramallah', 'Ramallah', 31.9, 35.2, 0.11, 880, 56, 18.2, 0.8, 19, 52, 1.52, 21, 'capital'),
      c('gaza', 'G‘azo', 'Газа', 'Gazze', 'Gaza', 31.5, 34.47, 0.78, 14, 68, 22.8, 0.6, 12, 39, 1.51, 11, 'port'),
    ],
  },
  {
    id: 'bhr', numericId: '048', iso2: 'BH', region: 'mea',
    name: { uz: 'Bahrayn', ru: 'Бахрейн', tr: 'Bahreyn', en: 'Bahrain' },
    pop: 1.5, area: 786, aqi: 89, pm25: 32.8, co2: 23.4, forest: 0.9, ren: 1.2, temp: 1.64, water: 69, bio: 48, biome: 'arid',
    cities: [
      c('manama', 'Manama', 'Манама', 'Manama', 'Manama', 26.23, 50.59, 0.71, 6, 89, 32.8, 23.4, 2, 69, 1.64, 14, 'port'),
    ],
  },
  {
    id: 'btn', numericId: '064', iso2: 'BT', region: 'asia_pacific',
    name: { uz: 'Butan', ru: 'Бутан', tr: 'Butan', en: 'Bhutan' },
    pop: 0.79, area: 38394, aqi: 28, pm25: 8.4, co2: 1.4, forest: 71.4, ren: 99.9, temp: 1.38, water: 88, bio: 89, biome: 'alpine',
    cities: [
      c('thimphu', 'Tximpu', 'Тхимпху', 'Thimphu', 'Thimphu', 27.47, 89.64, 0.12, 2320, 29, 8.8, 1.5, 100, 89, 1.39, 58, 'green'),
    ],
  },
  {
    id: 'brn', numericId: '096', iso2: 'BN', region: 'asia_pacific',
    name: { uz: 'Bruney', ru: 'Бруней', tr: 'Brunei', en: 'Brunei' },
    pop: 0.45, area: 5765, aqi: 27, pm25: 8.1, co2: 21.8, forest: 72.1, ren: 0.8, temp: 1.14, water: 83, bio: 82, biome: 'tropical',
    cities: [
      c('bsb', 'Bandar-Seri-Begavan', 'Бандар-Сери-Бегаван', 'Bandar Seri Begawan', 'Bandar Seri Begawan', 4.9, 114.94, 0.11, 15, 27, 8.1, 21.8, 1, 83, 1.14, 52, 'port'),
    ],
  },
  {
    id: 'tls', numericId: '626', iso2: 'TL', region: 'asia_pacific',
    name: { uz: 'Sharqiy Timor', ru: 'Восточный Тимор', tr: 'Doğu Timor', en: 'Timor-Leste' },
    pop: 1.4, area: 14874, aqi: 36, pm25: 11.4, co2: 0.5, forest: 61.9, ren: 4.2, temp: 1.13, water: 56, bio: 76, biome: 'tropical',
    cities: [
      c('dili', 'Dili', 'Дили', 'Dili', 'Dili', -8.56, 125.56, 0.28, 11, 36, 11.4, 0.5, 4, 56, 1.13, 32, 'port'),
    ],
  },
  {
    id: 'som', numericId: '706', iso2: 'SO', region: 'mea',
    name: { uz: 'Somali', ru: 'Сомали', tr: 'Somali', en: 'Somalia' },
    pop: 18.1, area: 637657, aqi: 54, pm25: 17.8, co2: 0.1, forest: 9.5, ren: 26.4, temp: 1.32, water: 36, bio: 56, biome: 'arid',
    cities: [
      c('mogadishu', 'Mogadisho', 'Могадишо', 'Mogadişu', 'Mogadishu', 2.05, 45.32, 2.6, 9, 58, 19.2, 0.1, 24, 37, 1.31, 14, 'port'),
      c('hargeisa', 'Xargeysa', 'Харгейса', 'Hargeisa', 'Hargeisa', 9.56, 44.07, 1.2, 1334, 48, 15.8, 0.1, 31, 38, 1.34, 18, 'alpine'),
    ],
  },
  {
    id: 'mli', numericId: '466', iso2: 'ML', region: 'mea',
    name: { uz: 'Mali', ru: 'Мали', tr: 'Mali', en: 'Mali' },
    pop: 23.3, area: 1240192, aqi: 84, pm25: 31.2, co2: 0.3, forest: 10.9, ren: 42.1, temp: 1.46, water: 44, bio: 61, biome: 'arid',
    cities: [
      c('bamako', 'Bamako', 'Бамако', 'Bamako', 'Bamako', 12.64, -8.0, 2.9, 350, 86, 31.8, 0.4, 41, 46, 1.46, 19, 'river'),
      c('timbuktu', 'Timbuktu', 'Тимбукту', 'Timbuktu', 'Timbuktu', 16.77, -3.01, 0.07, 261, 82, 30.1, 0.1, 46, 38, 1.54, 9, 'oasis'),
    ],
  },
  {
    id: 'ner', numericId: '562', iso2: 'NE', region: 'mea',
    name: { uz: 'Niger', ru: 'Нигер', tr: 'Nijer', en: 'Niger' },
    pop: 27.2, area: 1267000, aqi: 92, pm25: 34.8, co2: 0.1, forest: 0.9, ren: 18.4, temp: 1.51, water: 39, bio: 53, biome: 'arid',
    cities: [
      c('niamey', 'Niamey', 'Ниамей', 'Niamey', 'Niamey', 13.51, 2.13, 1.4, 207, 94, 35.6, 0.1, 18, 42, 1.52, 14, 'river'),
    ],
  },
  {
    id: 'tcd', numericId: '148', iso2: 'TD', region: 'mea',
    name: { uz: 'Chad', ru: 'Чад', tr: 'Çad', en: 'Chad' },
    pop: 18.3, area: 1284000, aqi: 91, pm25: 34.2, co2: 0.1, forest: 3.4, ren: 6.4, temp: 1.49, water: 38, bio: 55, biome: 'arid',
    cities: [
      c('ndjamena', 'Njamena', 'Нджамена', 'Encemine', "N'Djamena", 12.13, 15.06, 1.6, 298, 93, 35.1, 0.1, 7, 40, 1.51, 13, 'river'),
    ],
  },
  {
    id: 'bfa', numericId: '854', iso2: 'BF', region: 'mea',
    name: { uz: 'Burkina-Faso', ru: 'Буркина-Фасо', tr: 'Burkina Faso', en: 'Burkina Faso' },
    pop: 23.3, area: 274200, aqi: 79, pm25: 28.4, co2: 0.3, forest: 22.7, ren: 19.2, temp: 1.41, water: 46, bio: 62, biome: 'steppe',
    cities: [
      c('ouagadougou', 'Uagadugu', 'Уагадугу', 'Ouagadougou', 'Ouagadougou', 12.37, -1.52, 3.1, 305, 81, 29.2, 0.3, 19, 46, 1.42, 18, 'capital'),
    ],
  },
  {
    id: 'mrt', numericId: '478', iso2: 'MR', region: 'mea',
    name: { uz: 'Mavritaniya', ru: 'Мавритания', tr: 'Moritanya', en: 'Mauritania' },
    pop: 4.9, area: 1030700, aqi: 84, pm25: 31.4, co2: 0.9, forest: 0.3, ren: 26.4, temp: 1.48, water: 44, bio: 54, biome: 'arid',
    cities: [
      c('nouakchott', 'Nuakshot', 'Нуакшот', 'Nuakşot', 'Nouakchott', 18.07, -15.96, 1.4, 7, 86, 32.1, 1.0, 26, 44, 1.47, 10, 'port'),
    ],
  },
  {
    id: 'gab', numericId: '266', iso2: 'GA', region: 'mea',
    name: { uz: 'Gabon', ru: 'Габон', tr: 'Gabon', en: 'Gabon' },
    pop: 2.4, area: 267668, aqi: 42, pm25: 13.6, co2: 2.4, forest: 91.3, ren: 52.4, temp: 1.16, water: 68, bio: 90, biome: 'tropical',
    cities: [
      c('libreville', 'Librevil', 'Либревиль', 'Libreville', 'Libreville', 0.42, 9.47, 0.89, 12, 44, 14.1, 2.5, 52, 68, 1.16, 44, 'port'),
    ],
  },
  {
    id: 'cog', numericId: '178', iso2: 'CG', region: 'mea',
    name: { uz: 'Kongo Respublikasi', ru: 'Республика Конго', tr: 'Kongo Cum.', en: 'Rep. of the Congo' },
    pop: 6.1, area: 342000, aqi: 54, pm25: 17.8, co2: 1.2, forest: 64.3, ren: 29.4, temp: 1.19, water: 59, bio: 86, biome: 'tropical',
    cities: [
      c('brazzaville', 'Brazzavil', 'Браззавиль', 'Brazzaville', 'Brazzaville', -4.27, 15.24, 2.5, 320, 58, 19.1, 1.3, 31, 60, 1.2, 32, 'river'),
    ],
  },
  {
    id: 'mwi', numericId: '454', iso2: 'MW', region: 'mea',
    name: { uz: 'Malavi', ru: 'Малави', tr: 'Malavi', en: 'Malawi' },
    pop: 20.9, area: 118484, aqi: 46, pm25: 14.8, co2: 0.1, forest: 23.8, ren: 84.2, temp: 1.26, water: 55, bio: 74, biome: 'tropical',
    cities: [
      c('lilongwe', 'Lilongve', 'Лилонгве', 'Lilongwe', 'Lilongwe', -13.96, 33.77, 1.2, 1050, 46, 14.8, 0.1, 84, 56, 1.26, 34, 'capital'),
      c('blantyre', 'Blantayr', 'Блантайр', 'Blantyre', 'Blantyre', -15.79, 35.01, 0.96, 1039, 49, 15.8, 0.1, 82, 54, 1.25, 31, 'industrial'),
    ],
  },
  {
    id: 'gin', numericId: '324', iso2: 'GN', region: 'mea',
    name: { uz: 'Gvineya', ru: 'Гвинея', tr: 'Gine', en: 'Guinea' },
    pop: 14.2, area: 245857, aqi: 66, pm25: 22.1, co2: 0.3, forest: 25.2, ren: 72.4, temp: 1.25, water: 51, bio: 73, biome: 'tropical',
    cities: [
      c('conakry', 'Konakri', 'Конакри', 'Konakri', 'Conakry', 9.64, -13.58, 2.1, 13, 68, 22.8, 0.4, 71, 51, 1.24, 24, 'port'),
    ],
  },
  {
    id: 'ben', numericId: '204', iso2: 'BJ', region: 'mea',
    name: { uz: 'Benin', ru: 'Бенин', tr: 'Benin', en: 'Benin' },
    pop: 13.7, area: 114763, aqi: 68, pm25: 23.1, co2: 0.6, forest: 27.8, ren: 4.1, temp: 1.27, water: 52, bio: 68, biome: 'tropical',
    cities: [
      c('cotonou', 'Kotonu', 'Котону', 'Cotonou', 'Cotonou', 6.37, 2.39, 0.78, 5, 71, 24.1, 0.7, 5, 52, 1.26, 21, 'port'),
    ],
  },
  {
    id: 'tgo', numericId: '768', iso2: 'TG', region: 'mea',
    name: { uz: 'Togo', ru: 'Того', tr: 'Togo', en: 'Togo' },
    pop: 9.1, area: 56785, aqi: 64, pm25: 21.4, co2: 0.3, forest: 22.2, ren: 18.6, temp: 1.26, water: 53, bio: 67, biome: 'tropical',
    cities: [
      c('lome', 'Lome', 'Ломе', 'Lomé', 'Lomé', 6.13, 1.22, 1.9, 10, 66, 22.1, 0.4, 18, 54, 1.25, 22, 'port'),
    ],
  },
  {
    id: 'ssd', numericId: '728', iso2: 'SS', region: 'mea',
    name: { uz: 'Janubiy Sudan', ru: 'Южный Судан', tr: 'Güney Sudan', en: 'South Sudan' },
    pop: 11.1, area: 619745, aqi: 61, pm25: 20.1, co2: 0.2, forest: 11.3, ren: 4.8, temp: 1.39, water: 39, bio: 69, biome: 'tropical',
    cities: [
      c('juba', 'Juba', 'Джуба', 'Juba', 'Juba', 4.85, 31.58, 0.55, 550, 62, 20.4, 0.2, 5, 41, 1.39, 26, 'river'),
    ],
  },
  {
    id: 'eri', numericId: '232', iso2: 'ER', region: 'mea',
    name: { uz: 'Eritreya', ru: 'Эритрея', tr: 'Eritre', en: 'Eritrea' },
    pop: 3.7, area: 117600, aqi: 56, pm25: 18.6, co2: 0.2, forest: 10.5, ren: 9.2, temp: 1.41, water: 47, bio: 60, biome: 'arid',
    cities: [
      c('asmara', 'Asmara', 'Асмэра', 'Asmara', 'Asmara', 15.32, 38.93, 1.0, 2325, 56, 18.6, 0.2, 10, 48, 1.42, 22, 'alpine'),
    ],
  },
  {
    id: 'dji', numericId: '262', iso2: 'DJ', region: 'mea',
    name: { uz: 'Jibuti', ru: 'Джибути', tr: 'Cibuti', en: 'Djibouti' },
    pop: 1.1, area: 23200, aqi: 62, pm25: 20.9, co2: 0.4, forest: 0.3, ren: 38.4, temp: 1.46, water: 49, bio: 52, biome: 'arid',
    cities: [
      c('djibouticity', 'Jibuti', 'Джибути', 'Cibuti', 'Djibouti City', 11.59, 43.15, 0.62, 14, 62, 20.9, 0.4, 38, 49, 1.46, 12, 'port'),
    ],
  },
  {
    id: 'caf', numericId: '140', iso2: 'CF', region: 'mea',
    name: { uz: 'Markaziy Afrika Resp.', ru: 'ЦАР', tr: 'Orta Afrika Cum.', en: 'Central African Rep.' },
    pop: 5.7, area: 622984, aqi: 64, pm25: 21.4, co2: 0.1, forest: 35.8, ren: 99.1, temp: 1.24, water: 43, bio: 82, biome: 'tropical',
    cities: [
      c('bangui', 'Bangi', 'Банги', 'Bangui', 'Bangui', 4.39, 18.56, 0.94, 369, 64, 21.4, 0.1, 99, 44, 1.24, 34, 'river'),
    ],
  },
  {
    id: 'grl', numericId: '304', iso2: 'GL', region: 'americas',
    name: { uz: 'Grenlandiya', ru: 'Гренландия', tr: 'Grönland', en: 'Greenland' },
    pop: 0.06, area: 2166086, aqi: 12, pm25: 3.1, co2: 9.2, forest: 0.1, ren: 84.5, temp: 2.15, water: 97, bio: 66, biome: 'boreal',
    cities: [
      c('nuuk', 'Nuuk', 'Нуук', 'Nuuk', 'Nuuk', 64.18, -51.72, 0.02, 18, 12, 3.1, 9.2, 85, 97, 2.15, 36, 'port'),
    ],
  },
];

export const EXTENDED_WORLD_COUNTRIES: CountryRecord[] = [
  ...EXTENDED_SPECS,
  ...MORE_COUNTRIES,
].map(hydrateCountry);

export const ALL_WORLD_COUNTRIES: CountryRecord[] = [
  ...COUNTRIES_DATA,
  ...EXTENDED_WORLD_COUNTRIES,
];

const ALL_BY_NUMERIC = new Map<string, CountryRecord>(
  ALL_WORLD_COUNTRIES.map((country) => [country.numericId, country]),
);

const ALL_BY_ID = new Map<string, CountryRecord>(
  ALL_WORLD_COUNTRIES.map((country) => [country.id, country]),
);

export function getWorldCountryByNumericId(numericId: string): CountryRecord | undefined {
  return ALL_BY_NUMERIC.get(numericId);
}

export function getWorldCountryById(id: string): CountryRecord | undefined {
  return ALL_BY_ID.get(id);
}

function inferRegionFromCoords(lat: number, lon: number): Exclude<RegionId, 'all'> {
  if (lon < -25) return 'americas';
  if (lat > 35 && lon >= -25 && lon <= 50) return 'europe';
  if (lon > 46 && lon < 88 && lat >= 36 && lat <= 56) return 'central_asia';
  if (lon >= 60 && lat > -50 && lat <= 55) return 'asia_pacific';
  return 'mea';
}

function inferBiomeFromLat(lat: number): BiomeType {
  const absLat = Math.abs(lat);
  if (absLat >= 60) return 'boreal';
  if (absLat >= 38) return 'temperate';
  if (absLat >= 18) return 'coastal';
  return 'tropical';
}

/**
 * Generates a complete, deterministic CountryRecord + primary city for any micro-state
 * or island territory in world-atlas 50m so no polygon on the globe ever lacks data.
 */
export function synthesizeTerritoryProfile(
  numericId: string,
  localizedName: LocalizedString,
  centroidLonLat: [number, number],
): CountryRecord {
  const existing = ALL_BY_NUMERIC.get(numericId);
  if (existing) return existing;

  const [lon, lat] = centroidLonLat;
  const seed = Number.parseInt(numericId, 10) || 100;
  const region = inferRegionFromCoords(lat, lon);
  const biome = inferBiomeFromLat(lat);

  const aqi = 24 + (seed % 34);
  const pm25 = Number((aqi * 0.31).toFixed(1));
  const co2 = Number((1.8 + ((seed % 45) / 10)).toFixed(1));
  const ren = 22 + (seed % 58);
  const forest = 18 + (seed % 44);
  const water = 68 + (seed % 24);
  const temp = Number((1.12 + ((seed % 38) / 100)).toFixed(2));
  const green = 28 + (seed % 34);

  return hydrateCountry({
    id: `geo-${numericId}`,
    numericId,
    iso2: localizedName.en.slice(0, 2).toUpperCase(),
    region,
    name: localizedName,
    pop: Number((0.15 + ((seed % 18) / 10)).toFixed(2)),
    area: 450 + (seed % 90) * 120,
    aqi,
    pm25,
    co2,
    forest,
    ren,
    temp,
    water,
    bio: 66 + (seed % 22),
    biome,
    cities: [
      {
        id: `city-${numericId}-main`,
        name: localizedName,
        lat: Number(lat.toFixed(2)),
        lon: Number(lon.toFixed(2)),
        pop: Number((0.08 + ((seed % 9) / 20)).toFixed(2)),
        elev: 18 + (seed % 180),
        aqi,
        pm25,
        co2,
        ren,
        water,
        temp,
        green,
        role: Math.abs(lat) > 45 ? 'green' : 'port',
      },
    ],
  });
}
