import express from 'express';
import { getPrediction } from '../controllers/prediction.controller';

const router = express.Router();

router.get('/delay/:shipmentId', getPrediction);
router.get('/eta/:shipmentId', getPrediction);
router.get('/risk/:shipmentId', getPrediction);

export default router;
