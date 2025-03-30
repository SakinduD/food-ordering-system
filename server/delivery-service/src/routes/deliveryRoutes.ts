import express from 'express';
import {
  createDelivery,
  updateDeliveryStatus,
  getAllDeliveries,
  getDeliveryLocation,
} from '../controllers/deliveryController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticate, authorize(['RestaurantOwner', 'Admin']), createDelivery);
router.put('/:deliveryId', authenticate, authorize(['Driver']), updateDeliveryStatus);
router.get('/', authenticate, authorize(['Admin']), getAllDeliveries);
router.get('/:deliveryId/location', authenticate, getDeliveryLocation);

export default router;
