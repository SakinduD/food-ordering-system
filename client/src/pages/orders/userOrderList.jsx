import { useEffect, useState } from "react";
import { UserContext } from "../../context/userContext";
import { useContext } from "react";
import axios from "axios";
import Spinner from "../../components/Spinner";
import { ClockIcon, TruckIcon, CheckCircleIcon, XCircleIcon, ClipboardCheck, RefreshCw, SearchIcon } from "lucide-react";
import { Link } from "react-router-dom";

const UserOrderList = () => {
    const { user, loading } = useContext(UserContext);
    const [orders, setOrders] = useState([]);
    const [itemLoading, setItemLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                if (!user?.userId) return;
                
                const token = localStorage.getItem("token");
                if (!token) return;

                const { data } = await axios.get('http://localhost:5001/api/order/getOrdersByUserId', {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                // Sort orders by createdAt date in descending order (newest first)
                const sortedOrders = data.orders.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setOrders(sortedOrders);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setItemLoading(false);
            }
        };

        fetchOrders();
    }, [user?.userId]);

    const filteredOrders = orders.filter(order => {
        const searchLower = searchTerm.toLowerCase();
        
        if (order.invoiceId.toLowerCase().includes(searchLower)) return true;
        if (order.restaurantName.toLowerCase().includes(searchLower)) return true;
        if (order.orderItems.some(item => 
            item.itemName.toLowerCase().includes(searchLower)
        )) return true;
        
        return false;
    });

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return <ClockIcon className="h-5 w-5" />;
            case 'accepted':
                return <CheckCircleIcon className="h-5 w-5" />;
            case 'out_for_delivery':
                return <TruckIcon className="h-5 w-5" />;
            case 'delivered':
                return <TruckIcon className="h-5 w-5" />;
            case 'completed':
                return <ClipboardCheck className="h-5 w-5" />;
            case 'cancelled':
                return <XCircleIcon className="h-5 w-5" />;
            default:
                return <RefreshCw className="h-5 w-5" />;
        }
    };

    if (loading || itemLoading) return <Spinner />;

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50/90 to-white py-12">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header Section */}
                <div className="mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-4">
                        Your Orders
                    </h2>
                    
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <p className="text-gray-600">Track and manage your orders</p>
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-orange-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by order ID, restaurant, or items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 pr-4 py-3.5 w-full rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 placeholder-gray-400 shadow-sm text-gray-600 text-base transition-all duration-200"
                            />
                        </div>
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-12 text-center">
                        <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                            {searchTerm ? 'No matching orders found' : 'No orders yet'}
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            {searchTerm 
                                ? 'Try searching with different keywords or check your order ID' 
                                : 'When you place orders, they will appear here for you to track'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredOrders.map(order => (
                            <Link 
                                key={order._id}
                                to={`/detailed-order/${order._id}`}
                                className="block transform transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-orange-500/20 rounded-2xl"
                            >
                                <div className="bg-white h-full rounded-2xl shadow-sm hover:shadow-xl border border-orange-100 overflow-hidden transition-all duration-300">
                                    <div className="p-6">
                                        {/* Order Header */}
                                        <div className="flex flex-col gap-4 mb-6">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium bg-orange-50 text-orange-700 border border-orange-200">
                                                            {getStatusIcon(order.orderStatus)}
                                                            <span>{order.orderStatus}</span>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-500">
                                                            {new Date(order.createdAt).toLocaleString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="text-xl font-bold text-orange-600">
                                                        ${order.totalAmount.toFixed(2)}
                                                    </div>
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                        <span className="text-sm font-medium text-gray-500">Order ID:</span>
                                                        <span className="font-semibold text-gray-900">{order.invoiceId}</span>
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-500">
                                                        {order.orderItems.reduce((total, item) => total + item.itemQuantity, 0)} items
                                                    </div>
                                            </div>
                                            <div className="border-t border-orange-100"></div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="space-y-3">
                                            {order.orderItems.slice(0, 2).map((item, index) => (
                                                <div 
                                                    key={index}
                                                    className="flex items-center justify-between py-3 px-4 bg-orange-50/50 rounded-xl hover:bg-orange-50 transition-colors duration-200"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <span className="font-medium text-gray-800 block truncate">
                                                            {item.itemName}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 ml-4">
                                                        <span className="text-sm font-medium text-gray-500">×{item.itemQuantity}</span>
                                                        <span className="font-semibold text-orange-600 min-w-[80px] text-right">
                                                            ${(item.itemPrice * item.itemQuantity).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            {order.orderItems.length > 2 && (
                                                <div className="text-center py-2 text-sm font-medium text-orange-600 hover:text-orange-700">
                                                    +{order.orderItems.length - 2} more items
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserOrderList;