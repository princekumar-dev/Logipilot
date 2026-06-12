import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { getVehicleModel } from '../models/Vehicle';
import { getShipmentModel } from '../models/Shipment';
import { getWarehouseModel } from '../models/Warehouse';
import { getDriverModel } from '../models/Driver';
import { getRouteCacheModel } from '../models/RouteCache';
import { getGpsTrackingModel } from '../models/GpsTracking';
import { findCachedRoute } from '../services/routePrecompute';

const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';
const ORS_BASE_URL = process.env.ORS_BASE_URL || 'http://localhost:8080/ors/v2';
const ORS_API_KEY = process.env.ORS_API_KEY || '';

let lastOsrmCall = 0;
const OSRM_MIN_INTERVAL_MS = 1100;
async function throttledOsrmFetch(url: string): Promise<globalThis.Response> {
  const now = Date.now();
  const wait = OSRM_MIN_INTERVAL_MS - (now - lastOsrmCall);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastOsrmCall = Date.now();
  return fetch(url);
}

export const getVehicleLocations = async (req: Request, res: Response) => {
  try {
    const Vehicle = await getVehicleModel();
    const Shipment = await getShipmentModel();
    const Warehouse = await getWarehouseModel();
    const GpsTracking = await getGpsTrackingModel();

    const vehicles = await Vehicle.find({ status: { $in: ['available', 'in_use', 'maintenance'] } })
      .limit(50)
      .sort({ createdAt: -1 });

    const vehicleIds = vehicles.map(v => v._id);

    const shipmentIds = vehicles
      .map(v => v.currentShipmentId)
      .filter((id): id is mongoose.Types.ObjectId => id != null);

    const [shipments, warehouses, latestLocations] = await Promise.all([
      Shipment.find({ _id: { $in: shipmentIds } }),
      Warehouse.find({}),
      GpsTracking.aggregate([
        { $match: { vehicleId: { $in: vehicleIds } } },
        { $sort: { timestamp: -1 } },
        {
          $group: {
            _id: '$vehicleId',
            location: { $first: '$location' },
            speed: { $first: '$speed' },
            heading: { $first: '$heading' },
            accuracy: { $first: '$accuracy' },
            timestamp: { $first: '$timestamp' },
          },
        },
      ]),
    ]);

    const warehouseMap = new Map<string, any>();
    warehouses.forEach(w => warehouseMap.set(w._id.toString(), w));

    const shipmentMap = new Map<string, any>();
    shipments.forEach(s => shipmentMap.set(s._id.toString(), s));

    const gpsLocationMap = new Map<string, any>();
    latestLocations.forEach(loc => gpsLocationMap.set(loc._id.toString(), loc));

    const result = vehicles
      .map(v => {
        const shipment = v.currentShipmentId ? shipmentMap.get(v.currentShipmentId.toString()) : null;
        const gpsData = gpsLocationMap.get(v._id.toString());

        let coordinates: number[] | null = null;

        if (gpsData?.location?.coordinates) {
          coordinates = gpsData.location.coordinates;
        } else if (shipment?.destinationLocation?.coordinates) {
          coordinates = shipment.destinationLocation.coordinates;
        } else if (shipment?.destinationWarehouseId) {
          const destWarehouse = warehouseMap.get(shipment.destinationWarehouseId.toString());
          if (destWarehouse?.location?.coordinates) {
            coordinates = destWarehouse.location.coordinates;
          }
        }

        if (!coordinates) return null;

        return {
          _id: v._id,
          vehicleNumber: v.vehicleNumber,
          type: v.type,
          status: v.status,
          healthScore: v.healthScore,
          fuelType: v.fuelType,
          location: { lat: coordinates[1], lng: coordinates[0] },
          speed: gpsData?.speed || 0,
          heading: gpsData?.heading || 0,
          accuracy: gpsData?.accuracy,
          lastGpsTimestamp: gpsData?.timestamp || null,
          hasGpsData: !!gpsData,
          shipmentId: shipment?._id || null,
          trackingNumber: shipment?.trackingNumber || '',
          destinationAddress: shipment?.destinationAddress || '',
          shipmentStatus: shipment?.status || null,
        };
      })
      .filter(Boolean);

    res.json({
      success: true,
      message: 'Vehicle locations retrieved successfully',
      data: { vehicles: result },
    });
  } catch (error: any) {
    console.error('Error fetching vehicle locations:', error.message);
    res.json({
      success: true,
      message: 'No data available',
      data: { vehicles: [] },
    });
  }
};

