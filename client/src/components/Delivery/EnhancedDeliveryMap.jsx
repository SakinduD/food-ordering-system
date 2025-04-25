import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './mapStyles.css'; // We'll create this file for custom styles

// Custom marker icons
const createCustomIcon = (iconUrl, size = [32, 32], anchor = [16, 32]) => {
  return L.icon({
    iconUrl,
    iconSize: size,
    iconAnchor: anchor,
    popupAnchor: [0, -32],
  });
};

// Fix for default marker icon paths in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Restaurant marker (red)
const restaurantIcon = createCustomIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png');

// Customer marker (green)
const customerIcon = createCustomIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png');

// Driver marker (blue)
const driverIcon = createCustomIcon('/src/assets/delivery-bike.svg', [40, 40], [20, 20]);

// Component to recenter map when coordinates change
const RecenterMap = ({ positions }) => {
  const map = useMap();

  useEffect(() => {
    if (positions && positions.length > 0) {
      // Create bounds using all available positions
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [positions, map]);

  return null;
};

// Component to animate driver movement
const AnimatedDriverMarker = ({ position, prevPosition, icon }) => {
  const markerRef = useRef(null);
  const map = useMap();

  useEffect(() => {
    if (!prevPosition || !position || !markerRef.current) return;

    const marker = markerRef.current;
    
    // Calculate bearing between points for rotation
    const bearing = calculateBearing(
      prevPosition.latitude, 
      prevPosition.longitude,
      position.latitude, 
      position.longitude
    );
    
    // Rotate the marker icon
    const markerElement = marker?._icon;
    if (markerElement) {
      markerElement.style.transform += ` rotate(${bearing}deg)`;
    }

    // Animate movement
    const duration = 2000; // 2 seconds
    const fps = 30;
    const totalFrames = duration / 1000 * fps;
    let frame = 0;

    const startPos = L.latLng(prevPosition.latitude, prevPosition.longitude);
    const endPos = L.latLng(position.latitude, position.longitude);

    const animate = () => {
      if (frame >= totalFrames || !marker) {
        return;
      }

      frame++;
      const progress = frame / totalFrames;
      
      // Interpolate position
      const lat = startPos.lat + (endPos.lat - startPos.lat) * progress;
      const lng = startPos.lng + (endPos.lng - startPos.lng) * progress;
      
      marker.setLatLng([lat, lng]);
      
      // Request next frame
      requestAnimationFrame(animate);
    };

    animate();
  }, [position, prevPosition, map]);

  if (!position) return null;

  return (
    <Marker 
      ref={markerRef} 
      position={[position.latitude, position.longitude]} 
      icon={icon}
    >
      <Popup>
        <div className="driver-popup">
          <p className="font-medium">Driver Location</p>
          <p className="text-sm">Currently on the way</p>
        </div>
      </Popup>
    </Marker>
  );
};

// Calculate bearing between two points for marker rotation
const calculateBearing = (startLat, startLng, destLat, destLng) => {
  startLat = startLat * Math.PI / 180;
  startLng = startLng * Math.PI / 180;
  destLat = destLat * Math.PI / 180;
  destLng = destLng * Math.PI / 180;

  const y = Math.sin(destLng - startLng) * Math.cos(destLat);
  const x = Math.cos(startLat) * Math.sin(destLat) -
            Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  let bearing = Math.atan2(y, x);
  
  bearing = bearing * 180 / Math.PI;
  bearing = (bearing + 360) % 360;
  
  return bearing;
};

const EnhancedDeliveryMap = ({ 
  restaurant, 
  customer, 
  driver,
  initialZoom = 13
}) => {
  const [driverPosition, setDriverPosition] = useState(driver);
  const [prevDriverPosition, setPrevDriverPosition] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  // Track driver position changes for animation
  useEffect(() => {
    if (driver && driverPosition) {
      if (
        driverPosition.latitude !== driver.latitude ||
        driverPosition.longitude !== driver.longitude
      ) {
        setPrevDriverPosition(driverPosition);
        setDriverPosition(driver);
      }
    } else if (driver) {
      setDriverPosition(driver);
    }
  }, [driver]);

  // Generate a route between points (simple straight line for demo)
  useEffect(() => {
    const route = [];
    
    if (restaurant) {
      route.push([restaurant.latitude, restaurant.longitude]);
    }
    
    if (driverPosition) {
      route.push([driverPosition.latitude, driverPosition.longitude]);
    }
    
    if (customer) {
      route.push([customer.latitude, customer.longitude]);
    }
    
    setRouteCoordinates(route);
  }, [restaurant, customer, driverPosition]);

  // Get all valid positions for map bounds
  const getValidPositions = () => {
    const positions = [];
    
    if (restaurant) {
      positions.push([restaurant.latitude, restaurant.longitude]);
    }
    
    if (driverPosition) {
      positions.push([driverPosition.latitude, driverPosition.longitude]);
    }
    
    if (customer) {
      positions.push([customer.latitude, customer.longitude]);
    }
    
    return positions;
  };

  // Center position (fallback to restaurant or customer if driver is not available)
  const center = driverPosition 
    ? [driverPosition.latitude, driverPosition.longitude]
    : restaurant
      ? [restaurant.latitude, restaurant.longitude]
      : customer
        ? [customer.latitude, customer.longitude]
        : [0, 0];

  return (
    <div className="delivery-map-container h-full w-full">
      <MapContainer 
        center={center} 
        zoom={initialZoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Restaurant Marker */}
        {restaurant && (
          <Marker 
            position={[restaurant.latitude, restaurant.longitude]} 
            icon={restaurantIcon}
          >
            <Popup>
              <div className="restaurant-popup">
                <p className="font-medium">Restaurant</p>
                <p className="text-sm">Order pickup location</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Customer Marker */}
        {customer && (
          <Marker 
            position={[customer.latitude, customer.longitude]} 
            icon={customerIcon}
          >
            <Popup>
              <div className="customer-popup">
                <p className="font-medium">Delivery Location</p>
                <p className="text-sm">Your address</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Driver Marker with Animation */}
        {driverPosition && (
          <AnimatedDriverMarker 
            position={driverPosition}
            prevPosition={prevDriverPosition}
            icon={driverIcon}
          />
        )}
        
        {/* Delivery Route */}
        {routeCoordinates.length > 1 && (
          <Polyline 
            positions={routeCoordinates}
            color="#3b82f6"
            weight={4}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}
        
        {/* Recenter map to fit all markers */}
        <RecenterMap positions={getValidPositions()} />
      </MapContainer>
    </div>
  );
};

export default EnhancedDeliveryMap;