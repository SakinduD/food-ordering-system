import { Request, Response, NextFunction } from "express";
import Order from '../models/orderDetail';
import { OrderDetail } from '../types/order';

// Define the interface for the request body
interface IOrderRequest extends Request {
    body: OrderDetail;
}

// Place a order by logged in customer
const placeOrder = async (
    req: IOrderRequest, 
    res: Response, 
    next: NextFunction
) => {
    try {
        const { userId,restaurantId, userName, userEmail, orderItems, totalAmount } = req.body;
        const order = new Order({
            userId,
            restaurantId,
            userName,
            userEmail,
            orderItems,
            totalAmount
        });

        await order.save();
        res.status(201).json({ message: 'Order placed successfully' });
    } catch (error) {
        next(error);
    }
};

// Get all orders from the database
const getAllOrders = async (
    req: Request, res: Response, 
    next: NextFunction
) => {
    try {
        const orders = await Order.find();
        res.status(200).json({ message: 'Orders fetched successfully', orders });
    } catch (error) {
        next(error);
    }
};

// Get order list to specific restraurant
const getOrdersByRestaurantId = async (
    req: Request<{ restaurantId: string }>, 
    res: Response, 
    next: NextFunction
) => {
    try {
        const orders = await Order.find({ restaurantId: req.params.restaurantId });
        res.status(200).json({ message: 'Orders fetched successfully', orders });
    } catch (error) {
        next(error);
    }
}

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
    req: Request<{ userId: string }>, 
    res: Response, 
    next: NextFunction
) => {
    try {
        const orders = await Order.find({ userId: req.params.userId });
        res.status(200).json({ message: 'Orders fetched successfully', orders });
    } catch (error) {
        next(error);
    }
}

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

        order.orderStatus = req.body.orderStatus;
        await order.save();
        res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        next(error);
    }
}

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
            res.status(400).json({ message: 'The order cannot be removed unless its status is canceled.' });
            return;
        }
            
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
         res.status(200).json({ message: 'Order removed successfully' , deletedOrder });
    } catch (error) {
        next(error);
    }
}

export default {
    placeOrder,
    getAllOrders,
    getOrdersByRestaurantId,
    getOrderById,
    getOrdersByUserId,
    updateOrderStatus,
    removeOrder
};