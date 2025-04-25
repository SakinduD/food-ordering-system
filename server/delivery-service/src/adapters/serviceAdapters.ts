import axios from 'axios';
import { IOrderResponse, IRestaurantResponse, IUserResponse } from '../interfaces/services';

export class ServiceError extends Error {
  constructor(
    public service: string,
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export class UserServiceAdapter {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5010/api';
  }

  async getUserById(userId: string, token?: string): Promise<IUserResponse> {
    try {
      if (!token) {
        throw new ServiceError('UserService', 'Authentication failed: No token provided', 401);
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${this.baseUrl}/users/${userId}`, config);
      return response.data;
    } catch (error: any) {
      throw new ServiceError('UserService',
        error.response?.data?.message || 'Failed to fetch user details',
        error.response?.status || 500
      );
    }
  }

  async getActiveDrivers(token?: string): Promise<IUserResponse[]> {
    try {
      if (!token) {
        throw new ServiceError('UserService', 'Authentication failed: No token provided', 401);
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${this.baseUrl}/users`, {
        ...config,
        params: { role: 'deliveryAgent' }
      });
      
      // Filter active drivers from the response
      const drivers = Array.isArray(response.data) ? 
        response.data.filter((user: any) => user.role === 'deliveryAgent' && user.isAvailable) : 
        [];

      return drivers.map(user => ({ user }));
    } catch (error: any) {
      throw new ServiceError('UserService',
        error.response?.data?.message || 'Failed to fetch active drivers',
        error.response?.status || 500
      );
    }
  }
}

export class OrderServiceAdapter {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.ORDER_SERVICE_URL || 'http://localhost:5001/api/order';
  }

  async getOrderById(orderId: string): Promise<IOrderResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/getOrderById/${orderId}`);
      
      if (!response.data || !response.data.order) {
        throw new ServiceError('OrderService', 'Invalid order response', 404);
      }

      return response.data;
    } catch (error: any) {
      console.error('Order Service Error:', error.response?.data || error.message);
      if (axios.isAxiosError(error)) {
        throw new ServiceError(
          'OrderService',
          error.response?.data?.message || 'Failed to fetch order details',
          error.response?.status || 500
        );
      }
      throw error;
    }
  }
}

export class RestaurantServiceAdapter {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:5000/api/restaurants';
  }

  async getRestaurantById(restaurantId: string): Promise<IRestaurantResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/${restaurantId}`);
      
      if (!response.data || !response.data.data) {
        throw new ServiceError('RestaurantService', 'Invalid restaurant response', 404);
      }

      return response.data;
    } catch (error: any) {
      console.error('Restaurant Service Error:', error.response?.data || error.message);
      if (axios.isAxiosError(error)) {
        throw new ServiceError(
          'RestaurantService',
          error.response?.data?.message || 'Failed to fetch restaurant details',
          error.response?.status || 500
        );
      }
      throw error;
    }
  }
}