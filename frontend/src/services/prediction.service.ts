import api from './api';

export interface PredictionFactor {
  name: string;
  impact: number;
}

export interface PredictionResult {
  shipmentId: string;
  delayProbability: number;
  predictedDelayMinutes: number;
  predictedETA: string;
  riskScore: number;
  confidence: number;
  factors: PredictionFactor[];
}

export interface BatchPredictionResult {
  predictions: (PredictionResult | { shipmentId: string; error: string })[];
}

export const predictionService = {
  getPrediction: async (shipmentId: string): Promise<PredictionResult> => {
    const response = await api.get(`/predictions/delay/${shipmentId}`);
    return response.data;
  },

  getBatchPredictions: async (shipmentIds: string[]): Promise<BatchPredictionResult> => {
    const response = await api.post<BatchPredictionResult>('/predictions/batch', { shipmentIds });
    return response.data;
  }
};
