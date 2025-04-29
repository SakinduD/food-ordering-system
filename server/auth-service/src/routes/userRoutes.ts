import { Router } from 'express';
import { 
  getUserById, 
  getAllUsers, 
  updateUser, 
  deleteUser, 
  getUserProfile, 
  getUsersByRole,
  forgotPassword,
  resetPassword,
  verifyResetToken,

} from '../controllers/userController';
import { protect, isAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Public routes for password reset - no authentication required
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-reset-token/:token', verifyResetToken);

// Protected routes that require authentication
router.get('/profile', protect, getUserProfile);
router.get('/by-role/:role', protect, isAdmin, getUsersByRole);
router.get('/:id', protect, getUserById); // New route to get user location
router.get('/', protect, getAllUsers); // Allow access to get users with role filter
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);


export default router;
