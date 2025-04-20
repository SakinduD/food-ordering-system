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

const router = express.Router();

router.post('/', authMiddleware, createRestaurant);
router.get('/', getRestaurants);
router.get('/user/:userId', getRestaurantByUserId); 
router.get('/:id', getRestaurantById);
router.put('/:id', authMiddleware, updateRestaurant);
router.delete('/:id', authMiddleware, deleteRestaurant);
router.put('/:id/availability', authMiddleware, setAvailability);
router.get('/:id/orders', authMiddleware, fetchRestaurantOrders); // View all orders
router.put('/orders/:id/status', authMiddleware, handleUpdateOrderStatus); // Update order
router.delete('/orders/:id', authMiddleware, handleDeleteOrder); // Delete order

export default router;
