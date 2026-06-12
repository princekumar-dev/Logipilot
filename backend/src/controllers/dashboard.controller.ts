import { Request, Response } from 'express';
import { getShipmentModel, IShipment } from '../models/Shipment';
import { getDriverModel } from '../models/Driver';
import { getVehicleModel } from '../models/Vehicle';

const emptyStats = {
  activeShipments: 0,
  delayedShipments: 0,
  deliveredShipments: 0,
  pendingShipments: 0,
  inTransitShipments: 0,
  cancelledShipments: 0,
  totalShipments: 0,
  onTimeRate: 100,
  fleetUtilization: 0,
  avgDelay: 0,
  avgRisk: 0,
  totalDrivers: 0,
  activeDrivers: 0,
  totalVehicles: 0,
  activeVehicles: 0,
  maintenanceVehicles: 0,
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const Shipment = await getShipmentModel();
    const Driver = await getDriverModel();
    const Vehicle = await getVehicleModel();

    const [
      totalShipments,
      activeShipments,
      delayedShipments,
      deliveredShipments,
      pendingShipments,
      inTransitShipments,
      cancelledShipments,
      totalDrivers,
      activeDrivers,
      totalVehicles,
      activeVehicles,
      maintenanceVehicles,
    ] = await Promise.all([
      Shipment.countDocuments(),
      Shipment.countDocuments({ status: { $in: ['in_transit', 'pending', 'delayed'] } }),
      Shipment.countDocuments({ status: 'delayed' }),
      Shipment.countDocuments({ status: 'delivered' }),
      Shipment.countDocuments({ status: 'pending' }),
      Shipment.countDocuments({ status: 'in_transit' }),
      Shipment.countDocuments({ status: 'cancelled' }),
      Driver.countDocuments(),
      Driver.countDocuments({ status: 'active' }),
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: { $in: ['available', 'in_use'] } }),
      Vehicle.countDocuments({ status: 'maintenance' }),
    ]);

    const completedShipments = deliveredShipments + delayedShipments;
    const onTimeRate = completedShipments > 0
      ? Number(((deliveredShipments / completedShipments) * 100).toFixed(1))
      : 100;

    const fleetUtilization = totalVehicles > 0
      ? Number(((activeVehicles / totalVehicles) * 100).toFixed(0))
      : 0;

    const avgDelay = delayedShipments > 0
      ? await Shipment.aggregate([
          { $match: { status: 'delayed', predictedDelay: { $exists: true, $gt: 0 } } },
          { $group: { _id: null, avg: { $avg: '$predictedDelay' } } },
        ]).then((r: any[]) => r[0]?.avg ? Math.round(r[0].avg) : 0)
      : 0;

    const avgRisk = await Shipment.aggregate([
      { $match: { riskScore: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$riskScore' } } },
    ]).then((r: any[]) => r[0]?.avg ? Math.round(r[0].avg) : 0);

    res.json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: {
        activeShipments,
        delayedShipments,
        deliveredShipments,
        pendingShipments,
        inTransitShipments,
        cancelledShipments,
        totalShipments,
        onTimeRate,
        fleetUtilization,
        avgDelay,
        avgRisk,
        totalDrivers,
        activeDrivers,
        totalVehicles,
        activeVehicles,
        maintenanceVehicles,
      }
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error.message);
    res.json({ success: true, message: 'No database connected', data: emptyStats });
  }
};

function buildShipmentRow(shipment: IShipment) {
  const riskScore = shipment.riskScore ?? 0;
  const delayProbability = shipment.predictedDelay
    ? Math.min(shipment.predictedDelay / 60, 0.99)
    : riskScore > 80 ? 0.9
    : riskScore > 60 ? 0.5
    : 0.2;

  const factors = [];
  if (riskScore > 50) factors.push({ name: 'Traffic Congestion', impact: Math.min(riskScore - 30, 40) });
  if (shipment.priority === 'critical') factors.push({ name: 'Tight Deadline Window', impact: 15 });
  if (shipment.status === 'delayed') factors.push({ name: 'Weather Conditions', impact: 20 });
  if (factors.length === 0) factors.push({ name: 'Route Conditions', impact: 10 });

  const baseETA = shipment.eta ? new Date(shipment.eta) : new Date(Date.now() + 2 * 60 * 60 * 1000);

  return {
    shipmentId: shipment._id.toString(),
    trackingNumber: shipment.trackingNumber,
    delayProbability: Number(delayProbability.toFixed(2)),
    predictedDelayMinutes: shipment.predictedDelay ?? 0,
    predictedETA: baseETA,
    riskScore,
    confidence: 0.9,
    factors: factors.sort((a, b) => b.impact - a.impact),
  };
}

let highRiskCache: { data: any; timestamp: number } | null = null;
const HIGH_RISK_CACHE_TTL = 30_000;

export const getHighRiskShipments = async (req: Request, res: Response) => {
  try {
    if (highRiskCache && Date.now() - highRiskCache.timestamp < HIGH_RISK_CACHE_TTL) {
      return res.json({ success: true, data: highRiskCache.data });
    }

    const Shipment = await getShipmentModel();

    const activeShipments = await Shipment.find({
      status: { $in: ['in_transit', 'delayed', 'pending'] },
    })
      .sort({ riskScore: -1, priority: -1 })
      .limit(10)
      .lean();

    const data = activeShipments
      .map((s) => buildShipmentRow(s as IShipment))
      .slice(0, 8);

    highRiskCache = { data, timestamp: Date.now() };

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching high-risk shipments:', error.message);
    res.json({ success: true, data: [] });
  }
};
