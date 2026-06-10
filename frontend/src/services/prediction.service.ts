import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface PredictionFactor {
  name: string;
  impact: number;
}

export interface PredictionResult {
  shipmentId: string;
  delayProbability: number;
  predictedDelayMinutes: number;
  predictedETA: string; // ISO date string
  riskScore: number;
  confidence: number;
  factors: PredictionFactor[];
}

export const predictionService = {
  getPrediction: async (shipmentId: string): Promise<PredictionResult> => {
    // We can call any of the routes since they all point to the same controller that generates the full object
    const response = await axios.get(`${API_URL}/predictions/delay/${shipmentId}`, {
      withCredentials: true
    });
    return response.data;
  }
};
