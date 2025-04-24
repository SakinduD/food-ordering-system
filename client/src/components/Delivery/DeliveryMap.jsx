import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import deliveryBikeIcon from '../../assets/delivery-bike.png';
import 'leaflet/dist/leaflet.css';

// Create custom icon
const bikeIcon = new L.Icon({
  iconUrl: deliveryBikeIcon,
  iconSize: [42, 42],
  iconAnchor: [19, 19],
  popupAnchor: [0, -19],
});

const DeliveryMap = ({ deliveryId, initialLocation }) => {
  const [driverLocation, setDriverLocation] = useState(initialLocation || {
    latitude: 6.927079, // Default to Colombo
    longitude: 79.861244
  });
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5005', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket');
      if (deliveryId) {
        newSocket.emit('joinDeliveryRoom', { deliveryId });
      }
    });

    newSocket.on('deliveryLocationUpdate', (data) => {
      if (data.deliveryId === deliveryId) {
        setDriverLocation(data.location);
      }
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [deliveryId]);

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={[driverLocation.latitude, driverLocation.longitude]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker 
          position={[driverLocation.latitude, driverLocation.longitude]}
          icon={bikeIcon}
        >
          <Popup>
            Driver's current location
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default DeliveryMap;