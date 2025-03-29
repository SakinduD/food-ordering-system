import { Request, Response, NextFunction } from "express";
import Order from '../models/orderDetail';
import { OrderDetail } from '../types/order';
import axios from 'axios';

// Define the interface for the request body
interface IOrderRequest extends Request {
    user: {
        userId: string;
        role: string;
    };
    body: OrderDetail;
}

// Place a order by logged in customer
const placeOrder = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const { restaurantId, userName, userEmail, orderItems, totalAmount } = req.body;
        const { userId } = (req as IOrderRequest).user;

        const invoiceId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const order:OrderDetail = await Order.create({
            invoiceId,
            userId,
            restaurantId,
            userName,
            userEmail,
            orderItems,
            totalAmount
        });

        res.status(201).json({ message: order.invoiceId+' Order placed successfully!' });
    } catch (error) {
        next(error);
    }
};

// Get all orders from the database
const getAllOrders = async (
    req: Request, res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const orders = await Order.find();
        res.status(200).json({ message: 'Orders fetched successfully', orders });
    } catch (error) {
        next(error);
    }
};

// Get order list to specific restraurant
const getOrdersByRestaurantId = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    /*try {
        const { userId } = (req as IOrderRequest).user;
        const {data : restaurants} = await axios.get('http://localhost:5000/api/restaurant/');
        const restaurant = restaurants.find((restaurant: any) => restaurant.userId === userId);

        if (!restaurant) {
            res.status(404).json({ message: 'Restaurant not found' });
            return;
        }
        
        const orders = await Order.find({ restaurantId : restaurant._id });
        
        res.status(200).json({ message: 'Orders fetched successfully', orders });
    } catch (error) {
        next(error);
    }*/
};

// Get order by id
const getOrderById = async (
    req: Request<{ id: string }>, 
    res: Response, next: NextFunction
): Promise<void> => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        res.status(200).json({ message: 'Order fetched successfully', order });
    } catch (error) {
        next(error);
    }
};

// Get orders for logged in customer
const getOrdersByUserId = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const { userId } = (req as IOrderRequest).user;

        const orders = await Order.find({ userId });
        res.status(200).json({ message: 'Orders fetched successfully', orders });
    } catch (error) {
        next(error);
    }
};

// Update order status by restraurant owner
const updateOrderStatus = async (
    req: Request<{ id: string }, 
    {}, 
    { orderStatus: string }>, 
    res: Response, next: NextFunction
): Promise<void> => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        const reqOrderStatus = req.body.orderStatus.toLowerCase();
        const validStatuses = new Set(["delivered", "cancelled", "pending", "completed"]);

        if (!validStatuses.has(reqOrderStatus)) {
            res.status(400).json({ message: 'Invalid Order Status' });
            return;
        }

        order.orderStatus = reqOrderStatus;
        await order.save();
        res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        next(error);
    }
};

// Remove order by restraurant owner
const removeOrder = async (
    req: Request<{ id: string }>, 
    res: Response, next: NextFunction
): Promise<void> => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        const status = order.orderStatus.toLowerCase();

        if(status != 'cancelled') {
            res.status(400).json({ message: 'The order cannot be removed unless its status is cancelled.' });
            return;
        }
            
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
         res.status(200).json({ message: 'Order removed successfully' , deletedOrder });
    } catch (error) {
        next(error);
    }
};

export default {
    placeOrder,
    getAllOrders,
    getOrdersByRestaurantId,
    getOrderById,
    getOrdersByUserId,
    updateOrderStatus,
    removeOrder
};