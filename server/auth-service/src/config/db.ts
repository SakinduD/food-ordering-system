import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI: string = process.env.MONGO_URI as string;
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', (err as Error).message);
    process.exit(1);
  }
};

export default connectDB;
