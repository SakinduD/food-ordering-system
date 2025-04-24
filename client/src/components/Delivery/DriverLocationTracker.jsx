import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import DeliveryMap from './DeliveryMap';

const DriverLocationTracker = () => {
  const { deliveryId } = useParams();
  const [driverLocation, setDriverLocation] = useState(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5005', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    // Connection events
    newSocket.on('connect', () => {
      setConnected(true);
      console.log('Socket Connected');
      
      // Join the specific delivery room to get updates
      if (deliveryId) {
        newSocket.emit('joinDeliveryRoom', { deliveryId });
      }
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('Socket Disconnected');
    });

    // Listen for location updates
    newSocket.on('deliveryLocationUpdate', (data) => {
      console.log('Received location update:', data);
      if (data.deliveryId === deliveryId) {
        setDriverLocation(data.location);
        toast.info('Driver location updated');
      }
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [deliveryId]);

  const simulateLocationUpdate = () => {
    if (!socket) {
      toast.error('Socket not connected');
      return;
    }

    if (!deliveryId) {
      toast.error('Delivery ID is required');
      return;
    }

    const mockLocation = {
      latitude: 6.927079 + (Math.random() - 0.5) * 0.01,
      longitude: 79.861244 + (Math.random() - 0.5) * 0.01
    };

    socket.emit('updateDriverLocation', {
      deliveryId,
      location: mockLocation
    }, (error) => {
      if (error) {
        console.error('Location update error:', error);
        toast.error(error.message || 'Failed to update location');
      } else {
        toast.success('Location updated successfully');
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Driver Location Tracker</h3>
          <p className="text-sm text-gray-600">Delivery ID: {deliveryId || 'Not set'}</p>
          <div className={`inline-block px-2 py-1 rounded-full text-sm ${
            connected ? 'bg-green-500' : 'bg-red-500'
          } text-white mt-2`}>
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        {/* Map Component */}
        <div className="mb-4">
          <DeliveryMap 
            deliveryId={deliveryId} 
            initialLocation={driverLocation}
          />
        </div>

        {driverLocation && (
          <div className="space-y-2 mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium">Current Location:</h4>
            <p>
              <span className="font-medium">Latitude:</span> {driverLocation.latitude}
            </p>
            <p>
              <span className="font-medium">Longitude:</span> {driverLocation.longitude}
            </p>
          </div>
        )}

        {/* Test button - only show in development */}
        {process.env.NODE_ENV !== 'production' && (
          <button
            onClick={simulateLocationUpdate}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            disabled={!connected || !deliveryId}
          >
            Simulate Location Update
          </button>
        )}
      </div>
    </div>
  );
};

export default DriverLocationTracker;