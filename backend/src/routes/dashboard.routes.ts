import { Router } from 'express';
import { getDashboardStats, getHighRiskShipments } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/stats', getDashboardStats);
router.get('/high-risk', getHighRiskShipments);

export default router;
