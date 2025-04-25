import express from 'express';
import {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  getRestaurantByUserId,
  updateRestaurant,
  deleteRestaurant,
  setAvailability,
  fetchRestaurantOrders,
  handleUpdateOrderStatus,
  handleDeleteOrder,
} from '../controllers/restaurantController';

import authMiddleware from '../middleware/authMiddleware';
import restaurantMiddleware from '../middleware/restaurantMiddleware';
import adminMiddleware from '../middleware/adminMiddleware';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/', authMiddleware, restaurantMiddleware, upload.single('image'), createRestaurant);
router.get('/', getRestaurants);
router.get('/user/:userId', authMiddleware, restaurantMiddleware, getRestaurantByUserId); 
router.get('/:id', getRestaurantById);
router.put('/:id', authMiddleware, restaurantMiddleware, upload.single('image'), updateRestaurant);
router.delete('/:id', adminMiddleware, deleteRestaurant);
router.put('/:id/availability', authMiddleware, restaurantMiddleware, setAvailability);
router.get('/:id/orders', authMiddleware, fetchRestaurantOrders); // View all orders
router.put('/orders/:id/status', authMiddleware, handleUpdateOrderStatus); // Update order
router.delete('/orders/:id', authMiddleware, handleDeleteOrder); // Delete order

export default router;
