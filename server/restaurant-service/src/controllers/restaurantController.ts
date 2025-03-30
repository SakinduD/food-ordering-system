import { Request, Response } from 'express';
import Restaurant from '../models/Restaurant';

// Create a new restaurant for the logged-in user
export const createRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: No user ID found in token' });
      return;
    }

    const existing = await Restaurant.findOne({ userId });
    if (existing) {
      res.status(400).json({ message: 'A restaurant is already registered for this user.' });
      return;
    }

    const restaurant = await Restaurant.create({ ...req.body, userId });
    res.status(201).json({ message: 'Restaurant created successfully!', data: restaurant });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Get all restaurants
export const getRestaurants = async (_req: Request, res: Response): Promise<void> => {
  try {
    const restaurants = await Restaurant.find();
    res.json({ message: 'Restaurants fetched!', data: restaurants });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single restaurant by ID
export const getRestaurantById = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (restaurant) {
      res.status(200).json({ data: restaurant });
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get a restaurant by user ID
export const getRestaurantByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurant = await Restaurant.findOne({ userId: req.params.userId });
    if (restaurant) {
      res.status(200).json({ data: restaurant });
    } else {
      res.status(404).json({ message: 'Restaurant not found for this user' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Update a restaurant by ID
export const updateRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updated) {
      res.status(200).json({ message: 'Restaurant updated!', data: updated });
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a restaurant
export const deleteRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Restaurant.findByIdAndDelete(req.params.id);
    if (deleted) {
      res.status(200).json({ message: 'Restaurant deleted successfully!' });
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Set restaurant availability
export const setAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { available: req.body.available },
      { new: true }
    );

    if (!restaurant) {
      res.status(404).json({ message: 'Restaurant not found!' });
      return;
    }

    res.json({ message: 'Availability updated!', data: restaurant });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
