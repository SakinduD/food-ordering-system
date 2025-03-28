import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User, { IUser, UserRole } from '../models/User';

// Get User by ID
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
    if (role && ['customer', 'restaurantOwner', 'deliveryAgent'].includes(role as string)) {
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
    const { role, ...updateData } = req.body;

    // Validate role if provided
    if (role && !['customer', 'restaurantOwner', 'deliveryAgent'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
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
    if (!['customer', 'restaurantOwner', 'deliveryAgent'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    const users: IUser[] = await User.find({ role }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users by role' });
  }
});