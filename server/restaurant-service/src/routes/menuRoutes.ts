import express from 'express';
import { addMenuItem, getMenuItems, updateMenuItem, deleteMenuItem } from '../controllers/menuController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, addMenuItem);
router.get('/', getMenuItems);
router.put('/:id', authMiddleware, updateMenuItem);
router.delete('/:id', authMiddleware, deleteMenuItem);

export default router;