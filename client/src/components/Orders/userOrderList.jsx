import { useEffect, useState } from "react";
import { UserContext } from "../../context/userContext";
import { useContext } from "react";
import axios from "axios";

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
                console.log(user);
                setOrders(data.orders);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setItemLoading(false);
            }
        };

        fetchOrders();
    }, [user?.userId]);

    if (loading || itemLoading) return <div>Loading...</div>;

    return (
        <div className="user-order-list">
            <h2>Your Orders</h2>
            <h2></h2>
            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <ul>
                    {orders.map(order => (
                        <li key={order._id}>
                            <h3>Invoice ID: {order.invoiceId}</h3>
                            <p>Status: {order.orderStatus}</p>
                            <p>Items:</p>
                            <ul>
                                {order.orderItems.map(item => (
                                    <li key={item._id}>
                                        {item.itemName} - Quantity: {item.itemQuantity}
                                    </li>
                                ))}
                            </ul>
                            <p>Delivery Fee : ${order.deliveryFee}</p>
                            <p>Total Amount (With Delivery Fee): ${order.totalAmount}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default UserOrderList;