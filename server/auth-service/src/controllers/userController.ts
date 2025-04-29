import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User, { IUser, UserRole } from '../models/User';
import { isAdmin } from '../middlewares/authMiddleware';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { 
  sendPasswordResetEmail, 
  sendPasswordChangedEmail, 
  isEmailConfigured 
} from '../services/emailService';

// Forgot Password Controller
export const forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Forgot password request received for email:', req.body.email);
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      console.log('User not found for email:', email);
      res.status(200).json({ message: 'If your email exists in our system, you will receive a password reset link shortly.' });
      return;
    }

    console.log('User found, generating reset token for user ID:', user._id);

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Set token expiry (1 hour)
    const resetTokenExpiry = Date.now() + 3600000;

    // Update user with reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    
    try {
      await user.save();
      console.log('Reset token saved for user:', user._id);
    } catch (saveError) {
      console.error('Error saving token to user:', saveError);
      res.status(500).json({ error: 'Failed to process password reset request' });
      return;
    }

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    console.log('Reset URL generated:', resetUrl);

    // Try to send email using the email service
    try {
      console.log('Attempting to send password reset email');
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
      console.log('Password reset email sent or simulated');
      
      res.status(200).json({ 
        message: 'If your email exists in our system, you will receive a password reset link shortly.' 
      });
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      
      // Only clear the token if we're sure the email sending failed (not in dev mode)
      if (isEmailConfigured()) {
        // Update user record to clear the token since email failed
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save().catch(err => console.error('Error clearing token after email failure:', err));
      }
      
      // In development, we'll still return success for testing
      if (process.env.NODE_ENV !== 'production') {
        console.log('DEV MODE: Returning success despite email error');
        res.status(200).json({ 
          message: 'DEV MODE: Email would have been sent. Check server logs for details.',
          devToken: resetToken // Only in dev mode for testing
        });
        return;
      }
      
      res.status(500).json({ error: 'Failed to send password reset email' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset Password Controller
export const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Reset password request received');
    const { token, password } = req.body;
    
    if (!token || !password) {
      res.status(400).json({ error: 'Token and new password are required' });
      return;
    }

    // Find user by reset token
    console.log('Looking for user with token:', token);
    const user = await User.findOne({ 
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } // Token must not be expired
    });

    if (!user) {
      console.log('No user found with valid token');
      res.status(400).json({ error: 'Password reset token is invalid or has expired' });
      return;
    }

    console.log('User found, resetting password for user:', user._id);

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    // Save updated user
    await user.save();
    console.log('Password reset completed for user:', user._id);

    // Send confirmation email using the email service
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
    
    try {
      console.log('Sending password change confirmation email');
      await sendPasswordChangedEmail(user.email, user.name, loginUrl);
      console.log('Password change confirmation email sent or simulated');
    } catch (emailError) {
      // Just log the error but don't fail the request
      console.error('Error sending confirmation email:', emailError);
    }

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// The rest of your controller remains unchanged
// Verify Reset Token function
export const verifyResetToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    
    if (!token) {
      res.status(400).json({ error: 'Token is required' });
      return;
    }

    // Find user by reset token and check if it's not expired
    const user = await User.findOne({ 
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({ error: 'Password reset token is invalid or has expired' });
      return;
    }

    res.status(200).json({ message: 'Token is valid', email: user.email });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ error: 'Failed to verify reset token' });
  }
});

// Keep the rest of the code as it is
export const getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const user: IUser | null = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});



// Get All Users
export const getAllUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    // Optional role filter
    const { role } = req.query;
    
    let query = {};
    if (role && ['customer', 'restaurant', 'deliveryAgent'].includes(role as string)) {
      query = { role: role as UserRole };
    }

    const users: IUser[] = await User.find(query).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update User
export const updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { password, role, ...updateData } = req.body;

    // Validate role if provided
    if (role && !['customer', 'restaurant', 'deliveryAgent'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    // Handle password updates
    if (password) {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser: IUser | null = await User.findByIdAndUpdate(
      req.params.id, 
      { ...updateData, ...(role && { role }) }, 
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete User
export const deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get Users by Role
export const getUsersByRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.params;

    // Validate role
    if (!['customer', 'restaurant', 'deliveryAgent'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    const users: IUser[] = await User.find({ role }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users by role' });
  }
});

export const getUserProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    // Log the full request user object
    console.log('Token user data:', {
      user: (req as any).user,
      timestamp: new Date().toISOString()
    });

    const reqUser = (req as any).user;
    const user = await User.findById(reqUser._id);

    if (!user) {
      console.log('User not found for ID:', reqUser._id);
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Log the full user profile being sent
    const userProfile = {
      userId: user._id,
      isAdmin: user.isAdmin,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    console.log('User profile data:', {
      profile: userProfile,
      timestamp: new Date().toISOString()
    });

    res.status(200).json(userProfile);
  } catch (err) {
    console.error('Error in getUserProfile:', err);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
});

