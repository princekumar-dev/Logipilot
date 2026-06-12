import { Router } from 'express';
import { getAnalyticsSummary } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/summary', getAnalyticsSummary);

export default router;
