import { Router } from 'express';
import { getVehicleLocations, getMapOverview, computeRoute, precomputeRoutes, getCachedRoutes, clearRouteCache } from '../controllers/map.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/overview', getMapOverview);
router.get('/vehicles', getVehicleLocations);
router.post('/route', computeRoute);
router.post('/precompute', precomputeRoutes);
router.get('/routes/cached', getCachedRoutes);
router.delete('/routes/cached', clearRouteCache);

export default router;
