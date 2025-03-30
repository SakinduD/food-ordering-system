import  { Request, Response } from 'express';
import Delivery from '../models/deliveryModel';
import apiCaller from '../utils/apiCaller';
import mongoose from 'mongoose';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || '';
const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || '';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || '';

// ✅ Create a new delivery
export const createDelivery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, driverId } = req.body;

    // Fetch order details from the Order service
    // const order = await apiCaller(`${ORDER_SERVICE_URL}/${orderId}`);
    // if (!order) {
    //   res.status(404).json({ message: 'Order not found' });
    //   return;
    // }

    // Fetch restaurant details from the Restaurant service
    // const restaurant = await apiCaller(`${RESTAURANT_SERVICE_URL}/${order.restaurantId}`);
    // if (!restaurant) {
    //   res.status(404).json({ message: 'Restaurant not found' });
    //   return;
    // }

    // Fetch driver details from the Auth service
    // const driver = await apiCaller(`${AUTH_SERVICE_URL}/users/${driverId}`);
    // if (!driver || driver.role !== 'Driver') {
    //   res.status(403).json({ message: 'Invalid driver' });
    //   return;
    // }

    // Create a new delivery
    const delivery = new Delivery({
      orderId,
      restaurantId: new mongoose.Types.ObjectId(), // Use a valid ObjectId
      driverId,
      status: 'Pending',
      restaurantLocation: { type: 'Point', coordinates: [-73.935242, 40.73061] }, // Mock location
      customerLocation: { type: 'Point', coordinates: [-73.935242, 40.73061] }, // Mock location
    });

    await delivery.save();
    res.status(201).json(delivery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// ✅ Update delivery status
export const updateDeliveryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, currentLocation } = req.body;
    const { deliveryId } = req.params;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      res.status(404).json({ message: 'Delivery not found' });
      return;
    }

    delivery.status = status;
    if (currentLocation) {
      delivery.currentLocation = currentLocation;
    }

    await delivery.save();
    res.json(delivery);
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