export const getMapOverview = async (req: Request, res: Response) => {
  try {
    const Warehouse = await getWarehouseModel();
    const Shipment = await getShipmentModel();
    const Vehicle = await getVehicleModel();
    const Driver = await getDriverModel();

    const [warehouses, activeShipments, vehicles, drivers] = await Promise.all([
      Warehouse.find({ status: 'active' }),
      Shipment.find({ status: { $in: ['in_transit', 'delayed'] } }).limit(100),
      Vehicle.find({}),
      Driver.find({}),
    ]);

    const warehouseData = warehouses.map(w => ({
      _id: w._id,
      name: w.name,
      code: w.code,
      address: w.address,
      status: w.status,
      coordinates: w.location?.coordinates || null,
    }));

    const warehouseLookup = new Map<string, any>();
    warehouses.forEach(w => warehouseLookup.set(w._id.toString(), w));

    const vehicleLookup = new Map<string, any>();
    vehicles.forEach(v => vehicleLookup.set(v._id.toString(), v));

    const driverLookup = new Map<string, any>();
    drivers.forEach(d => driverLookup.set(d._id.toString(), d));

    const shipmentData = activeShipments
      .map(s => {
        const destCoords = s.destinationLocation?.coordinates || null;
        if (!destCoords) return null;

        let originCoords: number[] | null = null;
        let originName = '';
        if (s.originWarehouseId) {
          const originWh = warehouseLookup.get(s.originWarehouseId.toString());
          if (originWh?.location?.coordinates) {
            originCoords = originWh.location.coordinates;
            originName = originWh.name;
          }
        }

        let destName = '';
        if (s.destinationWarehouseId) {
          const destWh = warehouseLookup.get(s.destinationWarehouseId.toString());
          if (destWh) destName = destWh.name;
        }

        let vehicleInfo: any = null;
        if (s.vehicleId) {
          const v = vehicleLookup.get(s.vehicleId.toString());
          if (v) vehicleInfo = { vehicleNumber: v.vehicleNumber, type: v.type, status: v.status };
        }

        let driverInfo: any = null;
        if (s.driverId) {
          const d = driverLookup.get(s.driverId.toString());
          if (d) driverInfo = { name: d.name, phone: d.phone };
        }

        return {
          _id: s._id,
          trackingNumber: s.trackingNumber,
          status: s.status,
          priority: s.priority,
          riskScore: s.riskScore || 0,
          destinationAddress: s.destinationAddress || '',
          destinationCoordinates: destCoords,
          originCoordinates: originCoords,
          originName,
          destName,
          distanceKm: s.distanceKm || 0,
          weightKg: s.weightKg || 0,
          packageCount: s.packageCount || 0,
          vehicle: vehicleInfo,
          driver: driverInfo,
        };
      })
      .filter(Boolean);

    res.json({
      success: true,
      message: 'Map overview retrieved successfully',
      data: { warehouses: warehouseData, shipments: shipmentData },
    });
  } catch (error: any) {
    console.error('Error fetching map overview:', error.message);
    res.json({
      success: true,
      message: 'No data available',
      data: { warehouses: [], shipments: [] },
    });
  }
};

