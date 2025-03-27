import mongoose from 'mongoose';

export interface IDelivery extends mongoose.Document {
  orderId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  status: 'Pending' | 'Accepted' | 'Picked Up' | 'On the Way' | 'Delivered' | 'Cancelled';
  restaurantLocation: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  customerLocation: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  currentLocation?: {
    type: 'Point';
    coordinates: [number, number];
  };
  createdAt: Date;
  updatedAt: Date;
}
