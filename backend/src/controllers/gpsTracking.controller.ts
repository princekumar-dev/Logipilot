import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { getGpsTrackingModel } from '../models/GpsTracking';
import { getVehicleModel } from '../models/Vehicle';
import { getShipmentModel } from '../models/Shipment';

export const reportLocation = async (req: Request, res: Response) => {
  try {
    const { vehicleId, driverId, shipmentId, latitude, longitude, speed, heading, altitude, accuracy } = req.body;

    if (!vehicleId || latitude == null || longitude == null) {
      res.status(400).json({ success: false, message: 'vehicleId, latitude, and longitude are required' });
      return;
    }

    const GpsTracking = await getGpsTrackingModel();

    const gpsRecord = await GpsTracking.create({
      vehicleId: new mongoose.Types.ObjectId(vehicleId),
      driverId: driverId ? new mongoose.Types.ObjectId(driverId) : undefined,
      shipmentId: shipmentId ? new mongoose.Types.ObjectId(shipmentId) : undefined,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      speed: speed || 0,
      heading: heading || 0,
      altitude: altitude,
      accuracy: accuracy,
      timestamp: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Location reported successfully',
      data: { _id: gpsRecord._id, timestamp: gpsRecord.timestamp },
    });
  } catch (error: any) {
    console.error('Error reporting location:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to report location' });
  }
};

export const reportBatchLocations = async (req: Request, res: Response) => {
  try {
    const { locations } = req.body;

    if (!Array.isArray(locations) || locations.length === 0) {
      res.status(400).json({ success: false, message: 'locations array is required' });
      return;
    }

    const GpsTracking = await getGpsTrackingModel();

    const records = locations.map((loc: any) => ({
      vehicleId: new mongoose.Types.ObjectId(loc.vehicleId),
      driverId: loc.driverId ? new mongoose.Types.ObjectId(loc.driverId) : undefined,
      shipmentId: loc.shipmentId ? new mongoose.Types.ObjectId(loc.shipmentId) : undefined,
      location: {
        type: 'Point' as const,
        coordinates: [loc.longitude, loc.latitude],
      },
      speed: loc.speed || 0,
      heading: loc.heading || 0,
      altitude: loc.altitude,
      accuracy: loc.accuracy,
      timestamp: loc.timestamp ? new Date(loc.timestamp) : new Date(),
    }));

    const result = await GpsTracking.insertMany(records, { ordered: false });

    res.status(201).json({
      success: true,
      message: `${result.length} locations reported successfully`,
      data: { count: result.length },
    });
  } catch (error: any) {
    console.error('Error reporting batch locations:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to report locations' });
  }
};

export const getLatestVehicleLocations = async (req: Request, res: Response) => {
  try {
    const GpsTracking = await getGpsTrackingModel();
    const Vehicle = await getVehicleModel();

    const vehicles = await Vehicle.find({ status: { $in: ['available', 'in_use', 'maintenance'] } })
      .limit(50)
      .sort({ createdAt: -1 });

    const vehicleIds = vehicles.map(v => v._id);

    const latestLocations = await GpsTracking.aggregate([
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
    ]);

    const locationMap = new Map<string, any>();
    latestLocations.forEach(loc => locationMap.set(loc._id.toString(), loc));

    const vehicleMap = new Map<string, any>();
    vehicles.forEach(v => vehicleMap.set(v._id.toString(), v));

    const result = vehicles
      .map(v => {
        const loc = locationMap.get(v._id.toString());
        const vehicle = vehicleMap.get(v._id.toString());

        if (!loc?.location?.coordinates) return null;

        return {
          _id: v._id,
          vehicleNumber: v.vehicleNumber,
          type: v.type,
          status: v.status,
          healthScore: v.healthScore,
          fuelType: v.fuelType,
          location: {
            lat: loc.location.coordinates[1],
            lng: loc.location.coordinates[0],
          },
          speed: loc.speed || 0,
          heading: loc.heading || 0,
          accuracy: loc.accuracy,
          lastGpsTimestamp: loc.timestamp,
          shipmentId: v.currentShipmentId || null,
        };
      })
      .filter(Boolean);

    res.json({
      success: true,
      message: 'Vehicle GPS locations retrieved successfully',
      data: { vehicles: result },
    });
  } catch (error: any) {
    console.error('Error fetching vehicle GPS locations:', error.message);
    res.json({
      success: true,
      message: 'No GPS data available',
      data: { vehicles: [] },
    });
  }
};

export const getVehicleLocationHistory = async (req: Request, res: Response) => {
  try {
    const vehicleId = req.params.vehicleId as string;
    const { from, to, limit: limitStr } = req.query;

    const GpsTracking = await getGpsTrackingModel();

    const filter: any = { vehicleId: new mongoose.Types.ObjectId(vehicleId) };

    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from as string);
      if (to) filter.timestamp.$lte = new Date(to as string);
    }

    const limit = Math.min(parseInt(limitStr as string) || 100, 1000);

    const history = await GpsTracking.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('location speed heading altitude accuracy timestamp');

    res.json({
      success: true,
      message: 'Location history retrieved',
      data: history.map(h => ({
        lat: h.location.coordinates[1],
        lng: h.location.coordinates[0],
        speed: h.speed,
        heading: h.heading,
        accuracy: h.accuracy,
        timestamp: h.timestamp,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching location history:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch location history' });
  }
};
