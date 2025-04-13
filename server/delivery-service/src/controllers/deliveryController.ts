import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Delivery from '../models/deliveryModel';
import { getIo } from '../utils/socket';
import { OrderServiceAdapter, RestaurantServiceAdapter, ServiceError } from '../adapters/serviceAdapters';
import User from '../../../auth-service/src/models/User';

const orderService = new OrderServiceAdapter();
const restaurantService = new RestaurantServiceAdapter();

// Create initial delivery without driver
export const createDelivery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.body;

    // Fetch order details through adapter
    const orderResponse = await orderService.getOrderById(orderId);
    const { order } = orderResponse;

    // Fetch restaurant details through adapter
    const restaurantResponse = await restaurantService.getRestaurantById(order.restaurantId);
    const { restaurant } = restaurantResponse;

    const delivery = new Delivery({
      orderId: new mongoose.Types.ObjectId(orderId),
      restaurantId: new mongoose.Types.ObjectId(order.restaurantId),
      status: 'Pending',
      restaurantLocation: {
        type: 'Point',
        coordinates: [restaurant.location.longitude, restaurant.location.latitude]
      },
      customerLocation: {
        type: 'Point',
        coordinates: [order.orderLocation.longitude, order.orderLocation.latitude]
      },
      isDriverAssigned: false
    });

    await delivery.save();

    // Emit new delivery event for available drivers
    getIo().emit('newDeliveryAvailable', {
      deliveryId: delivery._id,
      pickupLocation: delivery.restaurantLocation,
      dropLocation: delivery.customerLocation
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

    // Validate driver
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'deliveryAgent') {
      res.status(400).json({ message: 'Invalid driver or not a delivery agent' });
      return;
    }

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
    const deliveries = await Delivery.find().populate('orderId restaurantId driverId');
    res.json(deliveries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getActiveDriversLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const drivers = await User.find({
      role: 'deliveryAgent',
      isAvailable: true,
      currentLocation: { $exists: true }
    }).select('_id name currentLocation');

    res.json({
      success: true,
      drivers: drivers.map(driver => ({
        driverId: driver._id,
        name: driver.name,
        location: driver.currentLocation
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};


