import mongoose, { Document, Schema } from 'mongoose';

export interface IIntegration extends Document {
  companyId: mongoose.Types.ObjectId;
  type: 'database' | 'api';
  name: string;
  provider: string;
  config: {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    ssl?: boolean;
    connectionString?: string;
    url?: string;
    trafficProvider?: string;
    [key: string]: unknown;
  };
  status: 'connected' | 'disconnected' | 'error';
  lastTestedAt?: Date;
  lastTestedResult?: { success: boolean; message: string };
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationSchema: Schema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  type: { type: String, enum: ['database', 'api'], required: true },
  name: { type: String, required: true },
  provider: { type: String, required: true },
  config: {
    type: Schema.Types.Mixed,
    default: {},
  },
  status: { type: String, enum: ['connected', 'disconnected', 'error'], default: 'disconnected' },
  lastTestedAt: { type: Date },
  lastTestedResult: {
    success: { type: Boolean },
    message: { type: String },
  },
}, { timestamps: true });

IntegrationSchema.index({ companyId: 1, type: 1, provider: 1 }, { unique: true });

export default mongoose.model<IIntegration>('Integration', IntegrationSchema);
