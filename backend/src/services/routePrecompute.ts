import { getWarehouseModel } from '../models/Warehouse';
import { getRouteCacheModel } from '../models/RouteCache';

const CACHE_TTL_DAYS = 30;
const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';
const OSRM_MIN_INTERVAL_MS = 1100;
let lastOsrmCall = 0;

function makePairKey(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function precomputeAllHubRoutes(): Promise<{
  total: number;
  cached: number;
  computed: number;
  failed: number;
  errors: string[];
}> {
  const Warehouse = await getWarehouseModel();
  const RouteCache = await getRouteCacheModel();

  const warehouses = await Warehouse.find({ status: 'active' });
  if (warehouses.length < 2) {
    return { total: 0, cached: 0, computed: 0, failed: 0, errors: ['Need at least 2 active warehouses'] };
  }

  const pairs: Array<{ a: typeof warehouses[0]; b: typeof warehouses[0] }> = [];
  for (let i = 0; i < warehouses.length; i++) {
    for (let j = i + 1; j < warehouses.length; j++) {
      pairs.push({ a: warehouses[i], b: warehouses[j] });
    }
  }

  console.log(`Pre-computing routes for ${pairs.length} warehouse pairs...`);

  const expiresAt = new Date(Date.now() + CACHE_TTL_DAYS * 86400000);
  let cached = 0;
  let computed = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const pair of pairs) {
    const [idA, idB] = makePairKey(pair.a._id.toString(), pair.b._id.toString());

    const existing = await RouteCache.findOne({
      originWarehouseId: idA,
      destinationWarehouseId: idB,
    });

    if (existing) {
      cached++;
      continue;
    }

    const originCoords = pair.a.location?.coordinates;
    const destCoords = pair.b.location?.coordinates;
    if (!originCoords || !destCoords) {
      failed++;
      errors.push(`Missing coordinates for ${pair.a.name} or ${pair.b.name}`);
      continue;
    }

    try {
      const osrmUrl = `${OSRM_BASE_URL}/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?overview=full&geometries=polyline`;
      const now = Date.now();
      const wait = OSRM_MIN_INTERVAL_MS - (now - lastOsrmCall);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      lastOsrmCall = Date.now();
      const response = await fetch(osrmUrl);

      if (!response.ok) {
        failed++;
        errors.push(`OSRM API ${response.status} for ${pair.a.name} → ${pair.b.name}`);
        continue;
      }

      const data = await response.json();
      const route = data.routes?.[0];

      if (!route) {
        failed++;
        errors.push(`No route found for ${pair.a.name} → ${pair.b.name}`);
        continue;
      }

      const distanceMeters = route.distance || 0;
      const durationSeconds = route.duration || 0;
      const encodedPolyline = route.geometry || '';

      await RouteCache.findOneAndUpdate(
        { originWarehouseId: idA, destinationWarehouseId: idB },
        {
          originWarehouseId: idA,
          destinationWarehouseId: idB,
          originName: pair.a.name,
          destinationName: pair.b.name,
          polyline: encodedPolyline,
          distanceMeters,
          durationSeconds,
          travelMode: 'DRIVE',
          computedAt: new Date(),
          expiresAt,
        },
        { upsert: true, new: true }
      );

      computed++;
      console.log(`  ✓ ${pair.a.name} → ${pair.b.name}: ${(distanceMeters / 1000).toFixed(1)}km, ${durationSeconds}s`);

      await new Promise((r) => setTimeout(r, 200));
    } catch (err: any) {
      failed++;
      errors.push(`Error for ${pair.a.name} → ${pair.b.name}: ${err.message}`);
    }
  }

  const result = { total: pairs.length, cached, computed, failed, errors };
  console.log(`Pre-computation done: ${computed} computed, ${cached} cached, ${failed} failed`);
  return result;
}

export async function findCachedRoute(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<{
  polyline: string;
  distanceMeters: number;
  durationSeconds: number;
} | null> {
  const Warehouse = await getWarehouseModel();
  const RouteCache = await getRouteCacheModel();

  const warehouses = await Warehouse.find({ status: 'active' });

  let originWh: typeof warehouses[0] | null = null;
  let destWh: typeof warehouses[0] | null = null;
  let minOriginDist = Infinity;
  let minDestDist = Infinity;

  for (const wh of warehouses) {
    const coords = wh.location?.coordinates;
    if (!coords) continue;

    const oDist = Math.abs(coords[1] - originLat) + Math.abs(coords[0] - originLng);
    if (oDist < minOriginDist) {
      minOriginDist = oDist;
      originWh = wh;
    }

    const dDist = Math.abs(coords[1] - destLat) + Math.abs(coords[0] - destLng);
    if (dDist < minDestDist) {
      minDestDist = dDist;
      destWh = wh;
    }
  }

  if (!originWh || !destWh) return null;
  if (originWh._id.toString() === destWh._id.toString()) return null;

  if (minOriginDist > 0.05 || minDestDist > 0.05) return null;

  const [idA, idB] = makePairKey(originWh._id.toString(), destWh._id.toString());

  const cached = await RouteCache.findOne({
    originWarehouseId: idA,
    destinationWarehouseId: idB,
    expiresAt: { $gt: new Date() },
    polyline: { $ne: '', $exists: true },
  });

  if (!cached) return null;

  return {
    polyline: cached.polyline,
    distanceMeters: cached.distanceMeters,
    durationSeconds: cached.durationSeconds,
  };
}
