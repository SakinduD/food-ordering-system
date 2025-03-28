import { Schema, model, Document } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  description: string;
  price: number;
  available: boolean;
}

const menuItemSchema = new Schema<IMenuItem>({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  available: { type: Boolean, default: true }
}, { timestamps: true });

export default model<IMenuItem>('MenuItem', menuItemSchema);