import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

if(!MONGO_URI) {
    throw new Error('Mongo URI is required for this application.');
}

mongoose.connect(MONGO_URI)
    .then(() =>console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB', err));

export default mongoose;
