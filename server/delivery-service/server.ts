import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import dotenv from 'dotenv';
import { initializeSocket } from './src/utils/socket';
import deliveryRoutes from './src/routes/deliveryRoutes';


dotenv.config();

const app = express();
app.use(express.json());

const server = http.createServer(app);

mongoose.connect(process.env.MONGO_URI || '')
  .then(() => {
    console.log('✅ MongoDB Connected');

    // Start WebSocket only after DB is connected
    initializeSocket(server);

    // Simulate GPS updates for a specific delivery and driver
    // Use a valid delivery ID

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

app.use('/api/deliveries', deliveryRoutes);
