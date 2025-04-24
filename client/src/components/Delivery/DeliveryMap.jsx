import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import axios from 'axios';
import deliveryBikeIcon from '../../assets/delivery-bike.png';
import 'leaflet/dist/leaflet.css';

// Create custom icon
const bikeIcon = new L.Icon({
  iconUrl: deliveryBikeIcon,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -19],
});

// Restaurant marker icon
const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Customer marker icon
const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const DeliveryMap = ({ deliveryId, initialLocation }) => {
  const [driverLocation, setDriverLocation] = useState(initialLocation || {
    latitude: 6.927079,
    longitude: 79.861244
  });
  const [restaurantLocation, setRestaurantLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Fetch delivery details to get restaurant and customer locations
    const fetchDeliveryDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5005/api/deliveries/${deliveryId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        const { restaurantLocation, customerLocation } = response.data;
        setRestaurantLocation({
          latitude: restaurantLocation.coordinates[1],
          longitude: restaurantLocation.coordinates[0]
        });
        setCustomerLocation({
          latitude: customerLocation.coordinates[1],
          longitude: customerLocation.coordinates[0]
        });
      } catch (error) {
        console.error('Error fetching delivery details:', error);
      }
    };

    if (deliveryId) {
      fetchDeliveryDetails();
    }

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

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [deliveryId]);

  // Calculate bounds to fit all markers
  const getBounds = () => {
    const points = [
      [driverLocation.latitude, driverLocation.longitude]
    ];
    
    if (restaurantLocation) {
      points.push([restaurantLocation.latitude, restaurantLocation.longitude]);
    }
    
    if (customerLocation) {
      points.push([customerLocation.latitude, customerLocation.longitude]);
    }
    
    return L.latLngBounds(points);
  };

  // Create path coordinates for the polyline
  const getDeliveryPath = () => {
    const points = [];
    
    if (restaurantLocation) {
      points.push([restaurantLocation.latitude, restaurantLocation.longitude]);
    }
    
    points.push([driverLocation.latitude, driverLocation.longitude]);
    
    if (customerLocation) {
      points.push([customerLocation.latitude, customerLocation.longitude]);
    }
    
    return points;
  };

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        bounds={getBounds()}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Driver Marker */}
        <Marker 
          position={[driverLocation.latitude, driverLocation.longitude]}
          icon={bikeIcon}
        >
          <Popup>
            Driver's current location
          </Popup>
        </Marker>

        {/* Restaurant Marker */}
        {restaurantLocation && (
          <Marker 
            position={[restaurantLocation.latitude, restaurantLocation.longitude]}
            icon={restaurantIcon}
          >
            <Popup>
              Restaurant location
            </Popup>
          </Marker>
        )}

        {/* Customer Marker */}
        {customerLocation && (
          <Marker 
            position={[customerLocation.latitude, customerLocation.longitude]}
            icon={customerIcon}
          >
            <Popup>
              Delivery destination
            </Popup>
          </Marker>
        )}

        {/* Delivery Path */}
        <Polyline
          positions={getDeliveryPath()}
          color="#2563eb"
          weight={3}
          opacity={0.7}
          dashArray="10, 10"
        />
      </MapContainer>
    </div>
  );
};

export default DeliveryMap;