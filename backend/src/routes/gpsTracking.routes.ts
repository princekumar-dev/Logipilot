import { Router } from 'express';
import {
  reportLocation,
  reportBatchLocations,
  getLatestVehicleLocations,
  getVehicleLocationHistory,
} from '../controllers/gpsTracking.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/report', reportLocation);
router.post('/report/batch', reportBatchLocations);
router.get('/vehicles', getLatestVehicleLocations);
router.get('/history/:vehicleId', getVehicleLocationHistory);

export default router;
