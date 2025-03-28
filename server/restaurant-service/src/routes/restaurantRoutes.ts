import express from 'express';
import { setAvailability, getRestaurants } from '../controllers/restaurantController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.put('/:id/availability', authMiddleware, setAvailability);
router.get('/', getRestaurants);

export default router;
