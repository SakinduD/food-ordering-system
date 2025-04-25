import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

/**
 * Custom hook for managing delivery socket connections
 * @param {String} deliveryId - The ID of the delivery to track
 * @returns {Object} - Socket connection and delivery updates
 */
const useDeliverySocket = (deliveryId) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!deliveryId) {
      setError("No delivery ID provided");
      return;
    }

    // Connect to the socket server
    const socketInstance = io('http://localhost:5005', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    // Set up event handlers
    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
      socketInstance.emit('joinDeliveryRoom', { deliveryId });
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError(`Connection error: ${err.message}`);
      setConnected(false);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socketInstance.on('deliveryLocationUpdate', (data) => {
      if (data.deliveryId === deliveryId) {
        console.log('Location update received:', data);
        setDriverLocation(data.location);
      }
    });

    socketInstance.on('statusUpdate', (data) => {
      if (data.deliveryId === deliveryId) {
        console.log('Status update received:', data);
        setDeliveryStatus(data.status);
      }
    });

    socketInstance.on('error', (err) => {
      console.error('Socket error:', err);
      setError(err.message);
    });

    // Save socket instance
    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [deliveryId]);

  /**
   * Send location update to server
   * @param {Object} location - The location object with latitude and longitude
   */
  const updateLocation = (location) => {
    if (!socket || !connected || !deliveryId) return;
    
    socket.emit('updateDeliveryLocation', {
      deliveryId,
      location
    });
  };

  /**
   * Update delivery status
   * @param {String} status - The new delivery status
   */
  const updateStatus = (status) => {
    if (!socket || !connected || !deliveryId) return;
    
    socket.emit('updateDeliveryStatus', {
      deliveryId,
      status
    });
  };

  return {
    socket,
    connected,
    driverLocation,
    deliveryStatus,
    error,
    updateLocation,
    updateStatus
  };
};

export default useDeliverySocket;