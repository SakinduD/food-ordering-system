import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { register, verifyOtp, login, logout } from '../controllers/authController';
import { generateToken } from '../utils/tokenUtils';
import { UserRole } from '../models/User';

const router = express.Router();

// Define types for custom user data in req.user
interface IUser {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  role: UserRole;
}

// Route to register user
router.post('/register', register);

// Route to verify OTP
router.post('/verify-otp', verifyOtp);

// Route to login user
router.post('/login', login);

// Route to logout user
router.post('/logout', logout);

// Route for Google login initiation
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Route for Google callback after successful authentication
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }), 
  (req: Request, res: Response) => {
    // Assuming req.user has user data after successful Google login
    const user = req.user as IUser;

    // Generate JWT token and set cookie
    const token = generateToken({
      _id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role,
    });

    res.setHeader('Authorization', `Bearer ${token}`);

    res.redirect('/'); // Or redirect to frontend page
  }
);

export default router;
