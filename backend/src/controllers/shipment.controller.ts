import { Request, Response } from 'express';
import { getShipmentModel } from '../models/Shipment';

export const getAllShipments = async (req: Request, res: Response) => {
  try {
    const Shipment = await getShipmentModel();
    const { page = 1, limit = 20, status, priority, driverId } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (driverId) query.driverId = driverId;

    const shipments = await Shipment.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Shipment.countDocuments(query);

    res.json({
      success: true,
      message: 'Shipments retrieved successfully',
      data: {
        shipments,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Error fetching shipments:', error.message);
    res.json({
      success: true,
      message: 'No database connected',
      data: { shipments: [], total: 0, page: 1, pages: 0 }
    });
  }
};

export const getShipmentById = async (req: Request, res: Response) => {
  try {
    const Shipment = await getShipmentModel();
    const shipment = await Shipment.findById(req.params.shipmentId);
    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }
    res.json({ success: true, message: 'Shipment retrieved successfully', data: shipment });
  } catch (error: any) {
    console.error('Error fetching shipment:', error.message);
    res.status(404).json({ success: false, message: 'Shipment not found' });
  }
};

export const createShipment = async (req: Request, res: Response) => {
  try {
    const Shipment = await getShipmentModel();
    const { originWarehouseId, destinationAddress, priority, trackingNumber } = req.body;

    const shipment = new Shipment({
      trackingNumber: trackingNumber || `LP${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      originWarehouseId,
      destinationAddress,
      priority: priority || 'medium',
      status: 'pending'
    });

    await shipment.save();

    res.status(201).json({ success: true, message: 'Shipment created successfully', data: shipment });
  } catch (error: any) {
    console.error('Error creating shipment:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateShipment = async (req: Request, res: Response) => {
  try {
    const Shipment = await getShipmentModel();
    const shipment = await Shipment.findByIdAndUpdate(req.params.shipmentId, req.body, { new: true, runValidators: true });

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    res.json({ success: true, message: 'Shipment updated successfully', data: shipment });
  } catch (error: any) {
    console.error('Error updating shipment:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteShipment = async (req: Request, res: Response) => {
  try {
    const Shipment = await getShipmentModel();
    const shipment = await Shipment.findByIdAndDelete(req.params.shipmentId);
    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }
    res.json({ success: true, message: 'Shipment deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting shipment:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignDriver = async (req: Request, res: Response) => {
  try {
    const Shipment = await getShipmentModel();
    const { driverId } = req.body;
    const shipment = await Shipment.findByIdAndUpdate(
      req.params.shipmentId,
      { driverId, status: 'in_transit' },
      { new: true }
    );

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    res.json({ success: true, message: 'Driver assigned successfully', data: shipment });
  } catch (error: any) {
    console.error('Error assigning driver:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignVehicle = async (req: Request, res: Response) => {
  try {
    const Shipment = await getShipmentModel();
    const { vehicleId } = req.body;
    const shipment = await Shipment.findByIdAndUpdate(
      req.params.shipmentId,
      { vehicleId },
      { new: true }
    );

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    res.json({ success: true, message: 'Vehicle assigned successfully', data: shipment });
  } catch (error: any) {
    console.error('Error assigning vehicle:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
