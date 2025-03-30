import { Schema, model, Document } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  address?: string;
  phone?: string;
  available: boolean;
  userId: string;
}

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    available: { type: Boolean, default: true },
    userId: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

export default model<IRestaurant>('Restaurant', restaurantSchema);
