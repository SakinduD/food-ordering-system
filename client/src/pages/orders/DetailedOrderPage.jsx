import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import { useContext } from "react";
import Spinner from "../../components/Spinner";
import { ClockIcon, PackageIcon, TruckIcon, CalendarIcon, MapPinIcon, CreditCardIcon, StoreIcon, UserIcon, Navigation } from "lucide-react";

const DetailedOrderPage = () => {
    const { orderId } = useParams();
    const [orderDetails, setOrderDetails] = useState(null);
    const [orderLoading, setOrderLoading] = useState(true);
    const [deliveryInfo, setDeliveryInfo] = useState(null);
    const { loading } = useContext(UserContext); 

    const fetchOrderDetails = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:5001/api/order/getOrderById/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setOrderDetails(response.data.order);
            console.log("order data",response.data);
            setOrderLoading(false);
            
            // Try to fetch delivery info if it exists
            fetchDeliveryInfo(response.data.order);
        } catch (error) {
            console.error("Error fetching order details:", error);
            setOrderLoading(false);
        }
    }
    
    const fetchDeliveryInfo = async (order) => {
        try {
            const token = localStorage.getItem("token");
            // This endpoint would return deliveries for a specific order
            const response = await axios.get(`http://localhost:5005/api/deliveries/by-order/${order._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data && response.data.length > 0) {
                setDeliveryInfo(response.data[0]);
            }
        } catch (error) {
            console.error("Error fetching delivery info:", error);
            // Not showing an error to user as delivery might not exist yet
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return <ClockIcon className="h-5 w-5 text-yellow-500" />;
            case 'processing':
            case 'accepted':
                return <PackageIcon className="h-5 w-5 text-blue-500" />;
            case 'delivered':
            case 'completed':
                return <TruckIcon className="h-5 w-5 text-green-500" />;
            case 'cancelled':
                return <ClockIcon className="h-5 w-5 text-red-500" />;
            default:
                return <ClockIcon className="h-5 w-5 text-gray-500" />;
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
            <div className="container mx-auto px-4 max-w-7xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                    Order Details
                </h2>
                
                {loading || orderLoading ? (
                    <Spinner />
                ) : !orderDetails ? (
                    <div className="text-center py-16">
                        <h3 className="text-2xl font-semibold text-gray-600 mb-4">No order details found</h3>
                        <p className="text-gray-500">The order you're looking for might have been removed or doesn't exist.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
                        <div className="p-6 space-y-6">
                            {/* Header Section */}
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Order ID</p>
                                    <h3 className="text-lg font-semibold text-gray-900">{orderDetails.invoiceId}</h3>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl">
                                    {getStatusIcon(orderDetails.orderStatus)}
                                    <span className="text-sm font-medium text-gray-700">
                                        {orderDetails.orderStatus}
                                    </span>
                                </div>
                            </div>

                            {/* Order Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-orange-100 pt-6">
                                {/* Restaurant Info */}
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                        <StoreIcon className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Restaurant</p>
                                        <p className="font-medium text-gray-900">{orderDetails.restaurantName}</p>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                        <UserIcon className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Orderd User</p>
                                        <p className="font-medium text-gray-900">{orderDetails.userName}</p>
                                    </div>
                                </div>

                                {/* Order Date */}
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                        <CalendarIcon className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Order Date</p>
                                        <p className="font-medium text-gray-900">{formatDate(orderDetails.createdAt)}</p>
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                        <MapPinIcon className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Delivery Address</p>
                                        <p className="font-medium text-gray-900">{orderDetails.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="border-t border-orange-100 pt-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h4>
                                <div className="grid gap-4">
                                    {orderDetails.orderItems.map(item => (
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
                                                    <span className="px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-700">
                                                        {item.itemQuantity}
                                                    </span>
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

                            {/* Order Summary */}
                            <div className="border-t border-orange-100 pt-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium text-gray-900">
                                            ${(orderDetails.totalAmount - orderDetails.deliveryFee).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Delivery Fee</span>
                                        <span className="font-medium text-gray-900">
                                            ${orderDetails.deliveryFee?.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-orange-100">
                                        <span className="text-lg font-semibold text-gray-900">Total</span>
                                        <div className="flex items-center gap-2">
                                            <CreditCardIcon className="h-5 w-5 text-orange-500" />
                                            <span className="text-lg font-bold text-orange-600">
                                                ${orderDetails.totalAmount?.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Delivery Tracking Section - Only show if delivery exists */}
                            {deliveryInfo && (
                                <div className="border-t border-orange-100 pt-6 mt-6">
                                    <div className="flex flex-wrap items-center justify-between mb-4">
                                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <TruckIcon className="h-5 w-5 text-orange-500" />
                                            Delivery Status
                                        </h4>
                                        <span className="px-3 py-1 bg-blue-50 rounded-lg text-sm font-medium text-blue-600">
                                            {deliveryInfo.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    
                                    <Link 
                                        to={`/delivery-tracking/${deliveryInfo._id}`}
                                        className="flex items-center justify-center gap-2 px-6 py-3 mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all duration-300"
                                    >
                                        <Navigation className="h-5 w-5" />
                                        Track Delivery Live
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailedOrderPage;