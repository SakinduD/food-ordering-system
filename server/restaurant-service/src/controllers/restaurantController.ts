import { Request, Response } from 'express';
import Restaurant from '../models/Restaurant';

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

export const getRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurants = await Restaurant.find();
    res.json({ message: 'Restaurants fetched!', data: restaurants });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
