import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import { useContext } from "react";
import Spinner from "../../components/Spinner";
import { CalendarIcon, MapPinIcon, CreditCardIcon, StoreIcon, UserIcon, Navigation } from "lucide-react";
import { ClockIcon, TruckIcon, CheckCircleIcon, XCircleIcon, ClipboardCheck, RefreshCw } from "lucide-react";
import GoogleDeliveryMap from "../../components/Delivery/GoogleDeliveryMap";

const DetailedOrderPage = () => {
    const { orderId } = useParams();
    const [orderDetails, setOrderDetails] = useState(null);
    const [orderLoading, setOrderLoading] = useState(true);
    const [deliveryInfo, setDeliveryInfo] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);
    const [refreshingLocation, setRefreshingLocation] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [locationInterval, setLocationInterval] = useState(null);
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
            
            fetchDeliveryInfo(response.data.order);
        } catch (error) {
            console.error("Error fetching order details:", error);
            setOrderLoading(false);
        }
    }
    
    const fetchDeliveryInfo = async (order) => {
        try {
            const token = localStorage.getItem("token");
            // Use the new endpoint to get delivery by order ID
            const response = await axios.get(`http://localhost:5005/api/deliveries/by-order/${order._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            console.log('Delivery response:', response.data);
            
            if (response.data) {
                const delivery = response.data;
                setDeliveryInfo(delivery);
                
                // Normalize status for consistent checks
                const normalizedStatus = delivery.status?.toLowerCase().replace(/ /g, '_');
                
                console.log('Delivery status:', delivery.status, 'Normalized:', normalizedStatus);
                
                // If delivery is in progress (out for delivery or driver assigned), fetch driver location
                const trackableStatuses = ['driver_assigned', 'out_for_delivery', 'on_the_way', 'picked_up'];
                if (delivery && trackableStatuses.includes(normalizedStatus)) {
                    console.log('Starting location tracking for delivery:', delivery._id);
                    fetchDriverLocation(delivery._id);
                    setShowMap(true);
                    
                    // Clear any existing interval before setting a new one
                    if (locationInterval) {
                        clearInterval(locationInterval);
                    }
                    
                    // Start polling for driver location updates every 10 seconds
                    const intervalId = setInterval(() => {
                        fetchDriverLocation(delivery._id);
                    }, 10000); // 10 seconds interval
                    
                    setLocationInterval(intervalId);
                } else {
                    console.log('Delivery status not trackable:', normalizedStatus);
                    setShowMap(false);
                    
                    // Clear interval if exists
                    if (locationInterval) {
                        clearInterval(locationInterval);
                        setLocationInterval(null);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching delivery info:", error);
            // Not showing an error to user as delivery might not exist yet
        }
    };
    
    const fetchDriverLocation = async (deliveryId) => {
        try {
            setRefreshingLocation(true);
            const token = localStorage.getItem("token");
            
            // Fetch driver location directly from the delivery service
            const response = await axios.get(`http://localhost:5005/api/deliveries/${deliveryId}/location`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('Driver location from delivery service:', response.data);
            
            if (response.data && response.data.currentLocation) {
                const { coordinates } = response.data.currentLocation;
                setDriverLocation({
                    longitude: coordinates[0],
                    latitude: coordinates[1]
                });
            } else {
                console.log('No driver location data available yet');
            }
        } catch (error) {
            console.error("Error fetching driver location:", error);
        } finally {
            setRefreshingLocation(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
        
        // Cleanup interval on unmount
        return () => {
            if (locationInterval) {
                clearInterval(locationInterval);
            }
        };
    }, [orderId]);

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
                return <ClipboardCheck className="h-5 w-5 text-teal-500" />;
            case 'cancelled':
                return <XCircleIcon className="h-5 w-5 text-red-500" />;
            default:
                return <RefreshCw className="h-5 w-5 text-gray-500" />;
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
                                                        LKR {(item.itemPrice * item.itemQuantity).toFixed(2)}
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
                                            LKR {(orderDetails.totalAmount - orderDetails.deliveryFee).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Delivery Fee</span>
                                        <span className="font-medium text-gray-900">
                                            LKR {orderDetails.deliveryFee?.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-orange-100">
                                        <span className="text-lg font-semibold text-gray-900">Total</span>
                                        <div className="flex items-center gap-2">
                                            <CreditCardIcon className="h-5 w-5 text-orange-500" />
                                            <span className="text-lg font-bold text-orange-600">
                                                LKR {orderDetails.totalAmount?.toFixed(2)}
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
                                            <TruckIcon className="h-5 w-5 text-orange-300" />
                                            Delivery Status
                                        </h4>
                                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                            deliveryInfo.status.toLowerCase().includes('delivered') 
                                            ? 'bg-green-50 text-green-600'
                                            : 'bg-blue-50 text-red-600'
                                        }`}>
                                            {deliveryInfo.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    {/* Live Tracking Map - Only show if delivery is in progress */}
                                    {showMap && (
                                        <div className="mt-4">
                                            <div className="bg-gray-50 rounded-xl p-4 border border-orange-100">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h5 className="font-medium text-gray-900">Live Delivery Tracking</h5>
                                                    <div className="flex items-center gap-1">
                                                        <span className={`h-2 w-2 rounded-full ${refreshingLocation ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></span>
                                                        <span className="text-xs text-gray-500">
                                                            {refreshingLocation ? 'Updating location...' : 'Live'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200">
                                                    <GoogleDeliveryMap
                                                        apiKey="AIzaSyA-e1QNF2Q4yjhTieqegIgQWr51yUpIxms"
                                                        deliveryId={deliveryInfo._id}
                                                        driverLocation={driverLocation ? {
                                                            latitude: driverLocation.latitude,
                                                            longitude: driverLocation.longitude
                                                        } : null}
                                                        restaurantLocation={deliveryInfo.restaurantLocation ? {
                                                            latitude: deliveryInfo.restaurantLocation.coordinates[1],
                                                            longitude: deliveryInfo.restaurantLocation.coordinates[0]
                                                        } : null}
                                                        customerLocation={deliveryInfo.customerLocation ? {
                                                            latitude: deliveryInfo.customerLocation.coordinates[1],
                                                            longitude: deliveryInfo.customerLocation.coordinates[0]
                                                        } : null}
                                                    />
                                                </div>
                                                
                                                <div className="mt-4 flex flex-wrap gap-3 justify-center">
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg shadow-sm">
                                                        <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                                                        <span className="text-xs text-gray-700">Restaurant</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg shadow-sm">
                                                        <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                                                        <span className="text-xs text-gray-700">Delivery Agent</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg shadow-sm">
                                                        <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                                                        <span className="text-xs text-gray-700">Your Location</span>
                                                    </div>
                                                </div>
                                                
                                                <button 
                                                    onClick={() => fetchDriverLocation(deliveryInfo._id)}
                                                    disabled={refreshingLocation}
                                                    className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                                                >
                                                    {refreshingLocation ? (
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <RefreshCw className="h-4 w-4" />
                                                    )}
                                                    <span>Refresh Location</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                        
                                </div>
                            )}

                            {/* Live Tracking Button - Shows even when map isn't visible yet */}
                            {deliveryInfo && ['pending', 'accepted', 'driver_assigned', 'out_for_delivery', 'on_the_way'].includes(deliveryInfo.status?.toLowerCase().replace(/ /g, '_')) && (
                                <div className="mt-6">
                                    
                                    <p className="text-center text-sm text-gray-500 mt-2">
                                        {['out_for_delivery', 'on_the_way'].includes(deliveryInfo.status?.toLowerCase().replace(/ /g, '_')) 
                                            ? "Your order is on the way! Track the delivery agent's location in real-time."
                                            : "Track your order status and get updates in real-time."}
                                    </p>
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