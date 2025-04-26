import { Request, Response, NextFunction } from "express";
import Order from '../models/orderDetail';
import { OrderDetail } from '../types/order';
import deliveyDistance from '../utils/deliveryDistance';
import deliveryFee from '../utils/deliveryFee';
import { RestaurantService } from "../services/restrauntService";

// Define the interface for the request body
interface IOrderRequest extends Request {
    user: {
        _id: string;
        role: string;
    };
    body: OrderDetail;
}

const restaurantService = new RestaurantService();

// Place a order by logged in customer
const placeOrder = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const { customerLat, customerLon, userName, userPhone, orderItems, comments, foodTotalPrice, address } = req.body;
        const userId = (req as IOrderRequest).user._id;
        const restaurantId = orderItems[0].restaurantId;

        const invalidItem = orderItems.find(
            (item: OrderDetail) => item.restaurantId.toString() !== restaurantId.toString()
        );

        if (invalidItem) {
            res.status(400)
                .json({ message: 'All items in an order must come from the same restaurant.' });
                return
        }

        const restaurant = await restaurantService.getRestaurantById(restaurantId);
        if (!restaurant) {
            res.status(404).json({ message: 'Restaurant not found' });
            return;
        }

        const restaurantName = restaurant.name;

        //generate a uniqe invoice id for the order
        const invoiceId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        //call the delivery distance API to get the road distance
        const roadDistance: number = await deliveyDistance(customerLat, customerLon, restaurantId);
        
        //calculate the delivery fee based on the road distance
        const deliveryFeeAmount = deliveryFee(roadDistance);

        const totalAmount: number = deliveryFeeAmount + foodTotalPrice;

        const order = await Order.create({
            invoiceId,
            userId,
            restaurantId,
            restaurantName,
            userName,
            userPhone,
            orderItems,
            comments,
            address,
            orderLocation: [customerLon, customerLat],
            roadDistance,
            deliveryFee: deliveryFeeAmount,
            totalAmount
        });

        res.status(201).json({ message: order.invoiceId+' Order placed successfully!', orderId: order._id });
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
    try {
        const userId = (req as IOrderRequest).user._id;

        const restaurants = await restaurantService.getAllRestaurants();
        if (!restaurants || restaurants.length === 0) {
            res.status(404).json({ message: 'No restaurants found' });
            return;
        }

        const restaurant = restaurants.find((restaurant: any) => restaurant.userId === userId);
        console.log('Restaurant:', restaurant);
        if (!restaurant) {
            res.status(404).json({ message: 'Restaurant not found' });
            return;
        }
        
        const orders = await Order.find({ restaurantId : restaurant._id });
        
        res.status(200).json({ message: 'Orders fetched successfully', orders });
    } catch (error) {
        next(error);
    }
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
        const userId = (req as IOrderRequest).user._id;

        const orders = await Order.find({ userId });
        res.status(200).json({ message: 'Orders fetched successfully', orders });
    } catch (error) {
        next(error);
    }
};

// Update order status by restraurant owner
const updateOrderStatus = async (
    req: Request, 
    res: Response, next: NextFunction
): Promise<void> => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        const reqOrderStatus = req.body.orderStatus.toLowerCase();
        const validStatuses = new Set([
            "delivered", 
            "cancelled", 
            "pending", 
            "completed", 
            "accepted",
            "out_for_delivery"
        ]);

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

// Remove order
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