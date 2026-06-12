import { Router } from 'express';
import { getIntegrations, getIntegration, createIntegration, updateIntegration, deleteIntegration, testConnection, testApiKey, getApiKeys } from '../controllers/integration.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/api-keys', getApiKeys);
router.get('/', getIntegrations);
router.get('/:id', getIntegration);
router.post('/', createIntegration);
router.put('/:id', updateIntegration);
router.delete('/:id', deleteIntegration);
router.post('/:id/test', testConnection);
router.post('/:id/test-api', testApiKey);

export default router;