function computeFallbackDistance(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): number {
  const R = 6371000;
  const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
  const dLng = ((destination.lng - origin.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((origin.lat * Math.PI) / 180) *
      Math.cos((destination.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const computeRoute = async (req: Request, res: Response) => {
  try {
    const { origin, destination } = req.body;

    if (!origin || !destination) {
      res.status(400).json({ success: false, message: 'Origin and destination are required' });
      return;
    }

    const cached = await findCachedRoute(origin.lat, origin.lng, destination.lat, destination.lng);
    if (cached) {
      res.json({
        success: true,
        message: 'Route retrieved from cache',
        data: {
          polyline: cached.polyline,
          distanceMeters: cached.distanceMeters,
          duration: cached.durationSeconds.toString(),
        },
      });
      return;
    }

    let encodedPolyline = '';
    let distanceMeters = 0;
    let durationSeconds = 0;

    try {
      const osrmUrl = `${OSRM_BASE_URL}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=polyline`;
      const osrmRes = await throttledOsrmFetch(osrmUrl);
      if (osrmRes.ok) {
        const osrmData = await osrmRes.json();
        const route = osrmData.routes?.[0];
        if (route) {
          encodedPolyline = route.geometry || '';
          distanceMeters = route.distance || 0;
          durationSeconds = route.duration || 0;
        }
      }
    } catch (osrmErr: any) {
      console.warn('OSRM failed, trying ORS:', osrmErr.message);
    }

    if (!encodedPolyline && ORS_BASE_URL) {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (ORS_API_KEY) headers['Authorization'] = ORS_API_KEY;

        const orsRes = await fetch(`${ORS_BASE_URL}/directions/driving-car`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            coordinates: [[origin.lng, origin.lat], [destination.lng, destination.lat]],
            geometry: true,
            geometry_simplify: false,
          }),
        });

        if (orsRes.ok) {
          const orsData = await orsRes.json();
          const route = orsData.features?.[0];
          if (route) {
            encodedPolyline = route.geometry || '';
            distanceMeters = route.properties?.summary?.distance || 0;
            durationSeconds = route.properties?.summary?.duration || 0;
          }
        }
      } catch (orsErr: any) {
        console.warn('ORS also failed:', orsErr.message);
      }
    }

    if (!encodedPolyline) {
      distanceMeters = computeFallbackDistance(
        { lat: origin.lat, lng: origin.lng },
        { lat: destination.lat, lng: destination.lng }
      );
      encodedPolyline = '';
    }

    try {
      const Warehouse = await getWarehouseModel();
      const RouteCache = await getRouteCacheModel();
      const warehouses = await Warehouse.find({ status: 'active' });

      let originWh: any = null;
      let destWh: any = null;
      let minODist = Infinity;
      let minDDist = Infinity;

      for (const wh of warehouses) {
        const coords = wh.location?.coordinates;
        if (!coords) continue;
        const oDist = Math.abs(coords[1] - origin.lat) + Math.abs(coords[0] - origin.lng);
        if (oDist < minODist) { minODist = oDist; originWh = wh; }
        const dDist = Math.abs(coords[1] - destination.lat) + Math.abs(coords[0] - destination.lng);
        if (dDist < minDDist) { minDDist = dDist; destWh = wh; }
      }

      if (originWh && destWh && originWh._id.toString() !== destWh._id.toString() && minODist < 0.05 && minDDist < 0.05) {
        const idA = originWh._id.toString() < destWh._id.toString() ? originWh._id : destWh._id;
        const idB = originWh._id.toString() < destWh._id.toString() ? destWh._id : originWh._id;
        const expiresAt = new Date(Date.now() + 30 * 86400000);

        await RouteCache.findOneAndUpdate(
          { originWarehouseId: idA, destinationWarehouseId: idB },
          {
            originWarehouseId: idA,
            destinationWarehouseId: idB,
            originName: originWh.name,
            destinationName: destWh.name,
            polyline: encodedPolyline,
            distanceMeters,
            durationSeconds,
            travelMode: 'DRIVE',
            computedAt: new Date(),
            expiresAt,
          },
          { upsert: true, new: true }
        );
      }
    } catch (cacheErr: any) {
      console.warn('Failed to cache route:', cacheErr.message);
    }

    res.json({
      success: true,
      message: 'Route computed successfully',
      data: {
        polyline: encodedPolyline,
        distanceMeters,
        duration: durationSeconds.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error computing route:', error.message, error.stack);
    res.status(500).json({ success: false, message: error.message || 'Failed to compute route' });
  }
};

export const precomputeRoutes = async (req: Request, res: Response) => {
  try {
    const { precomputeAllHubRoutes } = await import('../services/routePrecompute');
    const result = await precomputeAllHubRoutes();
    res.json({
      success: true,
      message: 'Route pre-computation completed',
      data: result,
    });
  } catch (error: any) {
    console.error('Error pre-computing routes:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to pre-compute routes' });
  }
};

export const getCachedRoutes = async (req: Request, res: Response) => {
  try {
    const RouteCache = await getRouteCacheModel();
    const routes = await RouteCache.find({ expiresAt: { $gt: new Date() } })
      .sort({ distanceMeters: 1 });

    res.json({
      success: true,
      message: 'Cached routes retrieved',
      data: routes.map((r) => ({
        origin: r.originName,
        destination: r.destinationName,
        distanceKm: (r.distanceMeters / 1000).toFixed(1),
        durationMinutes: Math.round(r.durationSeconds / 60),
        computedAt: r.computedAt,
        expiresAt: r.expiresAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching cached routes:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch cached routes' });
  }
};

export const clearRouteCache = async (req: Request, res: Response) => {
  try {
    const RouteCache = await getRouteCacheModel();
    const result = await RouteCache.deleteMany({});
    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} cached routes`,
      data: { deletedCount: result.deletedCount },
    });
  } catch (error: any) {
    console.error('Error clearing route cache:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to clear cache' });
  }
};
