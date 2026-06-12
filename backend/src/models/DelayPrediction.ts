import mongoose, { Document, Schema } from 'mongoose';
import { getCompanyConnection } from '../config/database';

export interface IDelayPrediction extends Document {
  shipmentId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  delayProbability: number;
  predictedDelayMinutes: number;
  confidence: number;
  factors: Array<{ name: string; impact: number }>;
  modelVersion: string;
  generatedAt: Date;
}

export const delayPredictionSchema = new Schema<IDelayPrediction>(
  {
    shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment', required: true, index: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    delayProbability: { type: Number, required: true, min: 0, max: 1 },
    predictedDelayMinutes: { type: Number, required: true, min: 0 },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    factors: [
      {
        name: { type: String, required: true },
        impact: { type: Number, required: true },
      },
    ],
    modelVersion: { type: String, default: 'heuristic-v1' },
    generatedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

delayPredictionSchema.index({ shipmentId: 1, generatedAt: -1 });

let _DelayPredictionModel: mongoose.Model<IDelayPrediction> | null = null;

export const getDelayPredictionModel = async (): Promise<mongoose.Model<IDelayPrediction>> => {
  if (_DelayPredictionModel) return _DelayPredictionModel;
  const conn = await getCompanyConnection();
  _DelayPredictionModel = conn.model<IDelayPrediction>('DelayPrediction', delayPredictionSchema);
  return _DelayPredictionModel;
};
