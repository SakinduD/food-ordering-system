import { Types } from "mongoose";

export interface OrderDetail {
    invoiceId: string;
    userId: Types.ObjectId;
    restaurantId: Types.ObjectId;
    restaurantName: string;
    userName: string;
    userPhone: string;
    orderDate: Date;
    orderStatus: string;
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