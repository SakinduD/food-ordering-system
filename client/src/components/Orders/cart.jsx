import React, { useEffect, useState } from 'react';
import { UserContext } from '../../context/userContext';
import { useContext } from 'react';
import { totalItems } from '../../reducers/cartReducer';
import { totalPrice } from '../../reducers/cartReducer';
import { loadCartFromLocalStorage } from '../../reducers/cartReducer';
import 'sweetalert2/dist/sweetalert2.min.css';
import toast, { Toaster } from "react-hot-toast";
import axios from 'axios';
import LocationPicker from './LocationPicker';
import handleCheckout from '../../handlers/checkOutHandler';
import { MapPin } from 'lucide-react';
import Spinner from '../Spinner';

const Cart = () => {
    const { cart, dispatch, user, loading } = useContext(UserContext);
    const [deliveryFee, setDeliveryFee] = useState(null);
    const userId = user?.userId;
    const [location, setLocation] = useState({
        latitude: null,
        longitude: null,
    });
    const [showMap, setShowMap] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: user?.email || "",
        phone: "",
        address: "",
        city: "",
        amount: "",
        currency: "LKR",
        comments: '',
        userId: userId,
    });

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            amount: totalPrice(cart)+deliveryFee,
        }));
    }, [cart, deliveryFee]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    useEffect(() => {
        if (user && user.userId) {
            setFormData(prev => ({
                ...prev,
                userId: user.userId,
                email: user.email || "",
            }));
        }
    }, [user]);

    useEffect(() => {
        if (userId && cart.length === 0) {
            const savedCart = loadCartFromLocalStorage(userId);
            if (savedCart.length > 0) {
                dispatch({
                    type: 'Init',
                    payload: savedCart,
                });
            }
        }
    }, [userId]);

    const Increase = (id) => {
        const index = cart.findIndex((item) => item._id === id);
        if (index === -1) return;
        
        dispatch({
            type: 'Increase',
            payload: id,
            userId,
        });
        
    };

    const Decrease = (id) => {
        const index = cart.findIndex((item) => item._id === id);
        if (index === -1) return;
        if(cart[index].cartUsage > 1) {
            dispatch({
                type: 'Decrease',
                payload: id,
                userId,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const createOrder = await fetch('http://localhost:5001/api/order/placeOrder', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    customerLat: location.latitude,
                    customerLon: location.longitude,
                    address: formData.address,
                    userName: formData.firstName + " " + formData.lastName,
                    userPhone : formData.phone,
                    comments: formData.comments,
                    orderItems: cart.map((item) => ({
                        itemName: item.name,
                        itemPrice: item.price,
                        itemQuantity: item.cartUsage,
                        restaurantId: item.restaurantId,
                    })),
                    foodTotalPrice: totalPrice(cart),
                }),
            });

            const data = await createOrder.json();

            if (createOrder.status == 201) {
                const orderId = data.orderId;
                const deletedOrder = await axios.delete(`http://localhost:5001/api/order/deleteOrder/${orderId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (deletedOrder.status == 200) {
                    const response = await axios.post("http://localhost:5008/api/payment/createPayment", formData, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (response.status === 200) {
                        handleCheckout(formData, location, cart, dispatch, userId, user);
                    } else {
                        toast.error("Payment Gateway is not available.");
                        console.error("Payment Gateway is not available.");
                    }
                } else {
                    console.error("Failed to delete order");
                }

            } else {
                setError(data.message);
                console.error("Failed to place order");
            }

        } catch (err) {
            console.error("Failed to create payment:", err);
        } 
    };

    if (loading) {
        return (
            <div>
                <Spinner />
            </div>
        );
    }

    const handleLocationSelect = async (location) => {
        setLocation({ latitude: location.lat, longitude: location.lng });
        const fee = await fetchDeliveryFee(location.lat, location.lng);
        setDeliveryFee(fee);
    };

    const fetchDeliveryFee = async (latitude, longitude) => {
        try {
            const token = localStorage.getItem("token");
            console.log(token);

            const response = await axios.post("http://localhost:5001/api/deliveryFee",
                {
                  customerLat: latitude,
                  customerLon: longitude,
                  restaurantId: cart[0].restaurantId,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              
            return response.data.deliveryFee;
        } catch (error) {
            console.error("Error fetching delivery fee", error);
            return 0;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50/90 to-white py-12">
            <Toaster />
            <div className="container mx-auto px-4 max-w-7xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                    Your Cart
                </h2>

                {cart.length === 0 ? (
                    <div className="text-center py-16">
                        <h3 className="text-2xl font-semibold text-gray-600 mb-4">Your cart is empty</h3>
                        <p className="text-gray-500 mb-8">Add some delicious items to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {cart.map((item) => (
                                    <div 
                                        key={item._id}
                                        className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                                    >
                                        <img 
                                            src={`http://localhost:5025${item.imageUrl}`}
                                            alt={item.itemName || "Item Image"} 
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="p-6 space-y-4">
                                            <h4 className="text-xl font-semibold text-gray-800">{item.name}</h4>
                                            <p className="text-orange-500 font-semibold">LKR {item.price}</p>
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={() => Decrease(item._id)}
                                                        className="h-8 w-8 rounded-lg bg-orange-100 text-orange-500 flex items-center justify-center hover:bg-orange-200 transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-lg font-semibold text-gray-700">{item.cartUsage}</span>
                                                    <button 
                                                        onClick={() => Increase(item._id)}
                                                        className="h-8 w-8 rounded-lg bg-orange-100 text-orange-500 flex items-center justify-center hover:bg-orange-200 transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        dispatch({
                                                            type: 'Remove',
                                                            payload: item._id,
                                                            userId,
                                                        });
                                                    }}
                                                    className="text-red-500 hover:text-red-600 font-medium"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Checkout Form Section */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 sticky top-24">
                                <h3 className="text-xl font-semibold mb-6 text-orange-500 text-center">Place the order</h3>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                required
                                                className="w-full h-11 px-4 rounded-xl border border-orange-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Last Name</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                required
                                                className="w-full h-11 px-4 rounded-xl border border-orange-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="text"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            disabled
                                            className="w-full h-11 px-4 rounded-xl border border-orange-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-gray-100"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder='+94 7x xxx xxxx'
                                            pattern="^\+94[7][0-9]{8}$"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="w-full h-11 px-4 rounded-xl border border-orange-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Delivery Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                            className="w-full h-11 px-4 rounded-xl border border-orange-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowMap(true)}
                                        className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-orange-100 text-orange-600 font-semibold hover:bg-orange-200 transition-colors"
                                    >
                                        <MapPin className="h-5 w-5" />
                                        Select Delivery Location
                                    </button>

                                    <LocationPicker
                                        isOpen={showMap}
                                        onClose={() => setShowMap(false)}
                                        onLocationSelect={handleLocationSelect}
                                    />

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Special Instructions</label>
                                        <textarea
                                            name="comments"
                                            value={formData.comments}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none"
                                            placeholder="Any special requests?"
                                        />
                                    </div>

                                    <div className="border-t border-orange-100 pt-4 space-y-3">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Total Items:</span>
                                            <span>{totalItems(cart)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Delivery Fee:</span>
                                            <span>LKR {deliveryFee ? deliveryFee.toFixed(2) : '0.00'}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-semibold text-gray-800">
                                            <span>Total:</span>
                                            <span>LKR {(totalPrice(cart) + (deliveryFee || 0)).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                                            <p className="text-red-600 text-sm">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={cart.length === 0}
                                        className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 
                                            text-white font-semibold shadow-lg transition-all duration-200 
                                            hover:shadow-orange-500/30 hover:scale-[1.02] disabled:opacity-50 
                                            disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        Proceed to Checkout
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;