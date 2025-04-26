import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';

const GoogleDeliveryMap = ({ 
  apiKey, 
  deliveryId, 
  driverLocation, 
  restaurantLocation, 
  customerLocation 
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [markers, setMarkers] = useState({
    restaurant: null,
    driver: null,
    customer: null
  });

  // Initialize Google Maps
  useEffect(() => {
    // Load Google Maps API script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
      return () => {
        document.head.removeChild(script);
      };
    } else {
      initMap();
    }
    
    function initMap() {
      if (!mapRef.current) return;
      
      try {
        // Create map instance
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: { lat: 6.9271, lng: 79.8612 }, // Default center (Colombo, Sri Lanka)
          zoom: 13,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false
        });
        
        setMap(mapInstance);
        
        // Initialize directions services
        const directionsServiceInstance = new window.google.maps.DirectionsService();
        const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
          map: mapInstance,
          suppressMarkers: true, // We'll add custom markers
          polylineOptions: {
            strokeColor: '#3b82f6',
            strokeWeight: 5,
            strokeOpacity: 0.7
          }
        });
        
        setDirectionsService(directionsServiceInstance);
        setDirectionsRenderer(directionsRendererInstance);
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        toast.error('Failed to load map. Please try refreshing.');
      }
    }
  }, [apiKey]);

  // Update markers and calculate route when locations change
  useEffect(() => {
    if (!map || !directionsService || !directionsRenderer) return;
    
    try {
      // Clear existing markers
      Object.values(markers).forEach(marker => {
        if (marker) marker.setMap(null);
      });
      
      const newMarkers = { restaurant: null, driver: null, customer: null };
      const bounds = new window.google.maps.LatLngBounds();
      
      // Add restaurant marker
      if (restaurantLocation) {
        const position = { 
          lat: restaurantLocation.latitude, 
          lng: restaurantLocation.longitude 
        };
        
        newMarkers.restaurant = new window.google.maps.Marker({
          position,
          map,
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(40, 40)
          },
          title: 'Restaurant'
        });
        
        bounds.extend(position);
      }
      
      // Add customer marker
      if (customerLocation) {
        const position = { 
          lat: customerLocation.latitude, 
          lng: customerLocation.longitude 
        };
        
        newMarkers.customer = new window.google.maps.Marker({
          position,
          map,
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
            scaledSize: new window.google.maps.Size(40, 40)
          },
          title: 'Customer'
        });
        
        bounds.extend(position);
      }
      
      // Add driver marker
      if (driverLocation) {
        const position = { 
          lat: driverLocation.latitude, 
          lng: driverLocation.longitude 
        };
        
        newMarkers.driver = new window.google.maps.Marker({
          position,
          map,
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new window.google.maps.Size(40, 40)
          },
          title: 'Driver',
          animation: window.google.maps.Animation.DROP
        });
        
        bounds.extend(position);
        
        // Add info window to driver marker
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="padding: 8px;">
            <p style="font-weight: 500; margin: 0;">Delivery Agent</p>
            <p style="font-size: 12px; margin: 4px 0 0 0;">Last updated: ${new Date().toLocaleTimeString()}</p>
          </div>`
        });
        
        newMarkers.driver.addListener('click', () => {
          infoWindow.open(map, newMarkers.driver);
        });
      }
      
      setMarkers(newMarkers);
      
      // Calculate and display route if we have both origin and destination
      if (driverLocation && (restaurantLocation || customerLocation)) {
        // Determine origin and destination based on available locations
        const origin = driverLocation 
          ? { lat: driverLocation.latitude, lng: driverLocation.longitude }
          : null;
          
        const destination = customerLocation
          ? { lat: customerLocation.latitude, lng: customerLocation.longitude }
          : restaurantLocation
            ? { lat: restaurantLocation.latitude, lng: restaurantLocation.longitude }
            : null;
        
        // Add waypoint if we have all three locations
        const waypoints = [];
        if (driverLocation && restaurantLocation && customerLocation) {
          waypoints.push({
            location: { lat: restaurantLocation.latitude, lng: restaurantLocation.longitude },
            stopover: true
          });
        }
        
        if (origin && destination) {
          directionsService.route({
            origin,
            destination,
            waypoints,
            travelMode: window.google.maps.TravelMode.DRIVING,
            optimizeWaypoints: true
          }, (response, status) => {
            if (status === 'OK') {
              directionsRenderer.setDirections(response);
              
              // Calculate ETA
              let totalDuration = 0;
              response.routes[0].legs.forEach(leg => {
                totalDuration += leg.duration.value;
              });
              
              // Convert seconds to minutes
              const etaMinutes = Math.round(totalDuration / 60);
              
              // Show ETA in toast notification
              if (etaMinutes > 0) {
                toast.success(`Estimated arrival: ${etaMinutes} minutes`);
              }
            } else {
              console.error('Directions request failed due to ' + status);
              directionsRenderer.setDirections({ routes: [] });
            }
          });
        }
      }
      
      // Fit map to bounds
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
        
        // Adjust zoom level if too close
        const listener = window.google.maps.event.addListener(map, 'idle', () => {
          if (map.getZoom() > 16) map.setZoom(16);
          window.google.maps.event.removeListener(listener);
        });
      }
    } catch (error) {
      console.error('Error updating Google Maps markers:', error);
    }
  }, [map, directionsService, directionsRenderer, driverLocation, restaurantLocation, customerLocation]);

  return (
    <div ref={mapRef} style={{ height: '100%', width: '100%' }} className="rounded-xl"></div>
  );
};

export default GoogleDeliveryMap;