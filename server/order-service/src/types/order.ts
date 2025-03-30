import { Types } from "mongoose";

export interface OrderDetail {
    invoiceId: string;
    userId: Types.ObjectId;
    restaurantId: Types.ObjectId;
    userName: string;
    userEmail: string;
    orderDate: Date;
    orderStatus: string;
    orderItems: {
        itemName: string;
        itemQuantity: number;
    }[];
    orderLocation: {
        latitude: number;
        longitude: number;
    };
    roadDistance: number;
    deliveryFee: number;
    totalAmount: number;
}