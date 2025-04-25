import { Router } from 'express';
import { getUserById, getAllUsers, updateUser, deleteUser, getUserProfile, getUsersByRole } from '../controllers/userController';
import { protect, isAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Protected routes
router.get('/profile', protect, getUserProfile);
router.get('/:id', protect, getUserById);
router.get('/', protect, getAllUsers); // Allow access to get users with role filter
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, isAdmin, deleteUser);

export default router;
