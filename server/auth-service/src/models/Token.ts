import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for the Token document
interface IToken extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  token: string;
  createdAt: Date;
}

// Define the schema for the Token model
const tokenSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 }
  }
);

// Create the Token model and export it
const Token = mongoose.model<IToken>('Token', tokenSchema);
export default Token;
