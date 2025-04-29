import mongoose, { Schema } from 'mongoose';
import { IDelivery } from './IDelivery';

// Define Mongoose Schema
const DeliverySchema: Schema<IDelivery> = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    status: {
      type: String,
      enum: [
        'pending', 
        'driver_assigned', 
        'picked_up', 
        'on_the_way', 
        'out_for_delivery',
        'delivered', 
        'cancelled'
      ],
      default: 'pending',
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
    isDriverAssigned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

DeliverySchema.index({ restaurantLocation: '2dsphere' });
DeliverySchema.index({ customerLocation: '2dsphere' });


export default mongoose.model<IDelivery>('Delivery', DeliverySchema);
