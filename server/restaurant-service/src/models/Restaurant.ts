import { Schema, model, Document } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  address?: string;
  phone?: string;
  available: boolean;
  userId: string;
  location?: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
}

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    available: { type: Boolean, default: true },
    userId: { type: String, required: true, unique: true },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  { timestamps: true }
);

// Add geospatial index
restaurantSchema.index({ location: '2dsphere' });

export default model<IRestaurant>('Restaurant', restaurantSchema);
