import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { initializeSocket } from './src/utils/socket';
import deliveryRoutes from './src/routes/deliveryRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);

mongoose.connect(process.env.MONGO_URI || '')
  .then(() => {
    console.log('✅ MongoDB Connected');

    // Start WebSocket only after DB is connected
    initializeSocket(server);

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

app.use('/api/deliveries', deliveryRoutes);
