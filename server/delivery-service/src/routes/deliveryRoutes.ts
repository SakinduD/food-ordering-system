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
  getDeliveriesByDriverId,
  getDeliveryByOrderId
} from '../controllers/deliveryController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = express.Router();



// Protected routes - requires authentication

router.post('/', authenticate, authorize(['admin', 'restaurant']), createDelivery);
router.get('/', authenticate, authorize(['admin', 'restaurant', 'deliveryAgent']), getAllDeliveries);


router.get('/active-drivers', authenticate, authorize(['admin', 'restaurant', 'deliveryAgent']), getActiveDriversLocations);
router.get('/driver/:driverId', authenticate, authorize(['admin', 'deliveryAgent']), getDeliveriesByDriverId); 
router.get('/by-order/:orderId', authenticate, authorize(['admin', 'restaurant', 'customer', 'deliveryAgent']), getDeliveryByOrderId); 


router.post('/:deliveryId/assign', authenticate, authorize(['admin', 'restaurant']), assignDriver);
router.post('/:deliveryId/update-location', authenticate, authorize(['admin', 'deliveryAgent']), updateDeliveryLocation);
router.post('/:deliveryId/update-status', authenticate, authorize(['admin', 'deliveryAgent']), updateDeliveryStatus);

router.get('/:deliveryId/location', authenticate, authorize(['admin', 'restaurant', 'customer', 'deliveryAgent']), getDeliveryLocation);
router.get('/:deliveryId/nearby-drivers', authenticate, authorize(['admin', 'restaurant']), getNearbyDrivers);


router.get('/:deliveryId', authenticate, authorize(['admin', 'restaurant', 'customer', 'deliveryAgent']), getDeliveryById);

export default router;