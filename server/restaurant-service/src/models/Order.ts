import { Schema, model, Document, Types } from 'mongoose';

export interface IOrder extends Document {
  customerId: Types.ObjectId;
  items: Types.ObjectId[];
  totalPrice: number;
  status: string;
}

const orderSchema = new Schema<IOrder>({
  customerId: { type: Schema.Types.ObjectId, required: true },
  items: [{ type: Schema.Types.ObjectId, ref: 'MenuItem' }],
  totalPrice: Number,
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

export default model<IOrder>('Order', orderSchema);