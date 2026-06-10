import { Request, Response } from 'express';
import Shipment from '../models/Shipment';

// Get all shipments with pagination & filtering
export const getAllShipments = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, priority } = req.query;
    
    const query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

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
    res.status(500).json({ success: false, message: 'Error fetching shipments', error: error.message });
  }
};

// Get single shipment
export const getShipmentById = async (req: Request, res: Response) => {
  try {
    const shipment = await Shipment.findById(req.params.shipmentId);
    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }
    res.json({ success: true, message: 'Shipment retrieved successfully', data: shipment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching shipment', error: error.message });
  }
};

// Create shipment
export const createShipment = async (req: Request, res: Response) => {
  try {
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
    res.status(500).json({ success: false, message: 'Error creating shipment', error: error.message });
  }
};

// Update shipment
export const updateShipment = async (req: Request, res: Response) => {
  try {
    const shipment = await Shipment.findByIdAndUpdate(req.params.shipmentId, req.body, { new: true, runValidators: true });
    
    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }
    
    res.json({ success: true, message: 'Shipment updated successfully', data: shipment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error updating shipment', error: error.message });
  }
};

// Delete shipment
export const deleteShipment = async (req: Request, res: Response) => {
  try {
    const shipment = await Shipment.findByIdAndDelete(req.params.shipmentId);
    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }
    res.json({ success: true, message: 'Shipment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error deleting shipment', error: error.message });
  }
};

// Assign driver
export const assignDriver = async (req: Request, res: Response) => {
  try {
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
    res.status(500).json({ success: false, message: 'Error assigning driver', error: error.message });
  }
};

// Assign vehicle
export const assignVehicle = async (req: Request, res: Response) => {
  try {
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
    res.status(500).json({ success: false, message: 'Error assigning vehicle', error: error.message });
  }
};
