// src/pages/restaurant-service/RestaurantProfile.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from "../../context/userContext";
import { useContext } from "react";
import { MapPin, Phone, Store, Clock, Package, CreditCard, ChevronRight } from 'lucide-react';
import Spinner from '../../components/Spinner';

const RestaurantProfile = () => {
  const [restaurant, setRestaurant] = useState({});
  const navigate = useNavigate();
  const { user, loading } = useContext(UserContext);
  const userId = user.userId;
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/restaurants/user/${userId}`, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
        });
        setRestaurant(response.data.data);
      } catch (err) {
        console.error('Failed to fetch restaurant profile', err);
      }
    };

    fetchProfile();
  }, [userId]);

  console.log('ords', orders);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5001/api/order/getOrdersByRestaurantId', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(res.data.orders);
      console.log('test', res);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  if (loading) {
    return <Spinner />;
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/90 to-white py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            Restaurant Profile
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-xl border-2 border-orange-200 bg-white text-orange-600 font-semibold hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
            >
              ← Back
            </button>
            <button
              onClick={() => navigate('/register-restaurant')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold shadow hover:shadow-orange-400/40 hover:scale-105 transition duration-200"
            >
              ➕ Register Restaurant
            </button>
            <button
              onClick={() => navigate('/edit-restaurant', { state: restaurant })}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg hover:shadow-orange-500/30 hover:scale-105 transition-all duration-200"
            >
              ✏️ Edit Profile
            </button>
          </div>
        </div>

        {/* Restaurant Info Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-2xl bg-orange-100 flex items-center justify-center">
                <Store className="h-8 w-8 text-orange-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{restaurant.name}</h3>
                <p className="text-gray-500">{restaurant.available ? 'Open for Orders' : 'Currently Closed'}</p>
              </div>
              <span className={`ml-auto px-4 py-1 rounded-full text-sm font-medium ${
                restaurant.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {restaurant.available ? 'Available' : 'Unavailable'}
              </span>
            </div>

            {restaurant.imageUrl && (
              <div className="w-full rounded-xl overflow-hidden border border-orange-100 mb-6">
                <img
                  src={`http://localhost:5000${restaurant.imageUrl}`}
                  alt="Restaurant"
                  className="w-full h-[320px] object-contain bg-white"
                />
              </div>
            )}


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <p className="font-medium text-gray-900">{restaurant.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="font-medium text-gray-900">{restaurant.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Coordinates</p>
                  <p className="font-medium text-gray-900">
                    {restaurant.location?.coordinates?.join(', ') || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {restaurant.location?.coordinates && (
  <div className="w-full mt-6 rounded-xl overflow-hidden border border-orange-200 bg-white">
    <img
      src={`https://maps.wikimedia.org/img/osm-intl,15,${restaurant.location.coordinates[1]},${restaurant.location.coordinates[0]},800x350.png`}
      alt="Restaurant Location Map"
      className="w-full h-[280px] object-cover transition duration-300 hover:scale-[1.01]"
      onError={(e) => {
        e.target.src = '';
        e.target.alt = 'Map failed to load';
      }}
    />
  </div>
)}

          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              Recent Orders
            </h3>

            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order._id}
                    className="p-4 rounded-xl bg-orange-50/50 border border-orange-100 hover:border-orange-200 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Invoice ID</p>
                        <p className="font-medium text-gray-900">{order.invoiceId}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {order.orderItems?.map((item) => (
                        <div 
                          key={item._id}
                          className="flex items-center justify-between py-2 px-3 bg-white rounded-lg"
                        >
                          <span className="font-medium text-gray-900">{item.itemName}</span>
                          <span className="text-sm text-gray-600">Qty: {item.itemQuantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-orange-100">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-gray-500">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{order.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-orange-600 font-semibold">
                          <CreditCard className="h-4 w-4" />
                          Rs. {order.totalAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-orange-200 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h4>
                <p className="text-gray-500">Orders will appear here once customers place them.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfile;
