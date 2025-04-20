import { useEffect, useState } from "react";
import { UserContext } from "../../context/userContext";
import { useContext } from "react";
import axios from "axios";

const UserOrderList = () => {
    const { user } = useContext(UserContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    console.log("user", user);
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await axios.get('http://localhost:5001/api/orders/getOrdersByUserId', {
                    withCredentials: true,
                });
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user.userId]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="user-order-list">
            <h2>Your Orders</h2>
            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <ul>
                    {orders.map(order => (
                        <li key={order._id}>
                            <h3>Invoice ID: {order.invoiceId}</h3>
                            <p>Total Amount: ${order.totalAmount}</p>
                            <p>Status: {order.status}</p>
                            <p>Items:</p>
                            <ul>
                                {order.orderItems.map(item => (
                                    <li key={item._id}>
                                        {item.itemName} - Quantity: {item.itemQuantity}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default UserOrderList;