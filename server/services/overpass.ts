import { LRUCache } from "lru-cache";

type OverpassGeometryPoint = { lat: number; lon: number };
type OverpassElement = { id?: number; geometry?: OverpassGeometryPoint[] };
type OverpassResponse = { elements?: OverpassElement[] };

export type LatLngTuple = [number, number]; // [lat, lng]

type OverpassCacheValue = { found: boolean; latlngs: LatLngTuple[] };

const overpassCache = new LRUCache<string, OverpassCacheValue>({
  max: 500,
  ttl: 1000 * 60 * 60, // 1 hour
  updateAgeOnGet: true,
});

function cacheKey(params: { lat: number; lng: number; radius: number }): string {
  // Round for better cache hit rate
  const lat = Number(params.lat.toFixed(5));
  const lng = Number(params.lng.toFixed(5));
  return `building:${lat}:${lng}:r${params.radius}`;
}

function dist2(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dx = a.lng - b.lng;
  const dy = a.lat - b.lat;
  return dx * dx + dy * dy;
}

function centroid(points: LatLngTuple[]): { lat: number; lng: number } | null {
  if (points.length === 0) return null;
  let latSum = 0;
  let lngSum = 0;
  for (const [lat, lng] of points) {
    latSum += lat;
    lngSum += lng;
  }
  return { lat: latSum / points.length, lng: lngSum / points.length };
}

async function fetchOverpass(query: string, timeoutMs: number): Promise<OverpassResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: new URLSearchParams({ data: query }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Overpass error ${res.status}: ${text || res.statusText}`);
    }

    return (await res.json()) as OverpassResponse;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Returns the closest building polygon to the provided lat/lng, if any.
 * Uses Overpass server-side to avoid browser CORS/rate-limit issues.
 */
export async function getClosestBuildingFootprint(params: {
  lat: number;
  lng: number;
  radius?: number;
  timeoutMs?: number;
}): Promise<LatLngTuple[] | null> {
  const radius = typeof params.radius === "number" && Number.isFinite(params.radius) ? params.radius : 30;
  const timeoutMs =
    typeof params.timeoutMs === "number" && Number.isFinite(params.timeoutMs) ? params.timeoutMs : 5000;

  const key = cacheKey({ lat: params.lat, lng: params.lng, radius });
  const cached = overpassCache.get(key);
  if (cached !== undefined) return cached.found ? cached.latlngs : null;

  const query = `
    [out:json][timeout:5];
    (
      way["building"](around:${radius},${params.lat},${params.lng});
    );
    out geom;
  `;

  try {
    const data = await fetchOverpass(query, timeoutMs);
    const elements = Array.isArray(data.elements) ? data.elements : [];
    if (elements.length === 0) {
      overpassCache.set(key, { found: false, latlngs: [] });
      return null;
    }

    const target = { lat: params.lat, lng: params.lng };

    let best: { coords: LatLngTuple[]; d2: number } | null = null;
    for (const el of elements) {
      const geom = Array.isArray(el.geometry) ? el.geometry : [];
      if (geom.length < 3) continue;

      const coords: LatLngTuple[] = geom.map((p) => [p.lat, p.lon]);
      const c = centroid(coords);
      if (!c) continue;

      const d = dist2(target, c);
      if (!best || d < best.d2) best = { coords, d2: d };
    }

    if (!best?.coords) {
      overpassCache.set(key, { found: false, latlngs: [] });
      return null;
    }

    overpassCache.set(key, { found: true, latlngs: best.coords });
    return best.coords;
  } catch (err) {
    // Cache negative result briefly to prevent hammering Overpass on repeated failures
    overpassCache.set(key, { found: false, latlngs: [] }, { ttl: 1000 * 60 * 2 }); // 2 minutes
    throw err;
  }
}

