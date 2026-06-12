import mongoose, { Document, Schema } from 'mongoose';
import { getCompanyConnection } from '../config/database';

export interface IRouteCache extends Document {
  originWarehouseId: mongoose.Types.ObjectId;
  destinationWarehouseId: mongoose.Types.ObjectId;
  originName: string;
  destinationName: string;
  polyline: string;
  distanceMeters: number;
  durationSeconds: number;
  travelMode: string;
  computedAt: Date;
  expiresAt: Date;
}

const routeCacheSchema = new Schema<IRouteCache>(
  {
    originWarehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    destinationWarehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    originName: { type: String, required: true },
    destinationName: { type: String, required: true },
    polyline: { type: String, required: true },
    distanceMeters: { type: Number, required: true },
    durationSeconds: { type: Number, required: true },
    travelMode: { type: String, default: 'DRIVE' },
    computedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

routeCacheSchema.index({ originWarehouseId: 1, destinationWarehouseId: 1 }, { unique: true });
routeCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

let _RouteCacheModel: mongoose.Model<IRouteCache> | null = null;

export const getRouteCacheModel = async (): Promise<mongoose.Model<IRouteCache>> => {
  if (_RouteCacheModel) return _RouteCacheModel;
  const conn = await getCompanyConnection();
  _RouteCacheModel = conn.model<IRouteCache>('RouteCache', routeCacheSchema);
  return _RouteCacheModel;
};
