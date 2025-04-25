import { Request, Response } from 'express';
import Restaurant from '../models/Restaurant';
import { getOrdersByRestaurantId, updateOrderStatus, deleteOrder } from '../services/orderService';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Create a new restaurant for the logged-in user
export const createRestaurant = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const existing = await Restaurant.findOne({ userId });
    if (existing) {
      res.status(400).json({ message: 'Restaurant already exists for this user' });
      return;
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const restaurant = await Restaurant.create({ ...req.body, userId, imageUrl });

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
export const updateRestaurant = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await Restaurant.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) {
      res.status(404).json({ message: 'Restaurant not found' });
      return;
    }

    res.status(200).json({ message: 'Restaurant updated successfully!', data: updated });
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

// View incoming orders
export const fetchRestaurantOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = req.params.id;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const orders = await getOrdersByRestaurantId(restaurantId, token);
    if (!orders) {
      res.status(404).json({ message: 'Orders not found' });
      return;
    }

    res.json({ message: 'Orders fetched successfully', data: orders });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Update order status
export const handleUpdateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const { orderStatus } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!orderStatus || !token) {
      res.status(400).json({ message: 'Missing orderStatus or token' });
      return;
    }

    const success = await updateOrderStatus(orderId, orderStatus, token);

    if (!success) {
      res.status(500).json({ message: 'Failed to update order status' });
      return;
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Delete order
export const handleDeleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const success = await deleteOrder(orderId, token);
    if (!success) {
      res.status(400).json({ message: 'Failed to delete order' });
      return;
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};