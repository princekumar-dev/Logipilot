import mongoose, { Document, Schema } from 'mongoose';
import { getCompanyConnection } from '../config/database';

export interface IShipment extends Document {
  trackingNumber: string;
  companyId?: mongoose.Types.ObjectId;
  originWarehouseId?: mongoose.Types.ObjectId;
  destinationWarehouseId?: mongoose.Types.ObjectId;
  destinationAddress?: string;
  destinationLocation?: { type: string; coordinates: number[] };
  driverId?: mongoose.Types.ObjectId;
  vehicleId?: mongoose.Types.ObjectId;
  routeId?: mongoose.Types.ObjectId;
  status: 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  riskScore?: number;
  predictedDelay?: number;
  predictedETA?: Date;
  eta?: Date;
  distanceKm?: number;
  weightKg?: number;
  packageCount?: number;
  plannedDispatchTime?: Date;
  actualDispatchTime?: Date;
  plannedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  lisScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export const shipmentSchema = new Schema<IShipment>(
  {
    trackingNumber: { type: String, required: true, unique: true, index: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', index: true },
    originWarehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    destinationWarehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    destinationAddress: { type: String },
    destinationLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] },
    },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    routeId: { type: Schema.Types.ObjectId, ref: 'Route' },
    status: {
      type: String,
      enum: ['pending', 'in_transit', 'delivered', 'delayed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    riskScore: { type: Number, min: 0, max: 100 },
    predictedDelay: { type: Number },
    predictedETA: { type: Date },
    eta: { type: Date },
    distanceKm: { type: Number },
    weightKg: { type: Number },
    packageCount: { type: Number, default: 1 },
    plannedDispatchTime: { type: Date },
    actualDispatchTime: { type: Date },
    plannedDeliveryTime: { type: Date },
    actualDeliveryTime: { type: Date },
    lisScore: { type: Number, min: 0, max: 100 },
  },
  { timestamps: true }
);

shipmentSchema.index({ 'destinationLocation': '2dsphere' });
shipmentSchema.index({ status: 1, riskScore: -1 });
shipmentSchema.index({ riskScore: -1 });

let _ShipmentModel: mongoose.Model<IShipment> | null = null;

export const getShipmentModel = async (): Promise<mongoose.Model<IShipment>> => {
  if (_ShipmentModel) return _ShipmentModel;
  const conn = await getCompanyConnection();
  _ShipmentModel = conn.model<IShipment>('Shipment', shipmentSchema);
  return _ShipmentModel;
};
