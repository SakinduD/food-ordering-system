import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import Delivery from '../models/deliveryModel';

let io: SocketIOServer;

export const initializeSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  server.on('upgrade', (request, socket, head) => {
    console.log('🔄 WebSocket Upgrade Request Received');
  });

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    socket.on('joinDeliveryRoom', (deliveryId) => {
      if (deliveryId) {
        socket.join(deliveryId);
        console.log(`🚛 Driver joined delivery room: ${deliveryId}`);
      } else {
        console.error('❌ Invalid deliveryId received');
      }
    });

    socket.on('updateLocation', async (data) => {
      try {
        const { deliveryId, currentLocation } = data;
        if (!deliveryId || !currentLocation) {
          console.error('❌ Missing deliveryId or currentLocation');
          return;
        }

        const delivery = await Delivery.findById(deliveryId);
        if (delivery) {
          delivery.currentLocation = currentLocation;
          await delivery.save();

          io.to(deliveryId).emit('locationUpdate', { deliveryId, currentLocation });
        } else {
          console.error('❌ Delivery not found');
        }
      } catch (error) {
        console.error('❌ Error updating location:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};

export const getIo = () => io;
