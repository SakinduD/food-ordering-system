import express from 'express';
import {
  createDelivery,
  assignDriver,
  updateDeliveryStatus,
  getAllDeliveries,
  getDeliveryLocation,
  getActiveDriversLocations,
  getNearbyDrivers,
  getDeliveryById,
  updateDeliveryLocation,
  getDeliveriesByDriverId
} from '../controllers/deliveryController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Route ordering is important - more specific routes come first
router.post('/', createDelivery);
router.get('/', getAllDeliveries);

// Specific routes with fixed paths
router.get('/active-drivers', getActiveDriversLocations);
router.get('/driver/:driverId', getDeliveriesByDriverId); // New endpoint that uses driver ID parameter



// Dynamic parameter routes come after specific routes
router.post('/:deliveryId/assign', assignDriver);
router.post('/:deliveryId/update-location', updateDeliveryLocation);
router.post('/:deliveryId/update-status', updateDeliveryStatus);
router.put('/:deliveryId/status', updateDeliveryStatus);
router.get('/:deliveryId/location', getDeliveryLocation);
router.get('/:deliveryId/nearby-drivers', getNearbyDrivers);

// This most generic route must come last
router.get('/:deliveryId', getDeliveryById);

export default router;