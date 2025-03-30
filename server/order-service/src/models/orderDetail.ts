import mongoose, { Schema, Document } from "mongoose";
import { OrderDetail } from "../types/order";

interface OrderDetailDocument extends OrderDetail, Document {}

const OrderDetailSchema = new Schema({
    invoiceId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant'
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    orderStatus: {
        type: String,
        default: 'Pending',
        required: true
    },
    orderItems: [{
        itemName: {
            type: String,
            required: true
        },
        itemQuantity: {
            type: Number,
            required: true
        }
    }],
    orderLocation: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    roadDistance: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    }
});

export default mongoose.model<OrderDetailDocument>("OrderDetail", OrderDetailSchema);