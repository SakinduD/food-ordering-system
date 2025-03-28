import mongoose, { Schema, Document } from 'mongoose';

// Define the role types
export type UserRole = 'customer' | 'restaurantOwner' | 'deliveryAgent';

// Define the interface for the User document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isAdmin: boolean;
  isVerified: boolean;
  otp: string | null;
  otpExpires: Date | null;
}

// Define the schema for the User model
const userSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['customer', 'restaurantOwner', 'deliveryAgent'], 
      required: true 
    },
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null }
  },
  { timestamps: true }
);

// Create the User model and export it
const User = mongoose.model<IUser>('User', userSchema);
export default User;