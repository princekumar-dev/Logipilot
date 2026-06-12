import { Request, Response } from 'express';
import { getDriverModel } from '../models/Driver';
import User from '../models/User';

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('name email role');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const Driver = await getDriverModel();
    const driver = await Driver.findOne({ email: user.email });

    if (!driver) {
      return res.json({
        success: true,
        data: {
          _id: userId,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: '',
          licenseNumber: '',
          rating: 0,
          onTimeRate: 0,
          totalDeliveries: 0,
          totalDelays: 0,
          yearsExperience: 0,
          status: 'active' as const,
        }
      });
    }

    res.json({ success: true, data: driver });
  } catch (error: any) {
    console.error('Error fetching driver profile:', error.message);
    res.json({ success: true, data: null });
  }
};

export const getAllDrivers = async (req: Request, res: Response) => {
  try {
    const Driver = await getDriverModel();
    const { page = 1, limit = 50, status } = req.query;

    const query: any = {};
    if (status) query.status = status;

    const drivers = await Driver.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Driver.countDocuments(query);

    res.json({
      success: true,
      message: 'Drivers retrieved successfully',
      data: { drivers, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error: any) {
    console.error('Error fetching drivers:', error.message);
    res.json({
      success: true,
      message: 'No database connected',
      data: { drivers: [], total: 0, page: 1, pages: 0 }
    });
  }
};

export const getDriverById = async (req: Request, res: Response) => {
  try {
    const Driver = await getDriverModel();
    const driver = await Driver.findById(req.params.driverId);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, message: 'Driver retrieved successfully', data: driver });
  } catch (error: any) {
    console.error('Error fetching driver:', error.message);
    res.status(404).json({ success: false, message: 'Driver not found' });
  }
};
