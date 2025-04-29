import { Schema, model, Document, Types } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  description?: string;
  imageUrl?: String,
  price: number;
  category: string;
  available: boolean;
  restaurantId: Types.ObjectId;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    available: { type: Boolean, default: true },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },    
  },
  {
    timestamps: true,
  }
);

const MenuItem = model<IMenuItem>('MenuItem', menuItemSchema);
export default MenuItem;
