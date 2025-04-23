import React, { useEffect, useState } from 'react';
import { UserContext } from '../../context/userContext';
import { useContext } from 'react';
import { totalItems } from '../../reducers/cartReducer';
import { totalPrice } from '../../reducers/cartReducer';
import { loadCartFromLocalStorage } from '../../reducers/cartReducer';
import 'sweetalert2/dist/sweetalert2.min.css';
import { Toaster } from "react-hot-toast";
import axios from 'axios';
import LocationPicker from './LocationPicker';
import handleCheckout from '../../handlers/checkOutHandler';

const Cart = () => {
    const { cart, dispatch, user, loading } = useContext(UserContext);
    const [deliveryFee, setDeliveryFee] = useState(null);
    const userId = user?.userId;
    const [location, setLocation] = useState({
        latitude: null,
        longitude: null,
    });
    const [showMap, setShowMap] = useState(false);

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
            amount: totalPrice(cart),
        }));
    }, [cart]);

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
                savedCart.forEach(item => {
                    dispatch({
                        type: 'Add',
                        item,
                        userId,
                    });
                });
            }
        }
    }, [userId, cart.length, dispatch]);

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

            const response = await axios.post("http://localhost:5008/api/payment/createPayment", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (response.status === 200) {
                handleCheckout(formData, location, cart, dispatch, userId);
            } else {
                console.error("Payment gateway is not available.");
            }

        } catch (err) {
            console.error("Failed to create payment:", err);
        } 
    };

    if (loading) {
        return <div>Loading user data...</div>;
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
        <div>
            <Toaster />

            <div>
                
                <div className="flex flex-wrap gap-6 p-4">
                    {cart.map((item) => (
                        <div 
                            className="flex flex-col items-center bg-white shadow-md rounded-lg p-4 w-64" 
                            key={item._id}
                        >
                            <img 
                                src={`http://localhost:5000${item.imageUrl}`}
                                alt={item.itemName || "Item Image"} 
                                className="w-24 h-24 object-cover mb-4 rounded-md"
                            />
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h4>
                            <h4 className="text-gray-600 text-sm mb-4">${item.price}</h4>
                            <div className="flex items-center gap-2 mb-4">
                                <button className="bg-red-500 text-white rounded px-3 py-1 hover:bg-red-600"
                                    onClick={() => {Decrease(item._id)}}
                                >
                                    -
                                </button>
                                <h4 className="text-lg font-semibold">{item.cartUsage}</h4>
                                <button className="bg-blue-500 text-white rounded px-3 py-1 hover:bg-blue-600"
                                    onClick={() => {Increase(item._id)}
                                }>
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
                                className="bg-red-500 text-white w-full py-2 rounded hover:bg-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <div>
                        <form onSubmit={handleSubmit}> 
                            <div>
                                <label>First Name :</label>
                                <input type="text" 
                                    name='firstName'
                                    value={formData.firstName}
                                    onChange={handleChange}
                                required/>
                            </div>

                            <div>
                                <label>Last Name :</label>
                                <input type="text" 
                                    name='lastName'
                                    value={formData.lastName}
                                    onChange={handleChange}
                                required/>
                            </div>

                            <div>
                                <label>email : {user?.email} </label>
                            </div>

                            <div>
                                <label>Phone Number : </label>
                                <input type="text" 
                                    name='phone'
                                    value={formData.phone}
                                    onChange={handleChange}
                                required/>
                            </div>

                            <div>
                                <label>Delivery Address : </label>
                                <input type="text" 
                                    name='address'
                                    value={formData.address}
                                    onChange={handleChange}
                                required/>
                            </div>

                            <div>
                                <button
                                    type="button"
                                    className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mb-4"
                                    onClick={() => setShowMap(true)}
                                    >
                                    Select Delivery Location
                                </button>

                                <LocationPicker
                                    isOpen={showMap}
                                    onClose={() => setShowMap(false)}
                                    onLocationSelect={handleLocationSelect}
                                />

                            </div>

                            <div>
                                <label>comments : </label>
                                <textarea 
                                    name='comments'
                                    value={formData.comments}
                                    onChange={handleChange}
                                />
                            </div>

                            <h5>Total Items:{totalItems(cart)}</h5>
                            <h5>Delivery Fee: {deliveryFee ? deliveryFee : 0}</h5>
                            <h5>Total Price (including delivery): {totalPrice(cart) + (deliveryFee || 0)}</h5>

                            <button 
                                type='submit' 
                                disabled={cart.length === 0}
                                className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600">
                                    Checkout
                            </button>
                            
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;