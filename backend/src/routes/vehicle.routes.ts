import { Router } from 'express';
import { getAllVehicles, getVehicleById } from '../controllers/vehicle.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', getAllVehicles);
router.get('/:vehicleId', getVehicleById);

export default router;
