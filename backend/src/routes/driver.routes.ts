import { Router } from 'express';
import { getAllDrivers, getDriverById, getMe } from '../controllers/driver.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/me', getMe);
router.get('/', getAllDrivers);
router.get('/:driverId', getDriverById);

export default router;
