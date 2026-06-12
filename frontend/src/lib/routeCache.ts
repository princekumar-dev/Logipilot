const CACHE_PREFIX = 'logipilot:route:';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const memoryCache = new Map<string, { lat: number; lng: number }[]>();
const inflightRequests = new Map<string, Promise<{ lat: number; lng: number }[] | null>>();

function getRouteKey(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): string {
  return `${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}-${destination.lat.toFixed(4)},${destination.lng.toFixed(4)}`;
}

function loadFromStorage(key: string): { lat: number; lng: number }[] | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as { data: { lat: number; lng: number }[]; ts: number };
    if (Date.now() - entry.ts > CACHE_TTL) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function saveToStorage(key: string, data: { lat: number; lng: number }[]): void {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // localStorage full - clear old entries and retry once
    clearOldEntries();
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
    } catch {
      // give up silently
    }
  }
}

function clearOldEntries(): void {
  const now = Date.now();
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(CACHE_PREFIX)) {
      try {
        const entry = JSON.parse(localStorage.getItem(k) || '{}');
        if (now - entry.ts > CACHE_TTL) toRemove.push(k);
      } catch {
        toRemove.push(k);
      }
    }
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
}

export function clearCachedRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): void {
  const key = getRouteKey(origin, destination);
  memoryCache.delete(key);
  inflightRequests.delete(key);
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch { /* ignore */ }
}

export async function getCachedRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  fetcher: (origin: { lat: number; lng: number }, dest: { lat: number; lng: number }) => Promise<{ polyline?: string }>
): Promise<{ lat: number; lng: number }[]> {
  const key = getRouteKey(origin, destination);

  const memCached = memoryCache.get(key);
  if (memCached) return memCached;

  const storageCached = loadFromStorage(key);
  if (storageCached) {
    memoryCache.set(key, storageCached);
    return storageCached;
  }

  const inflight = inflightRequests.get(key);
  if (inflight) return inflight.then((r) => r || [origin, destination]);

  const promise = fetcher(origin, destination)
    .then((routeData) => {
      const path = routeData.polyline ? decodePolyline(routeData.polyline) : [origin, destination];
      memoryCache.set(key, path);
      saveToStorage(key, path);
      inflightRequests.delete(key);
      return path;
    })
    .catch(() => {
      inflightRequests.delete(key);
      const fallback = [origin, destination];
      memoryCache.set(key, fallback);
      return fallback;
    });

  inflightRequests.set(key, promise);
  return promise;
}

function decodePolyline(encoded: string): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}
