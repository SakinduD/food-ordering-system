import express from 'express';
import { addMenuItem, getMenuItems, getMenuItemsByRestaurantId, updateMenuItem, deleteMenuItem } from '../controllers/menuController';
import authMiddleware from '../middleware/authMiddleware';
import restaurantMiddleware from '../middleware/restaurantMiddleware';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/', authMiddleware, restaurantMiddleware, upload.single('image'), addMenuItem);
router.get('/', getMenuItems);
router.get('/restaurant/:restaurantId', getMenuItemsByRestaurantId); 
router.put('/:id', authMiddleware, restaurantMiddleware, upload.single('image'), updateMenuItem);
router.delete('/:id', authMiddleware, restaurantMiddleware, deleteMenuItem);

export default router;