import mongoose, { Document, Schema } from 'mongoose';
import { getCompanyConnection } from '../config/database';

export interface IVehicle extends Document {
  companyId: mongoose.Types.ObjectId;
  vehicleNumber: string;
  type: 'truck' | 'van' | 'bike' | 'container';
  capacityKg: number;
  healthScore: number;
  fuelType: 'diesel' | 'petrol' | 'electric' | 'cng';
  lastServiceDate?: Date;
  nextServiceDate?: Date;
  insuranceExpiry?: Date;
  status: 'available' | 'in_use' | 'maintenance' | 'retired';
  currentDriverId?: mongoose.Types.ObjectId;
  currentShipmentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const vehicleSchema = new Schema<IVehicle>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    vehicleNumber: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ['truck', 'van', 'bike', 'container'],
      default: 'truck',
    },
    capacityKg: { type: Number, required: true },
    healthScore: { type: Number, default: 100, min: 0, max: 100 },
    fuelType: {
      type: String,
      enum: ['diesel', 'petrol', 'electric', 'cng'],
      default: 'diesel',
    },
    lastServiceDate: { type: Date },
    nextServiceDate: { type: Date },
    insuranceExpiry: { type: Date },
    status: {
      type: String,
      enum: ['available', 'in_use', 'maintenance', 'retired'],
      default: 'available',
      index: true,
    },
    currentDriverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
    currentShipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment' },
  },
  { timestamps: true }
);

let _VehicleModel: mongoose.Model<IVehicle> | null = null;

export const getVehicleModel = async (): Promise<mongoose.Model<IVehicle>> => {
  if (_VehicleModel) return _VehicleModel;
  const conn = await getCompanyConnection();
  _VehicleModel = conn.model<IVehicle>('Vehicle', vehicleSchema);
  return _VehicleModel;
};
