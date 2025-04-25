import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Check, 
  Clock, 
  Package, 
  Truck, 
  User, 
  Phone, 
  MessageCircle, 
  Navigation, 
  AlertCircle,
  ArrowLeft 
} from 'lucide-react';
import Spinner from '../../components/Spinner';
import EnhancedDeliveryMap from '../../components/Delivery/EnhancedDeliveryMap';
import useDeliverySocket from '../../components/Delivery/useDeliverySocket';

const DeliveryState = ({ status, showLabel = true }) => {
  let bgColor, textColor, icon;
  
  switch (status?.toLowerCase().replace(/_/g, ' ')) {
    case 'pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      icon = <Clock className="h-4 w-4 text-yellow-500" />;
      break;
    case 'driver assigned':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      icon = <User className="h-4 w-4 text-blue-500" />;
      break;
    case 'on the way':
    case 'out for delivery':
      bgColor = 'bg-indigo-100';
      textColor = 'text-indigo-800';
      icon = <Truck className="h-4 w-4 text-indigo-500" />;
      break;
    case 'delivered':
    case 'completed':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      icon = <Check className="h-4 w-4 text-green-500" />;
      break;
    case 'failed':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      icon = <AlertCircle className="h-4 w-4 text-red-500" />;
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      icon = <Package className="h-4 w-4 text-gray-500" />;
  }
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${bgColor}`}>
      {icon}
      {showLabel && (
        <span className={`text-xs font-medium ${textColor}`}>
          {status?.replace(/_/g, ' ')}
        </span>
      )}
    </div>
  );
};

const DeliveryProgress = ({ status }) => {
  const steps = [
    { key: 'pending', label: 'Created' },
    { key: 'driver_assigned', label: 'Driver Assigned' },
    { key: 'out_for_delivery', label: 'On the Way' },
    { key: 'delivered', label: 'Delivered' }
  ];
  
  const statusIndex = steps.findIndex(step => 
    step.key.toLowerCase() === status?.toLowerCase().replace(/ /g, '_')
  );
  
  const currentStep = statusIndex === -1 ? 0 : statusIndex;
  
  const getStepStatus = (index) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };
  
  return (
    <div className="w-full py-2">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div key={step.key} className="flex flex-col items-center">
            <div 
              className={`h-8 w-8 rounded-full flex items-center justify-center border-2
                ${getStepStatus(index) === 'completed' ? 'bg-green-500 border-green-500' : 
                getStepStatus(index) === 'current' ? 'bg-blue-100 border-blue-500' : 
                'bg-gray-100 border-gray-300'}
              `}
            >
              {getStepStatus(index) === 'completed' ? (
                <Check className="h-4 w-4 text-white" />
              ) : (
                <span className={`text-xs font-medium ${
                  getStepStatus(index) === 'current' ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {index + 1}
                </span>
              )}
            </div>
            <span className={`text-xs mt-1 ${
              getStepStatus(index) === 'completed' ? 'text-green-600' : 
              getStepStatus(index) === 'current' ? 'text-blue-600 font-medium' : 
              'text-gray-500'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="relative flex h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="absolute inset-0 flex"
          style={{ width: `${Math.max(5, (currentStep / (steps.length - 1)) * 100)}%` }}
        >
          <div className="h-full w-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

const DeliveryTrackingPage = () => {
  const { deliveryId } = useParams();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState(null);
  const [order, setOrder] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [driver, setDriver] = useState(null);
  
  const { 
    driverLocation, 
    deliveryStatus, 
    error: socketError 
  } = useDeliverySocket(deliveryId);
  
  useEffect(() => {
    fetchDeliveryDetails();
  }, [deliveryId]);
  
  useEffect(() => {
    if (driverLocation) {
      setDriver(prevDriver => ({
        ...prevDriver,
        location: driverLocation
      }));
    }
  }, [driverLocation]);
  
  useEffect(() => {
    if (deliveryStatus) {
      setDelivery(prevDelivery => ({
        ...prevDelivery,
        status: deliveryStatus
      }));
    }
  }, [deliveryStatus]);
  
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
      
      // Fetch order details
      const orderResponse = await axios.get(`http://localhost:5001/api/order/getOrderById/${deliveryResponse.data.orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrder(orderResponse.data.order);
      
      // Fetch restaurant details
      const restaurantResponse = await axios.get(`http://localhost:5000/api/restaurants/${deliveryResponse.data.restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRestaurant(restaurantResponse.data.data);
      
      // Fetch driver details if available
      if (deliveryResponse.data.driverId) {
        const driverResponse = await axios.get(`http://localhost:5005/api/drivers/${deliveryResponse.data.driverId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setDriver(driverResponse.data);
      }
      
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load delivery details');
      toast.error('Failed to load delivery details');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <Spinner />;
  }
  
  if (error || !delivery) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/90 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Delivery Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The delivery you\'re looking for doesn\'t exist or has been deleted.'}</p>
          <button 
            onClick={() => navigate('/orders')} 
            className="px-6 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }
  
  const restaurantLocation = {
    latitude: delivery.restaurantLocation.coordinates[1],
    longitude: delivery.restaurantLocation.coordinates[0]
  };
  
  const customerLocation = {
    latitude: delivery.customerLocation.coordinates[1],
    longitude: delivery.customerLocation.coordinates[0]
  };
  
  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} h ${mins > 0 ? `${mins} min` : ''}`;
  };
  
  // Estimated arrival time calculation is just a mock
  // In a real app, this would be based on distance, traffic, etc.
  const estimatedArrivalTime = () => {
    // Assume 2 minutes per kilometer
    const distance = order.roadDistance || 5; // default to 5km if not available
    const timeInMinutes = Math.ceil(distance * 2);
    
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + timeInMinutes * 60000);
    
    return {
      time: formatTime(timeInMinutes),
      displayTime: arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };
  
  const arrival = estimatedArrivalTime();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/90 to-white py-12">
      <Toaster />
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-wrap justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Delivery Tracker
            </h2>
          </div>
          
          <DeliveryState status={delivery.status} />
        </div>
        
        {/* Delivery Progress */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Delivery Progress</h3>
            <DeliveryProgress status={delivery.status} />
            
            <div className="mt-6 flex flex-col md:flex-row items-center justify-between bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Navigation className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Arrival Time</p>
                  <p className="text-lg font-semibold text-gray-900">{arrival.displayTime}</p>
                </div>
              </div>
              
              <div className="flex flex-col md:items-end">
                <p className="text-sm text-gray-600">Estimated Time</p>
                <p className="text-lg font-semibold text-blue-600">{arrival.time}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Tracking</h3>
                
                <div className="rounded-xl overflow-hidden border border-blue-100 h-[400px]">
                  <EnhancedDeliveryMap 
                    restaurant={restaurantLocation}
                    customer={customerLocation}
                    driver={driver?.location}
                  />
                </div>
                
                {socketError && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>Tracking error: {socketError}</span>
                  </div>
                )}
                
                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                    <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-gray-700">Restaurant</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                    <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-700">Driver Location</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-700">Your Address</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Details */}
            <div className="mt-6 bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="font-medium text-gray-900">{order.invoiceId}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Delivery Distance</p>
                      <p className="font-medium text-gray-900">{order.roadDistance?.toFixed(1) || '–'} km</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items</h4>
                  <div className="border border-gray-100 rounded-lg overflow-hidden divide-y divide-gray-100">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="p-3 bg-gray-50 flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                          <span className="font-medium text-gray-900">{item.itemQuantity}×</span>
                          <span className="text-gray-700">{item.itemName}</span>
                        </div>
                        <span className="text-gray-700">${(item.itemPrice * item.itemQuantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                  <span className="font-medium text-gray-700">Total</span>
                  <span className="font-medium text-gray-900">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Driver Info & Address Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            {/* Driver Info */}
            {driver ? (
              <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden mb-6">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Driver</h3>
                  
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-8 w-8 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{driver.name}</h4>
                      <div className="flex items-center mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg 
                              key={star}
                              xmlns="http://www.w3.org/2000/svg" 
                              className={`h-4 w-4 ${star <= driver.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                              viewBox="0 0 20 20" 
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm ml-1 text-gray-600">{driver.rating.toFixed(1)}</span>
                        <span className="text-xs ml-2 text-gray-500">({driver.totalDeliveries} deliveries)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-4">
                    <a 
                      href={`tel:${driver.phone}`}
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-blue-100 text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Call Driver</span>
                    </a>
                    
                    <button 
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-blue-100 text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden mb-6">
                <div className="p-6 text-center">
                  <div className="h-16 w-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Driver Assigned Yet</h3>
                  <p className="text-gray-500 text-sm">A driver will be assigned to your delivery soon.</p>
                </div>
              </div>
            )}
            
            {/* Restaurant Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant</h3>
                
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="h-16 w-16 rounded-xl bg-orange-100 flex items-center justify-center overflow-hidden">
                    {restaurant.imageUrl ? (
                      <img 
                        src={`http://localhost:5000${restaurant.imageUrl}`}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{restaurant.name}</h4>
                    <p className="text-sm text-gray-500">{restaurant.address}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <a 
                    href={`tel:${restaurant.phone}`}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-orange-100 text-orange-600 hover:bg-orange-50 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call Restaurant</span>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
                
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Your Location</h4>
                    <p className="text-gray-600 mt-1">{order.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTrackingPage;