import { Types } from "mongoose";
import axios from 'axios';

export type OrderStatus = 
    | 'pending'
    | 'accepted'
    | 'completed'
    | 'delivered'
    | 'cancelled'
    | 'out_for_delivery';

export interface OrderDetail {
    _id: string;
    invoiceId: string;
    userId: Types.ObjectId;
    restaurantId: Types.ObjectId;
    restaurantName: string;
    userName: string;
    userPhone: string;
    orderDate: Date;
    orderStatus: OrderStatus;
    orderItems: {
        itemName: string;
        itemPrice: number;
        itemQuantity: number;
    }[];
    comments?: string;
    orderLocation: {
        latitude: number;
        longitude: number;
    };
    roadDistance: number;
    deliveryFee: number;
    totalAmount: number;
    createdAt: Date;
    address: string;
}

export interface OrderRequest {
    getOrderById(orderId: string): Promise<OrderDetail | null>;
}

export class OrderRequest implements OrderRequest {
    
    private baseUrl: string;

    constructor() {
        const orderUrl = process.env.ORDER_SERVICE_URL;

        if (!orderUrl) {
            throw new Error('ORDER_SERVICE_URL is not defined in .env file');
        }

        this.baseUrl = orderUrl;
    }

    async getOrderById(orderId: string): Promise<OrderDetail | null> {
        try {
            const response = await axios.get(`${this.baseUrl}/api/order/getOrderById/${orderId}`);
            return response.data.order;
        } catch (error) {
            console.error('Error fetching order:', error);
            return null;
        }
    }

}