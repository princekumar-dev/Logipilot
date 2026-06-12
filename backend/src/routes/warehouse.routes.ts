import { Router } from 'express';
import { getAllWarehouses, getWarehouseById } from '../controllers/warehouse.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', getAllWarehouses);
router.get('/:warehouseId', getWarehouseById);

export default router;
