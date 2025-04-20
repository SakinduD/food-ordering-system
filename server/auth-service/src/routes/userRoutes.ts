import { Router } from 'express';
import { getUserById, getAllUsers, updateUser, deleteUser, getUserProfile } from '../controllers/userController';  // Correct import style for named exports
import { protect, isAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Protected routes
router.get('/profile', protect, getUserProfile);
router.get('/:id', protect, getUserById);
router.get('/', protect, isAdmin, getAllUsers);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, isAdmin, deleteUser);


export default router;
