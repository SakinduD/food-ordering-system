import mongoose from 'mongoose';

export interface IDelivery extends mongoose.Document {
  orderId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId; // Make driverId optional since it will be assigned later
  status: 'pending' | 'driver_assigned' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled' | 'out_for_delivery';
  restaurantLocation: {
    type: 'Point';
    coordinates: [number, number];
  };
  customerLocation: {
    type: 'Point';
    coordinates: [number, number];
  };
  currentLocation?: {
    type: 'Point';
    coordinates: [number, number];
  };
  isDriverAssigned: boolean;
  createdAt: Date;
  updatedAt: Date;
}