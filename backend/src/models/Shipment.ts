import mongoose, { Document, Schema } from 'mongoose';

export interface IShipment extends Document {
  trackingNumber: string;
  originWarehouseId?: mongoose.Types.ObjectId;
  destinationWarehouseId?: mongoose.Types.ObjectId;
  destinationAddress?: string; // fallback if warehouse isn't used
  driverId?: mongoose.Types.ObjectId;
  vehicleId?: mongoose.Types.ObjectId;
  status: 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  riskScore?: number;
  predictedDelay?: number; // in minutes
  eta?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const shipmentSchema = new Schema<IShipment>(
  {
    trackingNumber: { type: String, required: true, unique: true, index: true },
    originWarehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    destinationWarehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    destinationAddress: { type: String },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    status: {
      type: String,
      enum: ['pending', 'in_transit', 'delivered', 'delayed', 'cancelled'],
      default: 'pending',
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    riskScore: { type: Number, min: 0, max: 100 },
    predictedDelay: { type: Number },
    eta: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model<IShipment>('Shipment', shipmentSchema);
