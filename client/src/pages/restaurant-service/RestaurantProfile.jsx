// src/pages/restaurant-service/RestaurantProfile.jsx
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import Spinner from "../../components/Spinner";
import { toast } from "react-hot-toast";

const RestaurantProfile = () => {
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    useEffect(() => {
        if (!user) return;

        const fetchRestaurant = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`http://localhost:5000/api/restaurants/user/${user.userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setRestaurant(response.data.data);
                setLoading(false);

                // Fetch orders for this restaurant
                fetchOrders(response.data.data._id);
            } catch (error) {
                console.error("Error fetching restaurant:", error);
                setLoading(false);
            }
        };

        fetchRestaurant();
    }, [user]);

    const fetchOrders = async (restaurantId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:5001/api/order/getOrdersByRestaurantId`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Update local state to reflect the change
            setOrders(orders.map(order => 
                order._id === orderId ? { ...order, orderStatus: newStatus } : order
            ));

            toast.success(`Order status updated to ${newStatus}`);
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error("Failed to update order status");
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return "bg-yellow-100 text-yellow-800";
            case 'processing':
            case 'accepted':
                return "bg-blue-100 text-blue-800";
            case 'delivered':
            case 'completed':
                return "bg-green-100 text-green-800";
            case 'cancelled':
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const canCreateDelivery = (status) => {
        // Only allow delivery creation for accepted or processing orders
        return ["accepted", "processing"].includes(status?.toLowerCase());
    };

    if (loading || !user) {
        return <Spinner />;
    }

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

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50/90 to-white py-12">
            <div className="container mx-auto px-4 max-w-6xl">
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
                        >
                            Orders
                        </button>
                        <Link 
                            to="/admin/menu" 
                            className="px-6 py-4 font-semibold text-gray-500 hover:text-orange-600 transition-colors"
                        >
                            Menu Items
                        </Link>
                    </div>
                    
                    {/* Orders Section */}
                    <div className="p-6">
                        <h3 className="text-xl font-semibold mb-6">Recent Orders</h3>
                        
                        {ordersLoading ? (
                            <div className="text-center py-12">
                                <Spinner />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl">
                                <p className="text-xl text-gray-600 mb-2">No orders yet</p>
                                <p className="text-gray-500">Orders will appear here when customers place them.</p>
                            </div>
                        ) : (
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
                                        {orders.map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{order.invoiceId}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium text-gray-900">{order.userName}</div>
                                                    <div className="text-sm text-gray-500">{order.userPhone}</div>
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    {new Date(order.orderDate || order.createdAt).toLocaleString()}
                                                </td>
                                                <td className="p-4 whitespace-nowrap font-medium text-gray-900">
                                                    ${order.totalAmount?.toFixed(2)}
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantProfile;
