import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;

if (!ORDER_SERVICE_URL) {
  throw new Error('ORDER_SERVICE_URL is not defined in .env');
}

interface OrderItem {
  itemName: string;
  itemQuantity: number;
}

export interface Order {
  _id: string;
  invoiceId: string;
  restaurantId: string;
  userName: string;
  userPhone: string;
  orderStatus: string;
  totalAmount: number;
  orderDate: string;
  orderItems: OrderItem[];
  roadDistance: number;
  deliveryFee: number;
  orderLocation: number[];
}

interface OrdersResponse {
  message: string;
  orders: Order[];
}

// ✅ Fetch orders by restaurant
export const getOrdersByRestaurantId = async (restaurantId: string, token: string): Promise<Order[] | null> => {
  try {
    const response = await axios.get<OrdersResponse>(
      `${ORDER_SERVICE_URL}/order/getOrdersByRestaurantId/${restaurantId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return null;
  }
};

// ✅ Update order status
export const updateOrderStatus = async (orderId: string, orderStatus: string, token: string): Promise<boolean> => {
  try {
    await axios.put(`${ORDER_SERVICE_URL}/order/updateOrderStatus/${orderId}`, 
      { orderStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return true;
  } catch (error) {
    console.error('Error updating order:', error);
    return false;
  }
};

// ✅ Delete order
export const deleteOrder = async (orderId: string, token: string): Promise<boolean> => {
  try {
    await axios.delete(`${ORDER_SERVICE_URL}/order/deleteOrder/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  } catch (error) {
    console.error('Error deleting order:', error);
    return false;
  }
};
