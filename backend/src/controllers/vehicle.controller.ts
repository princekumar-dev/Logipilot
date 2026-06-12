import { Request, Response } from 'express';
import { getVehicleModel } from '../models/Vehicle';

export const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const Vehicle = await getVehicleModel();
    const { page = 1, limit = 50, status } = req.query;

    const query: any = {};
    if (status) query.status = status;

    const vehicles = await Vehicle.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Vehicle.countDocuments(query);

    res.json({
      success: true,
      message: 'Vehicles retrieved successfully',
      data: { vehicles, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error: any) {
    console.error('Error fetching vehicles:', error.message);
    res.json({
      success: true,
      message: 'No database connected',
      data: { vehicles: [], total: 0, page: 1, pages: 0 }
    });
  }
};

export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const Vehicle = await getVehicleModel();
    const vehicle = await Vehicle.findById(req.params.vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.json({ success: true, message: 'Vehicle retrieved successfully', data: vehicle });
  } catch (error: any) {
    console.error('Error fetching vehicle:', error.message);
    res.status(404).json({ success: false, message: 'Vehicle not found' });
  }
};
