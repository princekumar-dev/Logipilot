import { Request, Response } from 'express';
import { getWarehouseModel } from '../models/Warehouse';

export const getAllWarehouses = async (req: Request, res: Response) => {
  try {
    const Warehouse = await getWarehouseModel();
    const { page = 1, limit = 50, status } = req.query;

    const query: any = {};
    if (status) query.status = status;

    const warehouses = await Warehouse.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Warehouse.countDocuments(query);

    res.json({
      success: true,
      message: 'Warehouses retrieved successfully',
      data: { warehouses, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error: any) {
    console.error('Error fetching warehouses:', error.message);
    res.json({
      success: true,
      message: 'No database connected',
      data: { warehouses: [], total: 0, page: 1, pages: 0 }
    });
  }
};

export const getWarehouseById = async (req: Request, res: Response) => {
  try {
    const Warehouse = await getWarehouseModel();
    const warehouse = await Warehouse.findById(req.params.warehouseId);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }
    res.json({ success: true, message: 'Warehouse retrieved successfully', data: warehouse });
  } catch (error: any) {
    console.error('Error fetching warehouse:', error.message);
    res.status(404).json({ success: false, message: 'Warehouse not found' });
  }
};
