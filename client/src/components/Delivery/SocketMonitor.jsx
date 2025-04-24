import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const SocketMonitor = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);

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
      addEvent('Socket Connected');
      toast.success('Socket Connected');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      addEvent('Socket Disconnected');
      toast.error('Socket Disconnected');
    });

    // Listen for delivery events
    newSocket.on('newDeliveryAvailable', (data) => {
      addEvent('New Delivery Available', data);
    });

    newSocket.on('driverAssigned', (data) => {
      addEvent('Driver Assigned', data);
    });

    newSocket.on('driverStatusUpdate', (data) => {
      addEvent('Driver Status Update', data);
    });

    newSocket.on('deliveryLocationUpdate', (data) => {
      addEvent('Delivery Location Update', data);
      setDriverLocation(data.location);
    });

    newSocket.on('error', (error) => {
      addEvent('Socket Error', error);
      toast.error(error.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const addEvent = (type, data = null) => {
    const newEvent = {
      type,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    setEvents(prev => [newEvent, ...prev].slice(0, 10)); // Keep last 10 events
  };

  // Test function to simulate driver location update
  const simulateLocationUpdate = () => {
    if (!socket) return;
    
    const mockLocation = {
      latitude: 6.927079 + (Math.random() - 0.5) * 0.01, // Random variation around Colombo
      longitude: 79.861244 + (Math.random() - 0.5) * 0.01
    };

    socket.emit('updateDriverLocation', {
      location: mockLocation
    });
  };

  // Test function to simulate driver availability update
  const toggleDriverAvailability = () => {
    if (!socket) return;
    
    socket.emit('driverAvailabilityUpdate', {
      isAvailable: true,
      location: {
        latitude: 6.927079,
        longitude: 79.861244
      }
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Socket Monitor</h2>
      
      <div className="mb-4">
        <div className={`inline-block px-3 py-1 rounded-full ${
          connected ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <button
          onClick={simulateLocationUpdate}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Simulate Location Update
        </button>
        <button
          onClick={toggleDriverAvailability}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Toggle Availability
        </button>
      </div>

      {driverLocation && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <h3 className="font-semibold">Current Driver Location:</h3>
          <p>Latitude: {driverLocation.latitude}</p>
          <p>Longitude: {driverLocation.longitude}</p>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <h3 className="font-semibold p-3 bg-gray-50 border-b">Recent Events</h3>
        <div className="divide-y">
          {events.map((event, index) => (
            <div key={index} className="p-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{event.type}</span>
                <span className="text-gray-500">{event.timestamp}</span>
              </div>
              {event.data && (
                <pre className="mt-1 text-xs bg-gray-50 p-2 rounded">
                  {JSON.stringify(event.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocketMonitor;