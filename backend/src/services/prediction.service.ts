import { getShipmentModel, IShipment } from '../models/Shipment';
import mongoose from 'mongoose';

export interface PredictionResult {
  shipmentId: string;
  delayProbability: number;
  predictedDelayMinutes: number;
  predictedETA: Date;
  riskScore: number;
  confidence: number;
  factors: Array<{ name: string; impact: number }>;
}

export class PredictionService {
  static async generatePrediction(shipmentId: string): Promise<PredictionResult> {
    if (!mongoose.Types.ObjectId.isValid(shipmentId)) {
      throw new Error('Invalid shipment ID format');
    }

    const Shipment = await getShipmentModel();
    const shipment = await Shipment.findById(shipmentId);

    if (!shipment) {
      throw new Error('Shipment not found in database');
    }

    let baseRisk = 20;
    let baseDelayProb = 0.1;
    let delayMinutes = 0;

    if (shipment.priority === 'critical') {
      baseRisk += 10;
      baseDelayProb += 0.05;
    } else if (shipment.priority === 'high') {
      baseRisk += 5;
    }

    if (shipment.status === 'delayed') {
      baseRisk += 50;
      baseDelayProb = 0.95;
      delayMinutes = 45 + Math.floor(Math.random() * 60);
    } else if (shipment.status === 'in_transit') {
      const trafficSpike = Math.random() > 0.7;
      if (trafficSpike) {
        baseRisk += 30;
        baseDelayProb += 0.4;
        delayMinutes = 15 + Math.floor(Math.random() * 30);
      }
    } else if (shipment.status === 'delivered') {
      baseRisk = 0;
      baseDelayProb = 0;
      delayMinutes = 0;
    }

    const factors = [];
    if (baseRisk > 30) {
      factors.push({ name: 'Traffic Congestion', impact: Math.floor(Math.random() * 40) + 10 });
    }
    if (shipment.priority === 'critical') {
      factors.push({ name: 'Tight Deadline Window', impact: 15 });
    }
    factors.push({ name: 'Weather Conditions', impact: Math.floor(Math.random() * 15) });

    const finalDelayProb = Math.min(Math.max(baseDelayProb, 0), 0.99);
    const finalRiskScore = Math.min(Math.max(baseRisk, 0), 100);

    const baseETA = shipment.eta ? new Date(shipment.eta) : new Date(Date.now() + 2 * 60 * 60 * 1000);
    const predictedETA = new Date(baseETA.getTime() + delayMinutes * 60 * 1000);

    if (shipment.status !== 'delivered') {
      shipment.riskScore = finalRiskScore;
      shipment.predictedDelay = delayMinutes;
      shipment.eta = predictedETA;
      await shipment.save();
    }

    return {
      shipmentId: shipment._id.toString(),
      delayProbability: Number(finalDelayProb.toFixed(2)),
      predictedDelayMinutes: delayMinutes,
      predictedETA,
      riskScore: finalRiskScore,
      confidence: Number((0.85 + Math.random() * 0.1).toFixed(2)),
      factors: factors.sort((a, b) => b.impact - a.impact)
    };
  }
}
