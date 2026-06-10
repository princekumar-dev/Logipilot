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
    console.error('Error generating prediction:', error);
    if (error.message === 'Invalid shipment ID format' || error.message === 'Shipment not found in database') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error during prediction generation' });
  }
};
