import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { MapPin, User, Activity, Clock, ArrowRight, MapIcon, Truck, AlertCircle } from 'lucide-react';
import Spinner from '../../components/Spinner';

const DeliveryDriverAssignmentPage = () => {
  const { deliveryId } = useParams();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState(null);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningDriver, setAssigningDriver] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  
  useEffect(() => {
    fetchDeliveryDetails();
  }, [deliveryId]);
  
  const fetchDeliveryDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }
      
      // Fetch delivery details
      const deliveryResponse = await axios.get(`http://localhost:5005/api/deliveries/${deliveryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDelivery(deliveryResponse.data);
      
      // Fetch nearby drivers
      const driversResponse = await axios.get(`http://localhost:5005/api/deliveries/${deliveryId}/nearby-drivers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (driversResponse.data.availableDrivers) {
        setAvailableDrivers(driversResponse.data.availableDrivers);
      }
      
      // Get additional restaurant and order details for display
      // In a real app, you'd make these calls to get detailed info
      try {
        const orderResponse = await axios.get(`http://localhost:5001/api/order/getOrderById/${deliveryResponse.data.orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (orderResponse.data.order) {
          setOrderDetails(orderResponse.data.order);
        }
        
        // Restaurant data would come from another endpoint
        // This is a placeholder
        setRestaurantDetails({
          name: "Restaurant Name",
          address: "123 Main St, City",
          phone: "+1234567890"
        });
      } catch (error) {
        console.error('Error fetching additional details:', error);
        // Continue anyway since this is supplementary info
      }
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load delivery details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDriverSelect = (driverId) => {
    setSelectedDriverId(driverId);
  };
  
  const handleAssignDriver = async () => {
    if (!selectedDriverId) {
      toast.error('Please select a driver first');
      return;
    }
    
    try {
      setAssigningDriver(true);
      const token = localStorage.getItem('token');
      
      await axios.post(
        `http://localhost:5005/api/deliveries/${deliveryId}/assign`,
        { driverId: selectedDriverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Driver assigned successfully!');
      
      // Navigate to tracking page after a short delay
      setTimeout(() => {
        navigate(`/delivery-tracking/${deliveryId}`);
      }, 1500);
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast.error(error.response?.data?.message || 'Failed to assign driver');
      setAssigningDriver(false);
    }
  };
  
  if (loading) {
    return <Spinner />;
  }
  
  if (!delivery) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/90 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Delivery Not Found</h2>
          <p className="text-gray-600 mb-6">The delivery you're looking for doesn't exist or has been deleted.</p>
          <button 
            onClick={() => navigate('/restaurant-profile')} 
            className="px-6 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/90 to-white py-12">
      <Toaster />
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-wrap justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
            Assign Driver
          </h2>
          
          <div className="flex gap-4">
            <button
              onClick={() => navigate(`/delivery-tracking/${deliveryId}`)}
              className="px-6 py-2.5 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-all duration-200 flex items-center gap-2"
            >
              <MapIcon className="h-5 w-5" />
              Track Delivery
            </button>
            <button
              onClick={() => navigate('/restaurant-profile')}
              className="px-6 py-2.5 rounded-xl border-2 border-blue-200 bg-white text-blue-600 font-semibold hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
              ← Back
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Delivery Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden sticky top-24">
              <div className="p-6 space-y-6">
                <div className="text-center mb-6">
                  <div className="mb-4">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Truck className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Delivery Details</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Created on {new Date(delivery.createdAt).toLocaleString()}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pick-up Location</p>
                      <p className="font-medium text-sm text-gray-900">
                        {restaurantDetails?.address || "Restaurant Location"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Customer</p>
                      <p className="font-medium text-sm text-gray-900">
                        {orderDetails?.userName || "Customer Name"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {orderDetails?.userPhone || "Phone Number"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Activity className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="font-medium text-sm text-gray-900">{delivery.status}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Distance</p>
                      <p className="font-medium text-sm text-gray-900">
                        {orderDetails?.roadDistance ? `${orderDetails.roadDistance.toFixed(1)} km` : "Calculating..."}
                      </p>
                    </div>
                  </div>
                </div>
                
                {selectedDriverId && (
                  <button
                    onClick={handleAssignDriver}
                    disabled={assigningDriver}
                    className={`w-full py-3 px-4 rounded-xl font-medium text-white flex items-center justify-center gap-2 
                      ${assigningDriver 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300'
                      }`}
                  >
                    {assigningDriver ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Assigning...
                      </>
                    ) : (
                      <>
                        Assign Driver <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Available Drivers */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Available Drivers Nearby</h3>
                
                {availableDrivers.length === 0 ? (
                  <div className="text-center p-10 bg-gray-50 rounded-xl">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="h-8 w-8 text-blue-500" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">No Drivers Available</h4>
                    <p className="text-gray-600 max-w-md mx-auto">
                      There are no active drivers in your area at the moment. 
                      Please check back later or contact support for assistance.
                    </p>
                    <button
                      onClick={fetchDeliveryDetails}
                      className="mt-6 px-6 py-2.5 bg-blue-100 text-blue-600 font-medium rounded-lg hover:bg-blue-200 transition duration-300"
                    >
                      Refresh
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableDrivers.map((driver) => (
                      <motion.div
                        key={driver.driverId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`border rounded-xl p-4 flex justify-between items-center transition-all duration-200 hover:bg-blue-50/30 cursor-pointer
                          ${selectedDriverId === driver.driverId ? 'bg-blue-50 border-blue-300' : 'border-gray-200'}`}
                        onClick={() => handleDriverSelect(driver.driverId)}
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0
                            ${selectedDriverId === driver.driverId ? 'bg-blue-200' : 'bg-gray-100'}`}
                          >
                            <User 
                              className={`h-6 w-6 ${selectedDriverId === driver.driverId ? 'text-blue-600' : 'text-gray-600'}`} 
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{driver.name}</h4>
                            <div className="flex items-center gap-6 mt-1">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">{driver.distance} km away</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">Est. {Math.ceil(driver.distance * 3)} min</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className={`h-6 w-6 rounded-full border-2 flex items-center justify-center
                          ${selectedDriverId === driver.driverId 
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'}`
                          }
                        >
                          {selectedDriverId === driver.driverId && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {availableDrivers.length > 0 && !selectedDriverId && (
              <div className="mt-4 text-center">
                <p className="text-gray-600">Please select a driver to continue</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDriverAssignmentPage;