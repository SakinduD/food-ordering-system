require('dotenv').config();
import express from 'express';
import mongoose from 'mongoose';
import deliveryRoutes from './routes/deliveryRoutes';

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || '')
  .then(() => console.log('MongoDB Connected'))
  .catch((err: unknown) => console.error('MongoDB Connection Error:', err));

app.use('/api/deliveries', deliveryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Delivery service running on port ${PORT}`));
