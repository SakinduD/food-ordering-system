import { Request, Response } from 'express';
import MenuItem from '../models/MenuItem';

export const addMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const menuItem = await MenuItem.create(req.body);
    res.status(201).json({ message: 'Menu item added!', data: menuItem });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getMenuItems = async (req: Request, res: Response): Promise<void> => {
  const items = await MenuItem.find();
  res.json({ message: 'Menu items fetched!', data: items });
};

export const updateMenuItem = async (req: Request, res: Response): Promise<void> => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (item) res.json({ message: 'Updated successfully', data: item });
  else res.status(404).json({ message: 'Item not found' });
};

export const deleteMenuItem = async (req: Request, res: Response): Promise<void> => {
  await MenuItem.findByIdAndDelete(req.params.id);
  res.status(204).send();
};
