import { Request, Response } from 'express';
import MenuItem from '../models/MenuItem';
import { RestaurantServiceImpl } from '../services/restaurantService';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const restaurantService = new RestaurantServiceImpl();

// Create a new menu item
export const addMenuItem = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, category, available } = req.body;
    const userId = (req as any).user._id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: No user ID found in token' });
      return;
    }

    const restaurant = await restaurantService.getRestaurantByUserId(userId);
    if (!restaurant) {
      res.status(404).json({ message: 'Restaurant not found for this user' });
      return;
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const menuItem = await MenuItem.create({
      name,
      description,
      price,
      category,
      available,
      restaurantId: restaurant._id,
      imageUrl,
    });

    const fullItem = await MenuItem.findById(menuItem._id);
    console.log('Full Item:', fullItem);
    res.status(201).json({ message: 'Menu item added!', data: fullItem });
  } catch (err: any) {
    console.error('Add Menu Error:', err.message);
    res.status(400).json({ error: err.message || 'Failed to add menu item' });
  }
};

// Get all menu items
export const getMenuItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.query;
    const filter = restaurantId ? { restaurantId } : {};
    const items = await MenuItem.find(filter);

    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const restaurant = await restaurantService.getRestaurantById(item.restaurantId.toString());
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

// Get menu items by restaurant ID
export const getMenuItemsByRestaurantId = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const items = await MenuItem.find({ restaurantId });
    res.status(200).json({ data: items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Update menu item by ID
export const updateMenuItem = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, category, available, restaurantId } = req.body;

    const updateData: any = {
      name,
      description,
      price,
      category,
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

// Delete menu item by ID
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

