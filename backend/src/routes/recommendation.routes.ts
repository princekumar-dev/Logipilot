import { Router } from 'express';
import { getAllRecommendations } from '../controllers/recommendation.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', getAllRecommendations);

export default router;
