import mongoose, { Document, Schema } from 'mongoose';
import { getCompanyConnection } from '../config/database';

export interface IRiskScore extends Document {
  shipmentId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  breakdown: {
    traffic: number;
    weather: number;
    route: number;
    driver: number;
    vehicle: number;
    warehouse: number;
  };
  lisScore: number;
  modelVersion: string;
  generatedAt: Date;
}

export const riskScoreSchema = new Schema<IRiskScore>(
  {
    shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment', required: true, index: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    riskScore: { type: Number, required: true, min: 0, max: 100 },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    breakdown: {
      traffic: { type: Number, default: 0, min: 0, max: 100 },
      weather: { type: Number, default: 0, min: 0, max: 100 },
      route: { type: Number, default: 0, min: 0, max: 100 },
      driver: { type: Number, default: 0, min: 0, max: 100 },
      vehicle: { type: Number, default: 0, min: 0, max: 100 },
      warehouse: { type: Number, default: 0, min: 0, max: 100 },
    },
    lisScore: { type: Number, required: true, min: 0, max: 100 },
    modelVersion: { type: String, default: 'weighted-v1' },
    generatedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

riskScoreSchema.index({ shipmentId: 1, generatedAt: -1 });

let _RiskScoreModel: mongoose.Model<IRiskScore> | null = null;

export const getRiskScoreModel = async (): Promise<mongoose.Model<IRiskScore>> => {
  if (_RiskScoreModel) return _RiskScoreModel;
  const conn = await getCompanyConnection();
  _RiskScoreModel = conn.model<IRiskScore>('RiskScore', riskScoreSchema);
  return _RiskScoreModel;
};
