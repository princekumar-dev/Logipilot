import mongoose, { Document, Schema } from 'mongoose';
import { getCompanyConnection } from '../config/database';

export interface IGpsTracking extends Document {
  vehicleId: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  shipmentId?: mongoose.Types.ObjectId;
  location: { type: string; coordinates: number[] };
  speed: number;
  heading: number;
  altitude?: number;
  accuracy?: number;
  timestamp: Date;
}

const gpsTrackingSchema = new Schema<IGpsTracking>(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
    shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment', index: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    speed: { type: Number, default: 0 },
    heading: { type: Number, default: 0 },
    altitude: { type: Number },
    accuracy: { type: Number },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

gpsTrackingSchema.index({ location: '2dsphere' });
gpsTrackingSchema.index({ vehicleId: 1, timestamp: -1 });

let _GpsTrackingModel: mongoose.Model<IGpsTracking> | null = null;

export const getGpsTrackingModel = async (): Promise<mongoose.Model<IGpsTracking>> => {
  if (_GpsTrackingModel) return _GpsTrackingModel;
  const conn = await getCompanyConnection();
  _GpsTrackingModel = conn.model<IGpsTracking>('GpsTracking', gpsTrackingSchema);
  return _GpsTrackingModel;
};
