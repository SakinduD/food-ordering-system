import mongoose, { Schema } from 'mongoose';
import { IDelivery } from './IDelivery';

// Define Mongoose Schema
const DeliverySchema: Schema<IDelivery> = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Picked Up', 'On the Way', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    restaurantLocation: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true },
    },
    customerLocation: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true },
    },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
  },
  { timestamps: true }
);

DeliverySchema.index({ restaurantLocation: '2dsphere' });
DeliverySchema.index({ customerLocation: '2dsphere' });


export default mongoose.model<IDelivery>('Delivery', DeliverySchema);
