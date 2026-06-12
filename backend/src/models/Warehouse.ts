import mongoose, { Document, Schema } from 'mongoose';
import { getCompanyConnection } from '../config/database';

export interface IWarehouse extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  address: string;
  location: { type: string; coordinates: number[] };
  capacity: number;
  currentOccupancy: number;
  contactPhone?: string;
  contactEmail?: string;
  operatingHours: { open: string; close: string };
  status: 'active' | 'inactive' | 'full';
  createdAt: Date;
  updatedAt: Date;
}

export const warehouseSchema = new Schema<IWarehouse>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    capacity: { type: Number, required: true },
    currentOccupancy: { type: Number, default: 0 },
    contactPhone: { type: String },
    contactEmail: { type: String },
    operatingHours: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '20:00' },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'full'],
      default: 'active',
    },
  },
  { timestamps: true }
);

warehouseSchema.index({ location: '2dsphere' });

let _WarehouseModel: mongoose.Model<IWarehouse> | null = null;

export const getWarehouseModel = async (): Promise<mongoose.Model<IWarehouse>> => {
  if (_WarehouseModel) return _WarehouseModel;
  const conn = await getCompanyConnection();
  _WarehouseModel = conn.model<IWarehouse>('Warehouse', warehouseSchema);
  return _WarehouseModel;
};
