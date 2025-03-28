import { Request, Response } from 'express';
import Order from '../models/Order';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json({ message: 'Order created!', data: order });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  const orders = await Order.find().populate('items');
  res.json({ message: 'Orders fetched!', data: orders });
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (order) res.json({ message: 'Order status updated!', data: order });
  else res.status(404).json({ message: 'Order not found' });
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: 'Order deleted!' });
};
