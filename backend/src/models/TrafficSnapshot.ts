import mongoose, { Document, Schema } from 'mongoose';

export interface ITrafficSnapshot extends Document {
  location: { type: string; coordinates: number[] };
  roadName?: string;
  congestionLevel: number;
  averageSpeed: number;
  freeFlowSpeed: number;
  delayMinutes: number;
  incidents: Array<{ type: string; description: string; severity: 'low' | 'medium' | 'high' }>;
  source: 'tomtom' | 'google' | 'manual';
  timestamp: Date;
}

const trafficSnapshotSchema = new Schema<ITrafficSnapshot>(
  {
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    roadName: { type: String },
    congestionLevel: { type: Number, required: true, min: 0, max: 100 },
    averageSpeed: { type: Number, required: true },
    freeFlowSpeed: { type: Number, required: true },
    delayMinutes: { type: Number, default: 0 },
    incidents: [
      {
        type: { type: String },
        description: { type: String },
        severity: { type: String, enum: ['low', 'medium', 'high'] },
      },
    ],
    source: { type: String, enum: ['tomtom', 'google', 'manual'], default: 'google' },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

trafficSnapshotSchema.index({ location: '2dsphere' });
trafficSnapshotSchema.index({ timestamp: -1 });

export default mongoose.model<ITrafficSnapshot>('TrafficSnapshot', trafficSnapshotSchema);
