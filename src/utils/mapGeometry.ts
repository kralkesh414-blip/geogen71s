import type { Feature, GeoJsonProperties, Geometry } from 'geojson';
import type { GeoPath, GeoProjection } from 'd3-geo';

export interface Point2D {
  x: number;
  y: number;
}

export interface CitySeed {
  id: string;
  x: number;
  y: number;
  populationMillions: number;
}

export interface CityBoundaryZone {
  cityId: string;
  polygonPoints: Point2D[];
  pointsAttr: string;
  metroRingPath: string;
  labelPoint: Point2D;
}

/**
 * Clips a convex polygon against the half-plane of points closer to `a` than `b`.
 */
function clipPolygonByBisector(poly: Point2D[], a: Point2D, b: Point2D): Point2D[] {
  if (poly.length === 0) return [];
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = a.x - b.x;
  const dy = a.y - b.y;

  const isInside = (p: Point2D) => (p.x - mx) * dx + (p.y - my) * dy >= 0;

  const intersect = (p1: Point2D, p2: Point2D): Point2D => {
    const segX = p2.x - p1.x;
    const segY = p2.y - p1.y;
    const denom = segX * dx + segY * dy;
    if (Math.abs(denom) < 1e-9) {
      return p1;
    }
    const t = ((mx - p1.x) * dx + (my - p1.y) * dy) / denom;
    return {
      x: p1.x + t * segX,
      y: p1.y + t * segY,
    };
  };

  const output: Point2D[] = [];
  for (let i = 0; i < poly.length; i++) {
    const curr = poly[i];
    const prev = poly[(i + poly.length - 1) % poly.length];
    const currIn = isInside(curr);
    const prevIn = isInside(prev);

    if (currIn) {
      if (!prevIn) {
        output.push(intersect(prev, curr));
      }
      output.push(curr);
    } else if (prevIn) {
      output.push(intersect(prev, curr));
    }
  }
  return output;
}

/**
 * Builds an irregular, cartographically natural metropolitan perimeter path
 * centered around a city's projected SVG coordinates.
 */
export function buildMetroPerimeterPath(
  cx: number,
  cy: number,
  populationMillions: number,
  seedIndex: number,
  countrySpan: number,
): string {
  const baseRadius = Math.max(
    4.5,
    Math.min(countrySpan * 0.16, 4.2 + Math.sqrt(Math.max(0.2, populationMillions)) * 2.4),
  );
  const vertices = 12;
  const coords: Point2D[] = [];
  for (let i = 0; i < vertices; i++) {
    const angle = (i / vertices) * Math.PI * 2;
    const wobble =
      1 +
      0.16 * Math.sin(angle * 3 + seedIndex * 1.7) +
      0.09 * Math.cos(angle * 5 - seedIndex * 0.9);
    const r = baseRadius * wobble;
    coords.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r * 0.86,
    });
  }
  return (
    coords
      .map((pt, idx) => `${idx === 0 ? 'M' : 'L'}${pt.x.toFixed(2)},${pt.y.toFixed(2)}`)
      .join(' ') + ' Z'
  );
}

/**
 * Computes gapless Voronoi city boundary cells over a country's bounding box.
 * When paired with the country's high-resolution SVG <clipPath>, the resulting zones
 * follow exact national coastlines and international borders while cleanly subdividing
 * the interior among all cities.
 */
export function computeCityVoronoiZones(
  cities: CitySeed[],
  bounds: [[number, number], [number, number]],
): CityBoundaryZone[] {
  if (cities.length === 0) return [];
  const [[x0, y0], [x1, y1]] = bounds;
  const pad = 24;
  const minX = x0 - pad;
  const minY = y0 - pad;
  const maxX = x1 + pad;
  const maxY = y1 + pad;
  const countrySpan = Math.max(18, Math.hypot(x1 - x0, y1 - y0));

  const initialBox: Point2D[] = [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ];

  return cities.map((city, idx) => {
    let cell = initialBox;
    for (let j = 0; j < cities.length; j++) {
      if (idx === j) continue;
      const other = cities[j];
      // Skip degenerate identical points
      if (Math.hypot(city.x - other.x, city.y - other.y) < 0.05) continue;
      cell = clipPolygonByBisector(cell, city, other);
      if (cell.length === 0) break;
    }

    const pointsAttr = cell.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
    const metroRingPath = buildMetroPerimeterPath(
      city.x,
      city.y,
      city.populationMillions,
      idx + 1,
      countrySpan,
    );

    return {
      cityId: city.id,
      polygonPoints: cell,
      pointsAttr,
      metroRingPath,
      labelPoint: { x: city.x, y: city.y },
    };
  });
}

/**
 * Computes optimal zoom & pan coordinates to center a GeoJSON country feature
 * inside an SVG viewport, clamping zoom cleanly between 1.8x and 9.5x.
 * Also handles antimeridian-spanning features (e.g. Russia, Fiji, USA) gracefully.
 */
export function computeFeatureZoomTransform(
  feat: Feature<Geometry, GeoJsonProperties>,
  pathGenerator: GeoPath,
  projection: GeoProjection,
  svgWidth: number,
  svgHeight: number,
  fallbackLonLat?: [number, number],
): { zoom: number; panX: number; panY: number } {
  const bounds = pathGenerator.bounds(feat);
  let [[x0, y0], [x1, y1]] = bounds;
  let dx = x1 - x0;
  let dy = y1 - y0;

  // Guard against antimeridian wrap causing artificially huge horizontal bounds (e.g. Russia/Fiji/USA)
  if (
    (!Number.isFinite(dx) || !Number.isFinite(dy) || dx > svgWidth * 0.82) &&
    fallbackLonLat
  ) {
    const projectedCenter = projection(fallbackLonLat);
    if (projectedCenter) {
      const targetZoom = 2.6;
      return {
        zoom: targetZoom,
        panX: (svgWidth / 2 - projectedCenter[0]) * targetZoom,
        panY: (svgHeight / 2 - projectedCenter[1]) * targetZoom,
      };
    }
  }

  dx = Math.max(14, dx);
  dy = Math.max(14, dy);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;

  const rawZoom = 0.62 / Math.max(dx / svgWidth, dy / svgHeight);
  const targetZoom = Number(Math.max(1.8, Math.min(9.5, rawZoom)).toFixed(2));

  return {
    zoom: targetZoom,
    panX: (svgWidth / 2 - cx) * targetZoom,
    panY: (svgHeight / 2 - cy) * targetZoom,
  };
}
