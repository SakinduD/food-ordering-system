import { useEffect, useState } from "react";
import { UserContext } from "../../context/userContext";
import { useContext } from "react";
import axios from "axios";
import Spinner from "../../components/Spinner";
import { ClockIcon, PackageIcon, TruckIcon, CheckCircleIcon } from "lucide-react";
import { Link } from "react-router-dom";

const UserOrderList = () => {
    const { user, loading } = useContext(UserContext);
    const [orders, setOrders] = useState([]);
    const [itemLoading, setItemLoading] = useState(true);

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
                setOrders(data.orders);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setItemLoading(false);
            }
        };

        fetchOrders();
    }, [user?.userId]);
    console.log(orders);

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return <ClockIcon className="h-5 w-5 text-yellow-500" />;
            case 'accepted':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'out_for_delivery':
                return <TruckIcon className="h-5 w-5 text-orange-500" />;
            case 'delivered':
                return <TruckIcon className="h-5 w-5 text-green-500" />;
            case 'completed':
                return <ClipboardDocumentCheckIcon className="h-5 w-5 text-teal-500" />;
            case 'cancelled':
                return <XCircleIcon className="h-5 w-5 text-red-500" />;
            default:
                return <ArrowPathIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    if (loading || itemLoading) return <Spinner />;

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50/90 to-white py-12">
            <div className="container mx-auto px-4 max-w-7xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                    Your Orders
                </h2>

                {orders.length === 0 ? (
                    <div className="text-center py-16">
                        <h3 className="text-2xl font-semibold text-gray-600 mb-4">No orders found</h3>
                        <p className="text-gray-500">Your order history will appear here</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {orders.map(order => (
                            <Link to={`/detailed-order/${order._id}`}>
                                <div 
                                    key={order._id}
                                    className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="p-6 space-y-6">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Invoice ID</p>
                                                <h3 className="text-lg font-semibold text-gray-900">{order.invoiceId}</h3>
                                            </div>
                                            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl">
                                                {getStatusIcon(order.orderStatus)}
                                                <span className="text-sm font-medium text-gray-700">
                                                    {order.orderStatus}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="border-t border-orange-100 pt-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h4>
                                            <div className="grid gap-4">
                                                {order.orderItems.map(item => (
                                                    <div 
                                                        key={item._id}
                                                        className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-orange-50/50 rounded-xl space-y-2 md:space-y-0"
                                                    >
                                                        <div className="flex-1">
                                                            <span className="font-medium text-gray-700">{item.itemName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-6">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-gray-500">Qty:</span>
                                                                <span className="px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-700">{item.itemQuantity}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-gray-500">Price:</span>
                                                                <span className="px-3 py-1 bg-white rounded-lg text-sm font-medium text-orange-600">
                                                                    ${(item.itemPrice * item.itemQuantity).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t border-orange-100 pt-6">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Delivery Fee</span>
                                                    <span className="font-medium text-gray-900">${order.deliveryFee.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-900 font-semibold">Total Amount</span>
                                                    <span className="text-lg font-bold text-orange-600">${order.totalAmount.toFixed(2)}</span>
                                                </div>
                                            </div>
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