import axios from 'axios';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import toast from "react-hot-toast";
import { totalPrice } from '../reducers/cartReducer';

const handleCheckout = async (formData, location, cart, dispatch, userId, user) => {

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

                const response = await axios.get('http://localhost:5008/api/payment', {
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

                            const data = await response.json();

                            if(!response.ok) {
                                const errorData = await response.json();
                                toast.error("Order Failed "+errorData.message || 'Failed to place order');
                                return;
                            }
                    
                            if (response.ok) {
                                try {
                                    await axios.post('http://localhost:5020/api/email/orderConfirmationEmail', 
                                        {
                                            orderId: data.orderId,
                                            user: user
                                        },
                                        {
                                            headers: {
                                                Authorization: `Bearer ${token}`
                                            }
                                        }
                                    );
                                    console.log("Email sent successfully");
                                } catch (error) {
                                    console.error("Error sending email:", error);
                                }

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
                                setTimeout(() => {
                                    window.location.href = 'http://localhost:3000/detailed-order/' + data.orderId;
                                }, 500);
                    
                            } else {
                                toast.error('Failed to place order');
                            }

                        } catch (err) {
                            toast.error("Failed to place the order." + err.message);
                            console.log("Error:", err.message);
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

export default handleCheckout;