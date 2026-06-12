import mongoose, { Document, Schema } from 'mongoose';
import { getCompanyConnection } from '../config/database';

export interface IDriver extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  licenseNumber: string;
  rating: number;
  onTimeRate: number;
  totalDeliveries: number;
  totalDelays: number;
  yearsExperience: number;
  status: 'active' | 'inactive' | 'on_leave';
  currentShipmentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const driverSchema = new Schema<IDriver>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    licenseNumber: { type: String, required: true, unique: true },
    rating: { type: Number, default: 3.0, min: 0, max: 5 },
    onTimeRate: { type: Number, default: 0.8, min: 0, max: 1 },
    totalDeliveries: { type: Number, default: 0 },
    totalDelays: { type: Number, default: 0 },
    yearsExperience: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave'],
      default: 'active',
      index: true,
    },
    currentShipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment' },
  },
  { timestamps: true }
);

let _DriverModel: mongoose.Model<IDriver> | null = null;

export const getDriverModel = async (): Promise<mongoose.Model<IDriver>> => {
  if (_DriverModel) return _DriverModel;
  const conn = await getCompanyConnection();
  _DriverModel = conn.model<IDriver>('Driver', driverSchema);
  return _DriverModel;
};
