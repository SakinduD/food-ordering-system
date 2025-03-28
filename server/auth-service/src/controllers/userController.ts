import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User, { IUser } from '../models/User';

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
    const users: IUser[] = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update User
export const updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedUser: IUser | null = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');

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
