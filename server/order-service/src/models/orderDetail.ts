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
        ref: 'Restaurant',
        required: true
    },
    restaurantName: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userPhone: {
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
        default: 'pending',
        required: true
    },
    orderItems: [{
        itemName: {
            type: String,
            required: true
        },
        itemPrice: {
            type: Number,
            required: true
        },
        itemQuantity: {
            type: Number,
            required: true
        }
    }],
    comments: {
        type: String,
    },
    address: {
        type: String,
        required: true
    },
    orderLocation: {
        type: [Number], // [longitude, latitude]
        required: true
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
}, { timestamps: true });

OrderDetailSchema.index({ orderLocation: '2dsphere' });
export default mongoose.model<OrderDetailDocument>("OrderDetail", OrderDetailSchema);