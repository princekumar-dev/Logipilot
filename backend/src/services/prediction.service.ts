import Shipment, { IShipment } from '../models/Shipment';
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
  /**
   * Predicts delay probability, ETA, and risk score for a shipment using heuristics
   * based on actual MongoDB document data (priority, status, etc.).
   */
  static async generatePrediction(shipmentId: string): Promise<PredictionResult> {
    if (!mongoose.Types.ObjectId.isValid(shipmentId)) {
      throw new Error('Invalid shipment ID format');
    }

    const shipment = await Shipment.findById(shipmentId);
    
    if (!shipment) {
      throw new Error('Shipment not found in database');
    }

    // Base mock factors derived from real data
    let baseRisk = 20;
    let baseDelayProb = 0.1;
    let delayMinutes = 0;

    // Adjust based on priority
    if (shipment.priority === 'critical') {
      baseRisk += 10; // Higher risk of missing tight deadlines
      baseDelayProb += 0.05;
    } else if (shipment.priority === 'high') {
      baseRisk += 5;
    }

    // Adjust based on status
    if (shipment.status === 'delayed') {
      baseRisk += 50;
      baseDelayProb = 0.95;
      delayMinutes = 45 + Math.floor(Math.random() * 60); // Random additional delay if already delayed
    } else if (shipment.status === 'in_transit') {
      // Add random traffic/weather simulated variance for in-transit
      const trafficSpike = Math.random() > 0.7; // 30% chance of traffic spike
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

    // Generate pseudo-SHAP values for explainability
    const factors = [];
    if (baseRisk > 30) {
      factors.push({ name: 'Traffic Congestion', impact: Math.floor(Math.random() * 40) + 10 });
    }
    if (shipment.priority === 'critical') {
      factors.push({ name: 'Tight Deadline Window', impact: 15 });
    }
    factors.push({ name: 'Weather Conditions', impact: Math.floor(Math.random() * 15) });

    // Normalize probabilities and scores
    const finalDelayProb = Math.min(Math.max(baseDelayProb, 0), 0.99);
    const finalRiskScore = Math.min(Math.max(baseRisk, 0), 100);

    // Calculate dynamic ETA based on current time + expected standard travel + delay
    // For MVP, if it doesn't have an ETA, we'll assign one 2 hours from now + delay
    const baseETA = shipment.eta ? new Date(shipment.eta) : new Date(Date.now() + 2 * 60 * 60 * 1000);
    const predictedETA = new Date(baseETA.getTime() + delayMinutes * 60 * 1000);

    // Update the shipment with the new predicted values if it's not delivered
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
      confidence: Number((0.85 + Math.random() * 0.1).toFixed(2)), // e.g., 0.85 - 0.95
      factors: factors.sort((a, b) => b.impact - a.impact) // Sort by highest impact
    };
  }
}
