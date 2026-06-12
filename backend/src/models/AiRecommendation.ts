import mongoose, { Document, Schema } from 'mongoose';
import { getCompanyConnection } from '../config/database';

export interface IAiRecommendation extends Document {
  shipmentId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  type: 'route_optimization' | 'delay_mitigation' | 'resource_reassignment' | 'warehouse_allocation' | 'priority_escalation';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expectedTimeSavedMinutes?: number;
  expectedCostSaved?: number;
  alternateRouteGeometry?: object;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  generatedAt: Date;
  expiresAt?: Date;
}

export const aiRecommendationSchema = new Schema<IAiRecommendation>(
  {
    shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment', required: true, index: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    type: {
      type: String,
      enum: ['route_optimization', 'delay_mitigation', 'resource_reassignment', 'warehouse_allocation', 'priority_escalation'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    expectedTimeSavedMinutes: { type: Number },
    expectedCostSaved: { type: Number },
    alternateRouteGeometry: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
      index: true,
    },
    generatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

aiRecommendationSchema.index({ companyId: 1, status: 1 });
aiRecommendationSchema.index({ shipmentId: 1, generatedAt: -1 });

let _AiRecommendationModel: mongoose.Model<IAiRecommendation> | null = null;

export const getAiRecommendationModel = async (): Promise<mongoose.Model<IAiRecommendation>> => {
  if (_AiRecommendationModel) return _AiRecommendationModel;
  const conn = await getCompanyConnection();
  _AiRecommendationModel = conn.model<IAiRecommendation>('AiRecommendation', aiRecommendationSchema);
  return _AiRecommendationModel;
};
