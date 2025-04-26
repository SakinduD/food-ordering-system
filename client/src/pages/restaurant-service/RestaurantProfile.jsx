// src/pages/restaurant-service/RestaurantProfile.jsx
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import Spinner from "../../components/Spinner";
import { toast } from "react-hot-toast";
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react"; // Import icons for verification status

const RestaurantProfile = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user) return;

    const fetchRestaurant = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:5000/api/restaurants/user/${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRestaurant(response.data.data);
        setLoading(false);
        fetchOrders();
      } catch (error) {
        console.error("Error fetching restaurant:", error);
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5001/api/order/getOrdersByRestaurantId`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5001/api/order/updateOrderStatus/${orderId}`,
        { orderStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prevOrders) =>
        prevOrders.map(order => order._id === orderId ? { ...order, orderStatus: newStatus } : order)
      );

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return "bg-yellow-100 text-yellow-800";
      case 'processing':
      case 'accepted': return "bg-blue-100 text-blue-800";
      case 'delivered':
      case 'completed': return "bg-green-100 text-green-800";
      case 'cancelled': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const canCreateDelivery = (status) => {
    return ["accepted", "processing"].includes(status?.toLowerCase());
  };

  if (loading || !user) return <Spinner />;

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/90 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Restaurant Profile</h2>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <p className="text-xl text-gray-600 mb-6">You don't have a restaurant registered yet.</p>
            <Link
              to="/register-restaurant"
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Register Your Restaurant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter(order => order.orderStatus.toLowerCase() === 'pending');
  const otherOrders = orders.filter(order => 
    ['accepted', 'completed', 'delivered', 'cancelled'].includes(order.orderStatus.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/90 to-white py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            Restaurant Dashboard
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-2.5 rounded-xl border-2 border-orange-200 bg-white text-orange-600 font-semibold hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
            >
              ← Back
            </button>
            <button
              onClick={() => navigate('/edit-restaurant', { state: restaurant })}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg hover:shadow-orange-500/30 hover:scale-105 transition-all duration-200"
            >
              ✏️ Edit Restaurant Profile
            </button>
          </div>
        </div>

        {/* Restaurant Info Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden mb-8">
          <div className="p-6 flex flex-col md:flex-row gap-6">
            {restaurant.imageUrl && (
              <div className="w-full md:w-1/3 h-64 rounded-xl overflow-hidden">
                <img 
                  src={`http://localhost:5000${restaurant.imageUrl}`}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="w-full md:w-2/3">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{restaurant.name}</h3>
              <p className="text-gray-600 mb-4">{restaurant.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Address</h4>
                  <p className="text-gray-800">{restaurant.address}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Phone</h4>
                  <p className="text-gray-800">{restaurant.phone}</p>
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <span className={`px-4 py-1 rounded-full text-sm font-medium ${restaurant.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {restaurant.available ? 'Open' : 'Closed'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="flex border-b border-orange-100">
            <button className="px-6 py-4 font-semibold text-orange-600 border-b-2 border-orange-500">Orders</button>
            <Link to="/admin/menu" className="px-6 py-4 font-semibold text-gray-500 hover:text-orange-600 transition-colors">Menu Items</Link>
          </div>

          <div className="p-6">
          
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="text-xl font-semibold">Recent Orders</h3>

            {/* Search bar */}
            <div className="relative w-full md:w-72">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">
                🔍
                </span>
                <input
                type="text"
                placeholder="Search by Order ID or Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
            </div>
            </div>


            {ordersLoading ? (
              <Spinner />
            ) : (
              <>
                 <OrderCategory title="🔵 Pending Orders" orders={pendingOrders} searchTerm={searchTerm} />
                 <OrderCategory title="🔶 Other Orders" orders={otherOrders} searchTerm={searchTerm} />
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );

  function OrderCategory({ title, orders, searchTerm }) {
    const filteredOrders = orders.filter(order =>
      order.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredOrders.length === 0) return null;

    // Display pending verification message if restaurant exists but isn't verified
    if (restaurant && !restaurant.isVerified) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-orange-50/90 to-white py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                            Restaurant Dashboard
                        </h2>
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="px-6 py-2.5 rounded-xl border-2 border-orange-200 bg-white text-orange-600 font-semibold hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                                >
                                ← Back
                            </button>
                        </div>
                    </div>

                    {/* Verification Pending Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-yellow-200 overflow-hidden mb-8">
                        <div className="p-6 flex flex-col items-center text-center">
                            <div className="p-4 bg-yellow-100 rounded-full mb-6">
                                <ShieldAlert size={64} className="text-yellow-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Verification Pending</h3>
                            <p className="text-gray-600 mb-6 max-w-xl">
                                Your restaurant <span className="font-semibold">{restaurant.name}</span> has been registered successfully, but it's currently awaiting verification by our admin team. 
                                You'll gain full access to your restaurant dashboard once the verification process is complete.
                            </p>
                            <div className="bg-yellow-50 p-4 rounded-xl w-full max-w-md">
                                <h4 className="font-semibold text-yellow-700 mb-2">What happens next?</h4>
                                <ul className="text-left text-sm text-yellow-800 space-y-2">
                                    <li>• Our team will review your restaurant information</li>
                                    <li>• You'll receive an email when verification is complete</li>
                                    <li>• Once verified, you can manage orders and update your menu</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Restaurant Preview Card (Limited info) */}
                    <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold mb-4">Restaurant Preview</h3>
                            <div className="flex flex-col md:flex-row gap-6">
                                {restaurant.imageUrl && (
                                    <div className="w-full md:w-1/3 h-48 rounded-xl overflow-hidden">
                                        <img 
                                            src={`http://localhost:5000${restaurant.imageUrl}`}
                                            alt={restaurant.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="w-full md:w-2/3">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{restaurant.name}</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-500">Address</h4>
                                            <p className="text-gray-800">{restaurant.address}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-500">Phone</h4>
                                            <p className="text-gray-800">{restaurant.phone}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            onClick={() => navigate('/edit-restaurant', { state: restaurant })}
                                            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            Edit Restaurant Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main restaurant dashboard UI (only shown if verified)
    return (
<<<<<<< HEAD
        <div className="min-h-screen bg-gradient-to-b from-orange-50/90 to-white py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                            Restaurant Dashboard
                        </h2>
                        <div className="flex items-center mt-2 gap-2">
                            <ShieldCheck size={20} className="text-green-600" />
                            <span className="text-green-700 font-medium">Verified Restaurant</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-2.5 rounded-xl border-2 border-orange-200 bg-white text-orange-600 font-semibold hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                            >
                            ← Back
                        </button>
                        <button
                            onClick={() => navigate('/edit-restaurant', { state: restaurant })}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg hover:shadow-orange-500/30 hover:scale-105 transition-all duration-200"
                            >
                            ✏️ Edit Restaurant Profile
                        </button>
                    </div>
                </div>

                {/* Restaurant Details Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden mb-8">
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            {restaurant.imageUrl && (
                                <div className="w-full md:w-1/3 h-64 rounded-xl overflow-hidden">
                                    <img 
                                        src={`http://localhost:5000${restaurant.imageUrl}`}
                                        alt={restaurant.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="w-full md:w-2/3">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{restaurant.name}</h3>
                                <p className="text-gray-600 mb-4">{restaurant.description}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500">Address</h4>
                                        <p className="text-gray-800">{restaurant.address}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500">Phone</h4>
                                        <p className="text-gray-800">{restaurant.phone}</p>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-4">
                                    <span className={`px-4 py-1 rounded-full text-sm font-medium ${restaurant.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {restaurant.available ? 'Open' : 'Closed'}
                                    </span>
                                    <button 
                                        onClick={async () => {
                                            try {
                                                const token = localStorage.getItem("token");
                                                await axios.put(`http://localhost:5000/api/restaurants/${restaurant._id}/availability`, 
                                                    { available: !restaurant.available },
                                                    {
                                                        headers: { Authorization: `Bearer ${token}` }
                                                    }
                                                );
                                                // Update local state
                                                setRestaurant({...restaurant, available: !restaurant.available});
                                                toast.success(`Restaurant is now ${!restaurant.available ? 'open' : 'closed'}`);
                                            } catch (error) {
                                                console.error("Error updating availability:", error);
                                                toast.error("Failed to update availability");
                                            }
                                        }}
                                        className="px-4 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                                    >
                                        Toggle Status
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu and Orders Tabs */}
                <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
                    <div className="flex border-b border-orange-100">
                        <button 
                            className="px-6 py-4 font-semibold text-orange-600 border-b-2 border-orange-500"
=======
      <div className="mb-12">
        <h4 className="text-lg font-bold mb-4">{title}</h4>
        <div className="overflow-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">Order ID</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Customer</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Amount</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">{order.invoiceId}</td>
                  <td className="p-4">{order.userName}</td>
                  <td className="p-4">{new Date(order.orderDate || order.createdAt).toLocaleString()}</td>
                  <td className="p-4 font-medium">Rs. {order.totalAmount?.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <select
                        className="text-sm border border-gray-300 rounded-lg px-2 py-1"
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      {canCreateDelivery(order.orderStatus) && (
                        <Link
                          to={`/create-delivery/${order._id}`}
                          className="inline-block px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
>>>>>>> ff5a77d030a11a933ade8eb84872865afdb92313
                        >
                          Create Delivery
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
};

export default RestaurantProfile;
