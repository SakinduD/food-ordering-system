import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { AuthServiceAdapter, UserServiceAdapter } from '../adapters/serviceAdapters';
import Delivery from '../models/deliveryModel';

let io: SocketIOServer;
const activeDrivers = new Map();
const authService = new AuthServiceAdapter();
const userService = new UserServiceAdapter();

export const initializeSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Add authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication token is required'));
      }

      const userData = await authService.verifyToken(token);
      socket.data.user = userData;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);
    const user = socket.data.user;

    // Only allow delivery agents to update their location
    socket.on('driverAvailabilityUpdate', async (data) => {
      if (user.role !== 'deliveryAgent') {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      const { isAvailable, location } = data;
      try {
        // Update driver availability through user service
        if (isAvailable) {
          activeDrivers.set(user._id, { 
            socketId: socket.id, 
            location,
            lastUpdate: new Date()
          });
          socket.join('available-drivers');
        } else {
          activeDrivers.delete(user._id);
          socket.leave('available-drivers');
        }

        io.emit('driverStatusUpdate', {
          driverId: user._id,
          isAvailable,
          location
        });
      } catch (error) {
        console.error('Error updating driver availability:', error);
        socket.emit('error', { message: 'Failed to update availability' });
      }
    });

    socket.on('updateDriverLocation', async (data) => {
      if (user.role !== 'deliveryAgent') {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      const { deliveryId, location } = data;
      try {
        // Validate delivery assignment
        if (deliveryId) {
          const delivery = await Delivery.findById(deliveryId);
          if (delivery && delivery.driverId?.toString() === user._id) {
            delivery.currentLocation = {
              type: 'Point',
              coordinates: [location.longitude, location.latitude]
            };
            await delivery.save();

            io.to(`delivery:${deliveryId}`).emit('deliveryLocationUpdate', {
              deliveryId,
              location,
              driverId: user._id
            });
          }
        }

        if (activeDrivers.has(user._id)) {
          activeDrivers.set(user._id, {
            ...activeDrivers.get(user._id),
            location,
            lastUpdate: new Date()
          });
        }

        io.emit('driverLocationUpdate', {
          driverId: user._id,
          location,
          deliveryId
        });
      } catch (error) {
        console.error('Error updating location:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    socket.on('joinDeliveryRoom', async (data) => {
      const { deliveryId } = data;
      try {
        const delivery = await Delivery.findById(deliveryId);
        if (!delivery) {
          socket.emit('error', { message: 'Delivery not found' });
          return;
        }

        // Verify user permissions
        if (user.isAdmin || 
            delivery.restaurantId.toString() === user.restaurantId ||
            (user.role === 'deliveryAgent' && delivery.driverId?.toString() === user._id)) {
          socket.join(`delivery:${deliveryId}`);
          console.log(`Client joined delivery room: ${deliveryId}`);
        } else {
          socket.emit('error', { message: 'Unauthorized to join this delivery room' });
        }
      } catch (error) {
        console.error('Error joining delivery room:', error);
        socket.emit('error', { message: 'Failed to join delivery room' });
      }
    });

    socket.on('disconnect', async () => {
      if (user.role === 'deliveryAgent') {
        activeDrivers.delete(user._id);
        io.emit('driverStatusUpdate', {
          driverId: user._id,
          isAvailable: false
        });
      }
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

export const getIo = () => io;
export const getActiveDrivers = () => Array.from(activeDrivers.entries());
