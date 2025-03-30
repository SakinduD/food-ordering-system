import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import Delivery from '../models/deliveryModel';

let io: SocketIOServer;

export const initializeSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    
    socket.on('joinDeliveryRoom', (deliveryId) => {
      socket.join(deliveryId);
      console.log(`Driver joined delivery room: ${deliveryId}`);
    });

    
    socket.on('updateLocation', async (data) => {
      console.log(`Driver location updated: ${JSON.stringify(data)}`);

      const { deliveryId, currentLocation } = data;
      const delivery = await Delivery.findById(deliveryId);

      if (delivery) {
        delivery.currentLocation = currentLocation;
        await delivery.save();

        
        io.to(deliveryId).emit('locationUpdate', { deliveryId, currentLocation });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

export const getIo = () => io;
