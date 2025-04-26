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

// Get order summary for a specific user
const getUserOrderSummary = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        // Get userId from query parameter or from the authenticated user
        const userId = req.query.userId || (req as IOrderRequest).user._id;
        
        if (!userId) {
            res.status(400).json({ message: 'User ID is required' });
            return;
        }
        
        // Find all orders for the user
        const orders = await Order.find({ userId });
        
        if (!orders || orders.length === 0) {
            res.status(200).json({ 
                message: 'No orders found for this user',
                summary: {
                    userId,
                    totalOrders: 0,
                    totalSpent: 0,
                    averageOrderValue: 0,
                    recentOrders: [],
                    statusDistribution: {},
                    topRestaurants: [],
                    ordersByMonth: {},
                    firstOrderDate: null,
                    lastOrderDate: null
                } 
            });
            return;
        }
        
        // Calculate summary statistics
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const averageOrderValue = totalSpent / totalOrders;
        
        // Get the most recent orders (limit to 10)
        // Note: orderDate is defined in your schema, but you also have timestamps enabled
        const recentOrders = [...orders]
            .sort((a, b) => {
                // Use orderDate from the schema
                const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
                const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
                return dateB - dateA; // newest first
            })
            .slice(0, 10)
            .map(order => ({
                _id: order._id,
                invoiceId: order.invoiceId,
                userId: order.userId,
                restaurantId: order.restaurantId,
                restaurantName: order.restaurantName,
                userName: order.userName,
                userPhone: order.userPhone,
                orderDate: order.orderDate,
                orderStatus: order.orderStatus,
                roadDistance: order.roadDistance,
                deliveryFee: order.deliveryFee,
                totalAmount: order.totalAmount,
                // Don't include orderItems to keep response size manageable
            }));
        
        // Get order status distribution
        const statusCounts = orders.reduce((acc, order) => {
            const status = order.orderStatus || 'unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        // Get restaurant distribution
        const restaurantCounts = orders.reduce((acc, order) => {
            if (!order.restaurantId) {
                const unknownKey = 'unknown';
                if (!acc[unknownKey]) {
                    acc[unknownKey] = {
                        name: 'Unknown Restaurant',
                        count: 0,
                        total: 0
                    };
                }
                acc[unknownKey].count += 1;
                acc[unknownKey].total += (order.totalAmount || 0);
                return acc;
            }
            
            const restaurantId = order.restaurantId.toString();
            const restaurantName = order.restaurantName || 'Unknown Restaurant';
            
            if (!acc[restaurantId]) {
                acc[restaurantId] = {
                    name: restaurantName,
                    count: 0,
                    total: 0
                };
            }
            
            acc[restaurantId].count += 1;
            acc[restaurantId].total += (order.totalAmount || 0);
            
            return acc;
        }, {} as Record<string, { name: string, count: number, total: number }>);
        
        // Convert restaurant counts to array and sort by count
        const topRestaurants = Object.values(restaurantCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        
        // Get order counts by month for the past year
        const now = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        
        const ordersByMonth: Record<string, number> = {};
        
        orders.forEach(order => {
            // Use orderDate from the schema
            if (order.orderDate) {
                const orderDate = new Date(order.orderDate);
                
                if (orderDate >= oneYearAgo) {
                    const monthYear = `${orderDate.getFullYear()}-${(orderDate.getMonth() + 1).toString().padStart(2, '0')}`;
                    ordersByMonth[monthYear] = (ordersByMonth[monthYear] || 0) + 1;
                }
            }
        });
        
        // Find first and last order dates safely
        let firstOrderDate = null;
        let lastOrderDate = null;
        
        if (orders.length > 0) {
            // Sort orders by orderDate for first order
            const sortedByOldest = [...orders].sort((a, b) => {
                const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
                const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
                return dateA - dateB;
            });
            
            // Sort orders by orderDate for last order
            const sortedByNewest = [...orders].sort((a, b) => {
                const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
                const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
                return dateB - dateA;
            });
            
            firstOrderDate = sortedByOldest[0].orderDate;
            lastOrderDate = sortedByNewest[0].orderDate;
        }

        // Calculate most ordered items
        const itemCounts: Record<string, number> = {};
        orders.forEach(order => {
            if (order.orderItems && Array.isArray(order.orderItems)) {
                order.orderItems.forEach(item => {
                    if (item.itemName) {
                        itemCounts[item.itemName] = (itemCounts[item.itemName] || 0) + (item.itemQuantity || 1);
                    }
                });
            }
        });

        const topItems = Object.entries(itemCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        
        // Create the summary object
        const summary = {
            userId,
            totalOrders,
            totalSpent,
            averageOrderValue,
            statusDistribution: statusCounts,
            topRestaurants,
            topItems,
            ordersByMonth,
            recentOrders,
            firstOrderDate,
            lastOrderDate
        };
        
        res.status(200).json({ 
            message: 'Order summary fetched successfully',
            summary
        });
    } catch (error) {
        console.error('Error in getUserOrderSummary:', error);
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
    removeOrder,
    getUserOrderSummary
};