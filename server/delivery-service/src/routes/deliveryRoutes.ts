import express from 'express';
import {
  createDelivery,
  assignDriver,
  updateDeliveryStatus,
  getAllDeliveries,
  getDeliveryLocation,
  getActiveDriversLocations
} from '../controllers/deliveryController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticate, authorize(['RestaurantOwner', 'Admin']), createDelivery);
router.post('/:deliveryId/assign', authenticate, authorize(['deliveryAgent']), assignDriver);
router.put('/:deliveryId/status', authenticate, authorize(['deliveryAgent']), updateDeliveryStatus);
router.get('/', authenticate, authorize(['Admin']), getAllDeliveries);
router.get('/active-drivers', authenticate, getActiveDriversLocations);
router.get('/:deliveryId/location', authenticate, getDeliveryLocation);

export default router;