import mongoose, { Document, Schema } from 'mongoose';
import { getCompanyConnection } from '../config/database';

export interface IShipmentFeature extends Document {
  shipmentId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  trafficScore: number;
  weatherScore: number;
  distanceKm: number;
  driverScore: number;
  vehicleScore: number;
  warehouseCongestionScore: number;
  historicalDelayRate: number;
  roadType: 'highway' | 'urban' | 'rural' | 'mixed';
  dispatchHour: number;
  dayOfWeek: number;
  month: number;
  isHoliday: boolean;
  isPeakHour: boolean;
  weightKg: number;
  packageCount: number;
  actualDelayMinutes: number;
  wasDelayed: boolean;
  generatedAt: Date;
}

export const shipmentFeatureSchema = new Schema<IShipmentFeature>(
  {
    shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment', required: true, unique: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    trafficScore: { type: Number, default: 0, min: 0, max: 100 },
    weatherScore: { type: Number, default: 0, min: 0, max: 100 },
    distanceKm: { type: Number, default: 0 },
    driverScore: { type: Number, default: 0, min: 0, max: 100 },
    vehicleScore: { type: Number, default: 0, min: 0, max: 100 },
    warehouseCongestionScore: { type: Number, default: 0, min: 0, max: 100 },
    historicalDelayRate: { type: Number, default: 0, min: 0, max: 1 },
    roadType: {
      type: String,
      enum: ['highway', 'urban', 'rural', 'mixed'],
      default: 'mixed',
    },
    dispatchHour: { type: Number, min: 0, max: 23 },
    dayOfWeek: { type: Number, min: 0, max: 6 },
    month: { type: Number, min: 1, max: 12 },
    isHoliday: { type: Boolean, default: false },
    isPeakHour: { type: Boolean, default: false },
    weightKg: { type: Number, default: 0 },
    packageCount: { type: Number, default: 1 },
    actualDelayMinutes: { type: Number, default: 0 },
    wasDelayed: { type: Boolean, default: false },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

shipmentFeatureSchema.index({ companyId: 1, wasDelayed: 1 });
shipmentFeatureSchema.index({ generatedAt: -1 });

let _ShipmentFeatureModel: mongoose.Model<IShipmentFeature> | null = null;

export const getShipmentFeatureModel = async (): Promise<mongoose.Model<IShipmentFeature>> => {
  if (_ShipmentFeatureModel) return _ShipmentFeatureModel;
  const conn = await getCompanyConnection();
  _ShipmentFeatureModel = conn.model<IShipmentFeature>('ShipmentFeature', shipmentFeatureSchema);
  return _ShipmentFeatureModel;
};
