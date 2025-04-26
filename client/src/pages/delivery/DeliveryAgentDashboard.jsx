import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Package, 
  Truck, 
  User, 
  Phone, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRightCircle,
  Settings,
  LogOut,
  RefreshCw,
  AlertTriangle,
  MapIcon
} from 'lucide-react';
import GoogleDeliveryMap from '../../components/Delivery/GoogleDeliveryMap';
import Spinner from '../../components/Spinner';

const DeliveryAgentDashboard = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [deliveries, setDeliveries] = useState([]);
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [locationWatching, setLocationWatching] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    // First, check if we actually have a user
    if (!user) {
      console.log('User not loaded yet, waiting...');
      return; // Wait until user is properly loaded
    }
    
    // Check role once we have user data
    if (user.role !== 'deliveryAgent') {
      toast.error('Unauthorized: Only delivery agents can access this page');
      navigate('/');
      return;
    }

    console.log('Loading initial data for user ID:', user._id);
    
    // Load initial data
    fetchDriverDeliveries();
    getCurrentLocation();
    
    // Cleanup function
    return () => {
      stopLocationTracking();
    };
  }, [user?._id]); // Only depend on user ID, not the entire user object
  
  // Separate useEffect for location tracking
  useEffect(() => {
    // Only start tracking once we have the user and initial data loaded
    if (user && !locationWatching) {
      startLocationTracking();
    }
    
    return () => {
      if (locationWatching) {
        stopLocationTracking();
      }
    };
  }, [user, locationWatching]);
  
  const fetchDriverDeliveries = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }
      
      // Get user ID either from context or localStorage as backup
      let userId;
      
      if (user && user._id) {
        userId = user._id;
      } else {
        // Try to get userId from localStorage as backup
        const savedUser = localStorage.getItem('user');
        const parsedUser = savedUser ? JSON.parse(savedUser) : null;
        userId = parsedUser?.userId;
        
        if (!userId) {
          console.log('User context not available, trying localStorage backup');
          // If we get here and still don't have a userId, show a helpful message
          toast.error('User information not available. Please refresh the page or login again.');
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }
      
      console.log('Fetching deliveries for driver ID:', userId);
      
      // Use the new endpoint that takes driver ID directly as a parameter in the URL
      const response = await axios.get(`http://localhost:5005/api/deliveries/driver/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Deliveries response:', response.data);
      
      setDeliveries(response.data.deliveries || []);
      
      // Set current active delivery (first in-progress one)
      const activeDelivery = response.data.deliveries?.find(d => 
        ['driver_assigned', 'out_for_delivery', 'on_the_way'].includes(d.status?.toLowerCase().replace(/ /g, '_'))
      );
      
      if (activeDelivery) {
        setCurrentDelivery(activeDelivery);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load deliveries');
      toast.error(`Failed to load deliveries: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDriverLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Unable to get your current location');
      }
    );
  };
  
  const startLocationTracking = () => {
    if (!navigator.geolocation || locationWatching) {
      console.log('Geolocation not available or already tracking');
      return; // Already tracking or geolocation not available
    }
    
    console.log('Starting location tracking');
    
    // Clear any existing watchers
    stopLocationTracking();
    
    // Start watching location
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        
        setDriverLocation(newLocation);
        setLocationWatching(true);
        
        // If there's a current delivery, update its location
        if (currentDelivery) {
          updateDeliveryLocation(currentDelivery._id, newLocation);
        }
      },
      (error) => {
        console.error('Error watching location:', error);
        setLocationWatching(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000, // 10 seconds
        timeout: 10000 // 10 seconds
      }
    );
    
    setWatchId(id);
  };
  
  const stopLocationTracking = () => {
    if (watchId !== null) {
      console.log('Stopping location tracking');
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setLocationWatching(false);
    }
  };
  
  const updateDeliveryLocation = async (deliveryId, location) => {
    if (!deliveryId || !location) return;
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(
        `http://localhost:5005/api/deliveries/${deliveryId}/update-location`,
        { location },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error updating location:', error);
      // Don't show error toast to avoid spamming the user
    }
  };
  
  const updateDeliveryStatus = async (deliveryId, status) => {
    try {
      setStatusUpdating(true);
      const token = localStorage.getItem('token');
      
      await axios.post(
        `http://localhost:5005/api/deliveries/${deliveryId}/update-status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`Delivery status updated to ${status}`);
      fetchDriverDeliveries(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update delivery status');
    } finally {
      setStatusUpdating(false);
    }
  };
  
  const goToDeliveryDetails = (deliveryId) => {
    navigate(`/delivery-tracking/${deliveryId}`);
  };
  
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'driver_assigned':
      case 'driver assigned':
        return <User className="h-5 w-5" />;
      case 'out_for_delivery':
      case 'out for delivery':
      case 'on_the_way':
      case 'on the way':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };
  
  const getStatusBgColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'driver_assigned':
      case 'driver assigned':
        return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery':
      case 'out for delivery':
      case 'on_the_way':
      case 'on the way':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <Spinner />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/90 to-white py-6 md:py-12">
      <Toaster />
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header with driver info */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Welcome, {user?.name || 'Driver'}</h1>
                  <p className="text-gray-600">Delivery Agent Dashboard</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={fetchDriverDeliveries}
                  className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-5 w-5" />
                  )}
                  <span className="ml-2">Refresh</span>
                </button>
                
                <button 
                  onClick={() => navigate('/profile')}
                  className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  <span className="ml-2">Settings</span>
                </button>
                
                <button 
                  onClick={logout}
                  className="flex items-center px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-2">Logout</span>
                </button>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="flex items-center gap-2 mb-2 md:mb-0">
                  <div className={`h-3 w-3 rounded-full ${locationWatching ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                  <span className="text-sm text-gray-600">
                    {locationWatching ? 'Location tracking active' : 'Location tracking inactive'}
                  </span>
                </div>
                
                {driverLocation && (
                  <div className="text-sm text-gray-600">
                    Current location: {driverLocation.latitude.toFixed(6)}, {driverLocation.longitude.toFixed(6)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deliveries List Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden sticky top-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Your Deliveries
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {deliveries.length || 0}
                  </span>
                </h2>
                
                {deliveries.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                    <p className="text-gray-500">No deliveries assigned to you yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deliveries.map((delivery) => (
                      <motion.div
                        key={delivery._id}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                          currentDelivery?._id === delivery._id
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setCurrentDelivery(delivery)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            {getStatusIcon(delivery.status)}
                            <h3 className="ml-2 font-medium text-gray-800">Delivery #{delivery._id.slice(-6)}</h3>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs ${getStatusBgColor(delivery.status)}`}>
                            {delivery.status?.replace(/_/g, ' ')}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-3">
                          {new Date(delivery.createdAt).toLocaleString()}
                        </div>
                        
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                          <div className="flex flex-col">
                            <span className="font-medium">Delivery Address:</span>
                            <span className="text-gray-600 truncate max-w-xs">
                              {delivery.customerAddress || 'Address not available'}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          className="w-full mt-3 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToDeliveryDetails(delivery._id);
                          }}
                        >
                          <MapIcon className="h-4 w-4" />
                          <span>Track Details</span>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Current Delivery Panel */}
          <div className="lg:col-span-2">
            {currentDelivery ? (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-800">Current Delivery</h2>
                      <div className={`px-3 py-1 rounded-full text-sm ${getStatusBgColor(currentDelivery.status)}`}>
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(currentDelivery.status)}
                          <span>{currentDelivery.status?.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Order Info */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">ORDER INFO</h3>
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Order ID:</span>
                            <span className="font-medium">#{currentDelivery.orderId?.slice(-6) || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Assigned:</span>
                            <span className="font-medium">
                              {new Date(currentDelivery.updatedAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Distance:</span>
                            <span className="font-medium">
                              {currentDelivery.distance?.toFixed(1) || '~'} km
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Customer Info */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">CUSTOMER INFO</h3>
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Name:</span>
                            <span className="font-medium">{currentDelivery.customerName || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Phone:</span>
                            <span className="font-medium">{currentDelivery.customerPhone || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Address:</span>
                            <span className="font-medium truncate max-w-xs text-right">
                              {currentDelivery.customerAddress || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Show "Start Delivery" button if status is driver_assigned */}
                      {currentDelivery.status?.toLowerCase().replace(/ /g, '_') === 'driver_assigned' && (
                        <button
                          onClick={() => updateDeliveryStatus(currentDelivery._id, 'out_for_delivery')}
                          disabled={statusUpdating}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                        >
                          {statusUpdating ? (
                            <RefreshCw className="h-5 w-5 animate-spin" />
                          ) : (
                            <ArrowRightCircle className="h-5 w-5" />
                          )}
                          Start Delivery
                        </button>
                      )}
                      
                      {/* Show "Mark as Delivered" button if status is out_for_delivery */}
                      {['out_for_delivery', 'on_the_way'].includes(currentDelivery.status?.toLowerCase().replace(/ /g, '_')) && (
                        <button
                          onClick={() => updateDeliveryStatus(currentDelivery._id, 'delivered')}
                          disabled={statusUpdating}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
                        >
                          {statusUpdating ? (
                            <RefreshCw className="h-5 w-5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-5 w-5" />
                          )}
                          Mark as Delivered
                        </button>
                      )}
                      
                      {/* Call Customer Button */}
                      {currentDelivery.customerPhone && (
                        <a
                          href={`tel:${currentDelivery.customerPhone}`}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-100 text-indigo-700 font-medium rounded-xl hover:bg-indigo-200 transition-colors"
                        >
                          <Phone className="h-5 w-5" />
                          Call Customer
                        </a>
                      )}
                      
                      {/* Report Issue Button */}
                      <button
                        onClick={() => toast.error('This feature is coming soon!')}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 text-red-700 font-medium rounded-xl hover:bg-red-200 transition-colors"
                      >
                        <AlertTriangle className="h-5 w-5" />
                        Report Issue
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Map Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Delivery Map</h2>
                    
                    <div className="h-[500px] rounded-xl overflow-hidden border border-gray-200">
                      <GoogleDeliveryMap
                        apiKey="AIzaSyA-e1QNF2Q4yjhTieqegIgQWr51yUpIxms"
                        deliveryId={currentDelivery._id}
                        driverLocation={driverLocation}
                        restaurantLocation={currentDelivery.restaurantLocation ? {
                          latitude: currentDelivery.restaurantLocation.coordinates[1],
                          longitude: currentDelivery.restaurantLocation.coordinates[0]
                        } : null}
                        customerLocation={currentDelivery.customerLocation ? {
                          latitude: currentDelivery.customerLocation.coordinates[1],
                          longitude: currentDelivery.customerLocation.coordinates[0]
                        } : null}
                      />
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                        <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-gray-700">Restaurant</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                        <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-gray-700">Your Location</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                        <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-700">Customer</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden h-full flex flex-col justify-center items-center py-20 px-4">
                <Package className="h-16 w-16 text-blue-200 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Delivery Selected</h2>
                <p className="text-gray-600 max-w-md text-center mb-6">
                  {deliveries.length > 0 
                    ? 'Select a delivery from the list to view details and track location.'
                    : 'No deliveries are currently assigned to you. New deliveries will appear here.'}
                </p>
                {deliveries.length === 0 && (
                  <button
                    onClick={fetchDriverDeliveries}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Refresh Deliveries
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAgentDashboard;