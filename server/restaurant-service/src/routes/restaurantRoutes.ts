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
  updateRatingController
} from '../controllers/restaurantController';

import authMiddleware from '../middleware/authMiddleware';
import restaurantMiddleware from '../middleware/restaurantMiddleware';
import adminMiddleware from '../middleware/adminMiddleware';
import { upload } from '../middleware/upload';

const router = express.Router();

//Public Routes
router.get('/', getRestaurants);
router.get('/nearby', findNearbyRestaurants); 
router.get('/:id', getRestaurantById);
router.post('/', authMiddleware, upload.single('image'), createRestaurant);
router.get('/user/:userId', getRestaurantByUserId);
router.put('/:id', authMiddleware, restaurantMiddleware, upload.single('image'), updateRestaurant);
router.put('/:id/availability', authMiddleware, restaurantMiddleware, setAvailability);
router.post('/update-rating', updateRatingController);

// Admin-only routes
router.delete('/:id', authMiddleware, adminMiddleware, deleteRestaurant);
router.put('/:id/verification', authMiddleware, adminMiddleware, setVerificationStatus);

export default router;
