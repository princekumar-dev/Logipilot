import { Request, Response } from 'express';
import { getShipmentModel } from '../models/Shipment';

const emptyAnalytics = {
  summary: {
    totalShipments: 0,
    deliveredShipments: 0,
    delayedShipments: 0,
    cancelledShipments: 0,
    pendingShipments: 0,
    inTransitShipments: 0,
    onTimeRate: 0,
    avgDelayMinutes: 0,
    avgRisk: 0,
  },
  volumeTrend: [],
  delayCauses: [],
  priorityBreakdown: [],
};

export const getAnalyticsSummary = async (req: Request, res: Response) => {
  try {
    const Shipment = await getShipmentModel();
    const { period = '30' } = req.query;
    const days = Number(period);
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const [
      totalShipments,
      deliveredShipments,
      delayedShipments,
      cancelledShipments,
      pendingShipments,
      inTransitShipments,
    ] = await Promise.all([
      Shipment.countDocuments({ createdAt: { $gte: startDate } }),
      Shipment.countDocuments({ status: 'delivered', createdAt: { $gte: startDate } }),
      Shipment.countDocuments({ status: 'delayed', createdAt: { $gte: startDate } }),
      Shipment.countDocuments({ status: 'cancelled', createdAt: { $gte: startDate } }),
      Shipment.countDocuments({ status: 'pending', createdAt: { $gte: startDate } }),
      Shipment.countDocuments({ status: 'in_transit', createdAt: { $gte: startDate } }),
    ]);

    const completedShipments = deliveredShipments + delayedShipments;
    const onTimeRate = completedShipments > 0
      ? Number(((deliveredShipments / completedShipments) * 100).toFixed(1))
      : 100;

    const avgDelayResult = await Shipment.aggregate([
      { $match: { status: 'delayed', predictedDelay: { $exists: true, $gt: 0 }, createdAt: { $gte: startDate } } },
      { $group: { _id: null, avg: { $avg: '$predictedDelay' } } },
    ]);
    const avgDelayMinutes = avgDelayResult[0]?.avg ? Math.round(avgDelayResult[0].avg) : 0;

    const avgRiskResult = await Shipment.aggregate([
      { $match: { riskScore: { $exists: true }, createdAt: { $gte: startDate } } },
      { $group: { _id: null, avg: { $avg: '$riskScore' } } },
    ]);
    const avgRisk = avgRiskResult[0]?.avg ? Math.round(avgRiskResult[0].avg) : 0;

    const volumeTrend = await Shipment.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const delayCauses = await Shipment.aggregate([
      { $match: { status: 'delayed', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $ifNull: ['$delayReason', 'Unknown'] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    const priorityBreakdown = await Shipment.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: {
        summary: {
          totalShipments,
          deliveredShipments,
          delayedShipments,
          cancelledShipments,
          pendingShipments,
          inTransitShipments,
          onTimeRate,
          avgDelayMinutes,
          avgRisk,
        },
        volumeTrend: volumeTrend.map(d => ({ date: d._id, count: d.count })),
        delayCauses: delayCauses.map(d => ({ cause: d._id, count: d.count })),
        priorityBreakdown: priorityBreakdown.map(d => ({ priority: d._id, count: d.count })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error.message);
    res.json({ success: true, message: 'No database connected', data: emptyAnalytics });
  }
};
