import { Types } from "mongoose";

export type OrderStatus = 
    | 'pending'
    | 'accepted'
    | 'completed'
    | 'delivered'
    | 'cancelled'
    | 'out_for_delivery';

export interface OrderDetail {
    invoiceId: string;
    userId: Types.ObjectId;
    restaurantId: Types.ObjectId;
    restaurantName: string;
    userName: string;
    userPhone: string;
    orderDate: Date;
    address: string;
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
}