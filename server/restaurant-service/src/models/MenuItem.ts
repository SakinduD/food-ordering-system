import mongoose, { Schema, model, Document } from 'mongoose';

// Define the interface for a menu item
export interface IMenuItem extends Document {
  name: string;
  description?: string;
  price: number;
  available: boolean;
  restaurantId: mongoose.Types.ObjectId;
}

// Create the schema
const menuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    available: { type: Boolean, default: true },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },    
  },
  {
    timestamps: true,
  }
);

// Export the model
const MenuItem = model<IMenuItem>('MenuItem', menuItemSchema);
export default MenuItem;
