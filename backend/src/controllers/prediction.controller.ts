import { Request, Response } from 'express';
import { PredictionService } from '../services/prediction.service';

export const getPrediction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shipmentId } = req.params;
    
    if (!shipmentId) {
      res.status(400).json({ message: 'Shipment ID is required' });
      return;
    }

    const prediction = await PredictionService.generatePrediction(shipmentId as string);
    res.status(200).json(prediction);
  } catch (error: any) {
    console.error('Error generating prediction:', error.message);
    if (error.message === 'Invalid shipment ID format' || error.message === 'Shipment not found in database') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(503).json({ message: 'Prediction unavailable. Database may not be configured.' });
  }
};

export const getBatchPredictions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shipmentIds } = req.body;

    if (!Array.isArray(shipmentIds) || shipmentIds.length === 0) {
      res.status(400).json({ message: 'shipmentIds array is required' });
      return;
    }

    if (shipmentIds.length > 50) {
      res.status(400).json({ message: 'Maximum 50 shipments per batch' });
      return;
    }

    const predictions = await Promise.allSettled(
      shipmentIds.map((id: string) => PredictionService.generatePrediction(id))
    );

    const results = predictions.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return { shipmentId: shipmentIds[index], error: result.reason?.message || 'Prediction failed' };
    });

    res.status(200).json({ predictions: results });
  } catch (error: any) {
    console.error('Error generating batch predictions:', error.message);
    res.status(503).json({ message: 'Batch prediction unavailable.' });
  }
};
