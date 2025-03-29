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
    totalAmount: number;
}