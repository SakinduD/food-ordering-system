import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../../context/userContext";
import Spinner from "../../components/Spinner";
import { Package, Eye, X, Clock, CheckCircle, AlertTriangle, Truck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminAllOrders = () => {
    const { loading } = useContext(UserContext);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5001/api/order/getAllOrders", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setOrders(response.data.orders);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Failed to fetch orders");
        } finally {
            setLoadingOrders(false);
        }   
    }

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-600" />;
            case 'processing':
                return <AlertTriangle className="h-5 w-5 text-blue-600" />;
            case 'delivered':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            default:
                return <Package className="h-5 w-5 text-gray-600" />;
        }
    };

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

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
    };

    if (loadingOrders || loading) return <Spinner />;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">Order Management</h1>
                    <p className="text-sm text-gray-600">View and manage all customer orders</p>
                </div>
                <div className="bg-orange-100 px-4 py-2 rounded-lg">
                    <span className="text-orange-800 font-medium">
                        Total Orders: {orders.length}
                    </span>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-md">
                    <Package className="h-12 w-12 text-orange-200 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
                    <p className="text-gray-500">There are no orders in the system yet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-xl shadow-md">
                    <table className="min-w-full">
                        <thead className="bg-orange-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Order ID</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Customer</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Restaurant</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Total Amount</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-orange-100">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-orange-50">
                                    <td className="px-6 py-4 text-sm text-gray-800">{order.invoiceId}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">{order.userName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">{order.restaurantName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">LKR {order.totalAmount.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-2 w-fit ${getStatusColor(order.orderStatus)}`}>
                                            {getStatusIcon(order.orderStatus)}
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleViewOrder(order)}
                                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View order details"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative shadow-xl">
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>

                        <h2 className="text-xl font-bold mb-6">Order Details</h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Order ID</p>
                                    <p className="font-medium">{selectedOrder.invoiceId}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.orderStatus)}`}>
                                        {getStatusIcon(selectedOrder.orderStatus)}
                                        {selectedOrder.orderStatus}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Customer</p>
                                    <p className="font-medium">{selectedOrder.userName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Restaurant</p>
                                    <p className="font-medium">{selectedOrder.restaurantName}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Order Items</h3>
                                <div className="bg-orange-50 rounded-lg p-4 space-y-2">
                                    {selectedOrder.orderItems?.map((item) => (
                                        <div key={item._id} className="flex justify-between items-center">
                                            <span className="font-medium">{item.itemName}</span>
                                            <div className="text-sm text-gray-600">
                                                <span>{item.itemQuantity}x</span>
                                                <span className="ml-4">Rs. {(item.itemPrice * item.itemQuantity).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="border-t border-orange-200 mt-4 pt-4 flex justify-between items-center font-semibold">
                                        <span>Total Amount</span>
                                        <span className="text-orange-600">Rs. {selectedOrder.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
                                <p className="font-medium">{selectedOrder.address}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminAllOrders;


