import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import {
  MapPin,
  Clock,
  User,
  Package,
  ArrowRight,
  Truck,
  ArrowLeft,
  Check,
  AlertCircle
} from 'lucide-react';
import Spinner from '../../components/Spinner';

const DeliveryCreationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingDelivery, setCreatingDelivery] = useState(false);
  const [error, setError] = useState(null);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  useEffect(() => {
    if (restaurant?.location) {
      fetchAvailableDrivers();
    }
  }, [restaurant]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }
      
      // Fetch order details
      const orderResponse = await axios.get(`http://localhost:5001/api/order/getOrderById/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const orderData = orderResponse.data.order;
      setOrder(orderData);
      
      // Check if order is eligible for delivery
      if (orderData.orderStatus !== 'accepted' && orderData.orderStatus !== 'prepared') {
        setError('Only accepted or prepared orders can be sent for delivery');
        setLoading(false);
        return;
      }
      
      // Fetch restaurant details
      const restaurantResponse = await axios.get(`http://localhost:5000/api/restaurants/${orderData.restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRestaurant(restaurantResponse.data.data);
      
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load order details');
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDrivers = async () => {
    try {
      setLoadingDrivers(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5005/api/deliveries/active-drivers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableDrivers(response.data.drivers || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Failed to load available drivers');
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleCreateDelivery = async () => {
    try {
      setCreatingDelivery(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }

      // Create delivery
      const response = await axios.post(
        'http://localhost:5005/api/deliveries',
        {
          orderId: orderId,
          restaurantId: order.restaurantId,
          userId: order.userId,
          restaurantLocation: restaurant.location,
          customerLocation: { 
            type: "Point", 
            coordinates: order.orderLocation 
          }
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const deliveryId = response.data.delivery._id;

      // Assign driver
      await axios.post(
        `http://localhost:5005/api/deliveries/${deliveryId}/assign`,
        { driverId: selectedDriverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update order status
    //   await axios.put(
    //     `http://localhost:5001/api/order/updateOrderStatus/${orderId}`,
    //     { orderStatus: 'out_for_delivery' },
    //     {
    //       headers: { Authorization: `Bearer ${token}` }
    //     }
    //   );
      
      toast.success('Delivery created and driver assigned successfully!');
      navigate(`/restaurant-profile`);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create delivery: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setCreatingDelivery(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/90 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Create Delivery</h2>
          <p className="text-gray-600 mb-6">{error || 'The order you\'re looking for doesn\'t exist or has been deleted.'}</p>
          <button 
            onClick={() => navigate('/restaurant/orders')} 
            className="px-6 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // Check if order is eligible for delivery
  const isEligible = ['accepted', 'prepared'].includes(order.orderStatus?.toLowerCase());

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/90 to-white py-12">
      <Toaster />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
            Create Delivery
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Order Details</h4>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="font-medium text-gray-900">{order.invoiceId}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Order Time</p>
                      <p className="font-medium text-gray-900">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className={`w-2 h-2 rounded-full ${
                          isEligible ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <p className="font-medium text-gray-900 capitalize">
                          {order.orderStatus}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Customer Information</h4>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Customer Name</p>
                      <p className="font-medium text-gray-900">{order.userName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Delivery Address</p>
                      <p className="font-medium text-gray-900 mt-0.5">{order.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Order Items</h4>
              
              <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
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
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                <span className="font-medium text-gray-700">Total</span>
                <span className="font-medium text-gray-900">LKR{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Creation Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
            
            {!isEligible ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl text-red-800">
                <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-medium">Cannot Create Delivery</p>
                  <p className="text-sm mt-1">
                    Only orders with 'Accepted' or 'Prepared' status can be sent for delivery.
                    Current status: <span className="font-medium capitalize">{order.orderStatus}</span>
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-blue-50 rounded-xl mb-6">
                  <p className="flex items-center gap-2 text-blue-800">
                    <Check className="h-5 w-5 text-blue-500" />
                    <span>This order is eligible for delivery</span>
                  </p>
                  
                  <p className="mt-2 text-sm text-blue-700">
                    Creating a delivery will allow you to assign a driver for this order and start
                    the delivery process.
                  </p>
                </div>

                {/* Driver Selection Section */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Available Drivers</h4>
                  {loadingDrivers ? (
                    <div className="text-center py-4">
                      <div className="inline-block h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading available drivers...</p>
                    </div>
                  ) : availableDrivers.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-xl">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                        <AlertCircle className="h-6 w-6 text-blue-500" />
                      </div>
                      <p className="text-gray-600">No drivers are currently available.</p>
                      <button
                        onClick={fetchAvailableDrivers}
                        className="mt-3 px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        Refresh Drivers List
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {availableDrivers.map((driver) => (
                        <div
                          key={driver.driverId}
                          onClick={() => setSelectedDriverId(driver.driverId)}
                          className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 
                            ${selectedDriverId === driver.driverId 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-blue-200'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">{driver.name}</h5>
                              <div className="flex items-center gap-4 mt-1">
                                <p className="text-sm text-gray-600">
                                  Rating: {driver.rating || '4.5'}★
                                </p>
                                <p className="text-sm text-gray-600">
                                  {driver.totalDeliveries || '100'}+ deliveries
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between gap-8">
                  <div className="flex-1">
                    <p className="text-gray-700">
                      Delivery distance: <span className="font-medium">{order.roadDistance?.toFixed(1) || '5.0'} km</span>
                    </p>
                    <p className="text-gray-700 mt-1">
                      Delivery fee: <span className="font-medium">LKR{order.deliveryFee?.toFixed(2) || '3.00'}</span>
                    </p>
                  </div>
                  
                  <div className="flex-1">
                    <button
                      onClick={handleCreateDelivery}
                      disabled={creatingDelivery || !selectedDriverId}
                      className={`w-full py-3 px-6 rounded-xl flex items-center justify-center gap-2
                        ${(creatingDelivery || !selectedDriverId)
                          ? 'bg-gray-300 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium transition-colors`}
                    >
                      {creatingDelivery ? (
                        <>
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Delivery</span>
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </button>
                    {!selectedDriverId && (
                      <p className="text-sm text-gray-500 text-center mt-2">
                        Please select a driver to create delivery
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryCreationPage;