import express from 'express';
import { addMenuItem, getMenuItems, updateMenuItem, deleteMenuItem } from '../controllers/menuController';
import authMiddleware from '../middleware/authMiddleware';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/', authMiddleware, upload.single('image'), addMenuItem);
router.get('/', getMenuItems);
router.put('/:id', authMiddleware, upload.single('image'), updateMenuItem);
router.delete('/:id', authMiddleware, deleteMenuItem);


export default router;