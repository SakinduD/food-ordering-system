import express from 'express';
import {
  createDelivery,
  assignDriver,
  updateDeliveryStatus,
  getAllDeliveries,
  getDeliveryLocation,
  getActiveDriversLocations,
  getNearbyDrivers,
  getDeliveryById
} from '../controllers/deliveryController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Protected routes - admins can access all routes
// router.post('/', authenticate, authorize(['restaurantOwner']), createDelivery);
// router.post('/:deliveryId/assign', authenticate, authorize(['deliveryAgent']), assignDriver);
// router.put('/:deliveryId/status', authenticate, authorize(['deliveryAgent']), updateDeliveryStatus);
// router.get('/', authenticate, authorize(['admin']), getAllDeliveries);
// router.get('/active-drivers', authenticate, authorize(['restaurantOwner']), getActiveDriversLocations);
// router.get('/:deliveryId/location', authenticate, getDeliveryLocation);
//router.get('/:deliveryId/nearby-drivers', authenticate, authorize(['restaurantOwner']), getNearbyDrivers);

router.post('/', createDelivery);
router.post('/:deliveryId/assign', assignDriver);
router.put('/:deliveryId/status', updateDeliveryStatus);
router.get('/', getAllDeliveries);
router.get('/active-drivers', getActiveDriversLocations);
router.get('/:deliveryId/location', getDeliveryLocation);
router.get('/:deliveryId/nearby-drivers', getNearbyDrivers);
router.get('/:deliveryId', getDeliveryById);

export default router;