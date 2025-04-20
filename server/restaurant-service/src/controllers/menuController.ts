import { Request, Response } from 'express';
import MenuItem from '../models/MenuItem';
import { getRestaurantById } from '../services/restaurantService';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// ✅ Create a new menu item
export const addMenuItem = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, available, restaurantId } = req.body;

    const restaurant = await getRestaurantById(restaurantId);
    if (!restaurant) {
      res.status(404).json({ message: 'Restaurant not found for given ID' });
      return;
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const menuItem = await MenuItem.create({
      name,
      description,
      price,
      available,
      restaurantId,
      imageUrl,
    });

    const fullItem = await MenuItem.findById(menuItem._id).populate('restaurantId', 'name');
    res.status(201).json({ message: 'Menu item added!', data: fullItem });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to add menu item' });
  }
};

// ✅ Get all menu items (optionally by restaurantId)
export const getMenuItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.query;
    const filter = restaurantId ? { restaurantId } : {};
    const items = await MenuItem.find(filter);

    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const restaurant = await getRestaurantById(item.restaurantId.toString());
        return {
          ...item.toObject(),
          restaurantName: restaurant?.name || 'Unknown',
        };
      })
    );

    res.json({ message: 'Menu items fetched!', data: enrichedItems });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch menu items' });
  }
};

// ✅ Update menu item by ID
export const updateMenuItem = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, available, restaurantId } = req.body;

    const updateData: any = {
      name,
      description,
      price,
      available,
      restaurantId,
    };

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`; 
    }

    const item = await MenuItem.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (item) {
      res.json({ message: 'Menu Item Updated successfully', data: item });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update menu item' });
  }
};

// ✅ Delete menu item by ID
export const deleteMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await MenuItem.findByIdAndDelete(req.params.id);

    if (deleted) {
      res.status(200).json({ message: 'Menu Item Deleted Successfully!' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete menu item' });
  }
};

