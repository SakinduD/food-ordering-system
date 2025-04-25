import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Delivery from '../models/deliveryModel';
import { getIo } from '../utils/socket';
import { 
  OrderServiceAdapter, 
  RestaurantServiceAdapter, 
  UserServiceAdapter,
  ServiceError 
} from '../adapters/serviceAdapters';


const orderService = new OrderServiceAdapter();
const restaurantService = new RestaurantServiceAdapter();
const userService = new UserServiceAdapter();

// Create initial delivery without driver
export const createDelivery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    // Fetch order details through adapter
    const orderResponse = await orderService.getOrderById(orderId);
    const { order } = orderResponse;

    // Fetch restaurant details through adapter
    const restaurantResponse = await restaurantService.getRestaurantById(order.restaurantId);
    const restaurant = restaurantResponse.data;

    // Validate restaurant location
    if (!restaurant.location || !restaurant.location.coordinates) {
      throw new ServiceError('DeliveryService', 'Restaurant location not found', 400);
    }

    const delivery = new Delivery({
      orderId: new mongoose.Types.ObjectId(orderId),
      restaurantId: new mongoose.Types.ObjectId(order.restaurantId),
      status: 'Pending',
      restaurantLocation: {
        type: 'Point',
        coordinates: restaurant.location.coordinates // Restaurant model already stores as [longitude, latitude]
      },
      customerLocation: {
        type: 'Point',
        coordinates: [order.orderLocation[0], order.orderLocation[1]]
      },
      isDriverAssigned: false
    });

    await delivery.save();

    // Emit new delivery event for available drivers
    getIo().emit('newDeliveryAvailable', {
      deliveryId: delivery._id,
      pickupLocation: {
        longitude: restaurant.location.coordinates[0],
        latitude: restaurant.location.coordinates[1]
      },
      dropLocation: {
        longitude: order.orderLocation[0],
        latitude: order.orderLocation[1]
      }
    });

    res.status(201).json({
      message: 'Delivery created and waiting for driver assignment',
      delivery
    });
  } catch (error) {
    console.error(error);
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: (error as Error).message });
  }
};

// Assign driver to delivery
export const assignDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deliveryId } = req.params;
    const { driverId } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    // Validate driver through user service
    const driverResponse = await userService.getUserById(driverId, token);
    
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      res.status(404).json({ message: 'Delivery not found' });
      return;
    }

    if (delivery.isDriverAssigned) {
      res.status(400).json({ message: 'Delivery already assigned to a driver' });
      return;
    }

    delivery.driverId = new mongoose.Types.ObjectId(driverId);
    delivery.isDriverAssigned = true;
    delivery.status = 'Driver_Assigned';
    await delivery.save();

    // Notify relevant parties about driver assignment
    getIo().emit('driverAssigned', {
      deliveryId: delivery._id,
      driverId,
      status: delivery.status
    });

    res.status(200).json({
      message: 'Driver assigned successfully',
      delivery
    });
  } catch (error) {
    console.error(error);
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: (error as Error).message });
  }
};

// ✅ Update delivery status
export const updateDeliveryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const { deliveryId } = req.params;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      res.status(404).json({ message: 'Delivery not found' });
      return;
    }

    delivery.status = status;
    await delivery.save();

    // Notify customers
    getIo().to(deliveryId).emit('statusUpdate', { deliveryId, status });

    res.json(delivery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getDeliveryLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deliveryId } = req.params;

    const delivery = await Delivery.findById(deliveryId).select('currentLocation');
    if (!delivery) {
      res.status(404).json({ message: 'Delivery not found' });
      return;
    }

    res.json({ deliveryId, currentLocation: delivery.currentLocation || { coordinates: [0, 0] } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};


// ✅ Get all deliveries
export const getAllDeliveries = async (req: Request, res: Response): Promise<void> => {
  try {
    const deliveries = await Delivery.find();
    res.json(deliveries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getActiveDriversLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const activeDrivers = await userService.getActiveDrivers(token);
    
    res.json({
      success: true,
      drivers: activeDrivers.map(({ user }) => ({
        driverId: user._id,
        name: user.name,
        location: user.currentLocation
      }))
    });
  } catch (error) {
    console.error(error);
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getNearbyDrivers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deliveryId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    // Verify the delivery exists and belongs to the requesting restaurant
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      res.status(404).json({ message: 'Delivery not found' });
      return;
    }

    // Get active drivers through user service
    const activeDrivers = await userService.getActiveDrivers(token);
    
    // Calculate distance and sort drivers by proximity to restaurant
    const availableDrivers = activeDrivers.map(({ user }) => {
      if (!user.currentLocation?.coordinates) return null;
      
      // Calculate distance between driver and restaurant
      const [driverLong, driverLat] = user.currentLocation.coordinates;
      const [restaurantLong, restaurantLat] = delivery.restaurantLocation.coordinates;
      
      const distance = calculateDistance(
        driverLat, driverLong,
        restaurantLat, restaurantLong
      );

      return {
        driverId: user._id,
        name: user.name,
        distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
        location: user.currentLocation
      };
    })
    .filter(driver => driver !== null)
    .sort((a, b) => a!.distance - b!.distance);

    res.json({
      success: true,
      deliveryId,
      availableDrivers
    });
  } catch (error) {
    console.error(error);
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: (error as Error).message });
  }
};

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

export const getDeliveryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deliveryId } = req.params;
    
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      res.status(404).json({ message: 'Delivery not found' });
      return;
    }

    // Return full delivery details including locations
    res.json({
      deliveryId: delivery._id,
      status: delivery.status,
      restaurantLocation: delivery.restaurantLocation,
      customerLocation: delivery.customerLocation,
      currentLocation: delivery.currentLocation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};


