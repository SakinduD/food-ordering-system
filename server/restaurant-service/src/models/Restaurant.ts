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
    coordinates: [number, number]; 
  };
  imageUrl?: string;
  rating: number;     
  reviewCount: number; 
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
    rating: { type: Number, default: 0 },        
    reviewCount: { type: Number, default: 0 }    
  },
  { timestamps: true }
);

restaurantSchema.index({ location: '2dsphere' });

export default model<IRestaurant>('Restaurant', restaurantSchema);
