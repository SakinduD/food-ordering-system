import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import Delivery from '../models/deliveryModel';
import User from '../../../auth-service/src/models/User';

let io: SocketIOServer;
const activeDrivers = new Map(); // Store active drivers and their locations

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

    // Driver marks themselves as available/unavailable
    socket.on('driverAvailabilityUpdate', async (data) => {
      const { driverId, isAvailable, location } = data;
      try {
        const driver = await User.findById(driverId);
        if (driver && driver.role === 'deliveryAgent') {
          // Update driver availability and location in database
          driver.isAvailable = isAvailable;
          if (location) {
            driver.currentLocation = {
              type: 'Point',
              coordinates: [location.longitude, location.latitude]
            };
          }
          await driver.save();

          if (isAvailable) {
            activeDrivers.set(driverId, { 
              socketId: socket.id, 
              location: location,
              lastUpdate: new Date()
            });
            socket.join('available-drivers');
          } else {
            activeDrivers.delete(driverId);
            socket.leave('available-drivers');
          }

          // Broadcast driver status update
          io.emit('driverStatusUpdate', {
            driverId,
            isAvailable,
            location: location
          });
        }
      } catch (error) {
        console.error('Error updating driver availability:', error);
      }
    });

    // Handle real-time location updates from drivers
    socket.on('updateDriverLocation', async (data) => {
      const { driverId, deliveryId, location } = data;
      try {
        // Update driver location in database
        await User.findByIdAndUpdate(driverId, {
          currentLocation: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          }
        });

        // If driver is on active delivery, update delivery location
        if (deliveryId) {
          const delivery = await Delivery.findById(deliveryId);
          if (delivery) {
            delivery.currentLocation = {
              type: 'Point',
              coordinates: [location.longitude, location.latitude]
            };
            await delivery.save();

            // Emit to delivery room for customer tracking
            io.to(`delivery:${deliveryId}`).emit('deliveryLocationUpdate', {
              deliveryId,
              location,
              driverId
            });
          }
        }

        // Update active drivers map
        if (activeDrivers.has(driverId)) {
          activeDrivers.set(driverId, {
            ...activeDrivers.get(driverId),
            location,
            lastUpdate: new Date()
          });
        }

        // Broadcast to admin dashboard or monitoring systems
        io.emit('driverLocationUpdate', {
          driverId,
          location,
          deliveryId
        });
      } catch (error) {
        console.error('Error updating location:', error);
      }
    });

    // Join delivery room for tracking specific delivery
    socket.on('joinDeliveryRoom', (data) => {
      const { deliveryId } = data;
      if (deliveryId) {
        socket.join(`delivery:${deliveryId}`);
        console.log(`Client joined delivery room: ${deliveryId}`);
      }
    });

    // Clean up when driver disconnects
    socket.on('disconnect', async () => {
      console.log(`Client disconnected: ${socket.id}`);
      // Find and remove disconnected driver
      for (const [driverId, data] of activeDrivers.entries()) {
        if (data.socketId === socket.id) {
          activeDrivers.delete(driverId);
          // Update driver availability in database
          try {
            await User.findByIdAndUpdate(driverId, { isAvailable: false });
            io.emit('driverStatusUpdate', {
              driverId,
              isAvailable: false
            });
          } catch (error) {
            console.error('Error updating driver status on disconnect:', error);
          }
          break;
        }
      }
    });
  });
};

export const getIo = () => io;
export const getActiveDrivers = () => Array.from(activeDrivers.entries());
