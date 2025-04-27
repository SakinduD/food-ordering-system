import express from 'express';
import {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  getRestaurantByUserId,
  updateRestaurant,
  deleteRestaurant,
  setAvailability,
  setVerificationStatus,
  findNearbyRestaurants,
} from '../controllers/restaurantController';

import authMiddleware from '../middleware/authMiddleware';
import restaurantMiddleware from '../middleware/restaurantMiddleware';
import adminMiddleware from '../middleware/adminMiddleware';
import { upload } from '../middleware/upload';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);
router.get('/nearby', findNearbyRestaurants);

// Authentication required routes
router.post('/', authMiddleware, upload.single('image'), createRestaurant);
//router.get('/user/:userId', authMiddleware, getRestaurantByUserId);
router.get('/user/:userId', getRestaurantByUserId);

// Restaurant owner routes (auth + must be restaurant owner)
router.put('/:id', authMiddleware, restaurantMiddleware, upload.single('image'), updateRestaurant);
router.put('/:id/availability', authMiddleware, restaurantMiddleware, setAvailability);

// Admin-only routes
router.delete('/:id', authMiddleware, adminMiddleware, deleteRestaurant);
router.put('/:id/verification', authMiddleware, adminMiddleware, setVerificationStatus);


export default router;
