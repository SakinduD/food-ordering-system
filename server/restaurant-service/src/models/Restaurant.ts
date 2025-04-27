import { Schema, model, Document } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  address?: string;
  phone?: string;
  available: boolean;
  isVerified: boolean;
  userId: string;
  category?: string;
  location?: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  imageUrl?: string;
  rating: number;     // Make sure this is defined
  reviewCount: number; // Make sure this is defined
}

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    available: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    userId: { type: String, required: true, unique: true },
    category: { type: String, default: '' },
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
    },
    imageUrl: { type: String },
    rating: { type: Number, default: 0 },        // Make sure this is defined
    reviewCount: { type: Number, default: 0 }    // Make sure this is defined
  },
  { timestamps: true }
);

// Add geospatial index
restaurantSchema.index({ location: '2dsphere' });

export default model<IRestaurant>('Restaurant', restaurantSchema);
