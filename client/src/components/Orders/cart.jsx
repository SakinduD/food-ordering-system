import React, { useEffect, useState } from 'react';
import { UserContext } from '../../context/userContext';
import { useContext } from 'react';
import { totalItems } from '../../reducers/cartReducer';
import { totalPrice } from '../../reducers/cartReducer';
import { loadCartFromLocalStorage } from '../../reducers/cartReducer';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import toast, { Toaster } from "react-hot-toast";
import axios from 'axios';
import LocationPicker from './LocationPicker';

const Cart = () => {
    const { cart, dispatch, user } = useContext(UserContext);
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
        if(cart[index].cartUsage < cart[index].itemStock) {
            dispatch({
                type: 'Increase',
                payload: id,
                userId,
            });
        }

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

    const handleCheckout = async () => {
        try {
            console.log('Form Data:', formData);
            Swal.fire({
                title: "Are you sure you want to place the order?",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, place it!"
              }).then(async (result) => {
                if(result.isConfirmed) {
                    const token = localStorage.getItem("token");

                    const response = await axios.get('http://localhost:5008/payment', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                    });
                    
                    const responseData = response.data;

                    if (response.status === 200) {
                        const payment = {
                            sandbox: true,
                            merchant_id: responseData.merchantId,
                            return_url: responseData.return_url,
                            cancel_url: responseData.cancel_url,
                            notify_url: responseData.notify_url,
                            first_name: responseData.first_name,
                            last_name: responseData.last_name,
                            email: responseData.email,
                            phone: responseData.phone,
                            address: responseData.address,
                            city: responseData.city,
                            country: responseData.country,
                            order_id: responseData.orderId,
                            items: responseData.items,
                            amount: formData.amount,
                            currency: responseData.currency,
                            hash: responseData.hash,
                        };
            
                        window.payhere.onCompleted = async function (OrderID) {

                            try {
                                const token = localStorage.getItem("token");

                                const response = await fetch('http://localhost:5001/api/order/placeOrder', {
                                    method: 'POST',
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                        customerLat: location.latitude,
                                        customerLon: location.longitude,
                                        address: formData.address,
                                        userName: user?.name,
                                        email: user?.email,
                                        userPhone : formData.phone,
                                        comments: formData.comments,
                                        orderItems: cart.map((item) => ({
                                            itemName: item.itemName,
                                            itemQuantity: item.cartUsage,
                                        })),
                                        foodTotalPrice: totalPrice(cart),
                                    }),
                                });
                        
                                if (response.ok) {
                                    Swal.fire({
                                        position: "center",
                                        icon: "success",
                                        title: "Order Placed Successfully!!",
                                        showConfirmButton: false,
                                        timer: 1500
                                    });
                        
                                    dispatch({
                                        type: 'Clear',
                                        userId,
                                    });
                        
                                } else {
                                    toast.error('Failed to place order');
                                }

                            } catch (err) {
                                toast.error("Failed to place the order." + err.message);
                            }

                        };
            
                        window.payhere.onDismissed = function () {
                            console.log("Payment dismissed");

                        };
            
                        window.payhere.onError = function (error) {
                            toast.error("Error occurred. " + error);
                            console.log("Error: " + error);

                            setTimeout(() => {
                                window.location.href = '/cart';
                            }, 2000);
                        };
            
                        window.payhere.startPayment(payment);
                        
                        
                    } else {
                        console.error("Failed to generate hash for payment.");
                    }
                    
                }
                    
            });
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to place order');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const response = await axios.post("http://localhost:5008/api/payment/createPayment", {
                formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (response.status === 200) {
                handleCheckout();
            } else {
                console.error("Payment gateway is not available.");
            }

        } catch (err) {
            console.error("Failed to create payment:", err);
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
                                src={`http://localhost:3000/PCItemImages/${item.itemImage}`} 
                                alt={item.itemName || "Item Image"} 
                                className="w-24 h-24 object-cover mb-4 rounded-md"
                            />
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">{item.itemName}</h4>
                            <h4 className="text-gray-600 text-sm mb-4">${item.itemPrice}</h4>
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
                                    onLocationSelect={(loc) =>
                                        setLocation({ latitude: loc.lat, longitude: loc.lng })
                                    }
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
                            <h5>Total Price:{totalPrice(cart)}</h5>
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