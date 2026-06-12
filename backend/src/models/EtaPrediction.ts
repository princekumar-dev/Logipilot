import mongoose, { Document, Schema } from 'mongoose';

export interface IEtaPrediction extends Document {
  shipmentId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  predictedETA: Date;
  confidence: number;
  delayMinutes: number;
  factors: Array<{ name: string; impact: number }>;
  modelVersion: string;
  generatedAt: Date;
}

const etaPredictionSchema = new Schema<IEtaPrediction>(
  {
    shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment', required: true, index: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    predictedETA: { type: Date, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    delayMinutes: { type: Number, default: 0, min: 0 },
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

etaPredictionSchema.index({ shipmentId: 1, generatedAt: -1 });

export default mongoose.model<IEtaPrediction>('EtaPrediction', etaPredictionSchema);
