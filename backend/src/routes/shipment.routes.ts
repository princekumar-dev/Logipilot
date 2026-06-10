import { Router } from 'express';
import {
  getAllShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment,
  assignDriver,
  assignVehicle
} from '../controllers/shipment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

// Apply auth middleware to all shipment routes
router.use(authenticate);

// Routes accessible by all authenticated users
router.get('/', getAllShipments);
router.get('/:shipmentId', getShipmentById);

// Routes requiring specific roles (e.g. manager or admin)
router.post('/', requireRole(['admin', 'manager', 'dispatcher']), createShipment);
router.put('/:shipmentId', requireRole(['admin', 'manager', 'dispatcher']), updateShipment);
router.delete('/:shipmentId', requireRole(['admin', 'manager']), deleteShipment);

// Assignment routes
router.post('/:shipmentId/assign-driver', requireRole(['admin', 'manager', 'dispatcher']), assignDriver);
router.post('/:shipmentId/assign-vehicle', requireRole(['admin', 'manager', 'dispatcher']), assignVehicle);

export default router;
