import { Schema, model, Document } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  available: boolean;
}

const restaurantSchema = new Schema<IRestaurant>({
  name: { type: String, required: true },
  available: { type: Boolean, default: true }
}, { timestamps: true });

export default model<IRestaurant>('Restaurant', restaurantSchema);

