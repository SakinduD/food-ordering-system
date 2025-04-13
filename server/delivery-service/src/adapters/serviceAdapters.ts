import axios from 'axios';
import { IOrderResponse, IRestaurantResponse, IAuthUser } from '../interfaces/services';
import jwt from 'jsonwebtoken';

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

export class AuthServiceAdapter {
  private readonly baseUrl: string;
  private readonly jwtSecret: string;

  constructor() {
    this.baseUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5000/api';
    this.jwtSecret = process.env.JWT_SECRET || '';
  }

  async verifyToken(token: string): Promise<IAuthUser> {
    try {
      // Since we're using the same JWT_SECRET as auth service, we can verify locally
      const decoded = jwt.verify(token, this.jwtSecret) as IAuthUser;
      return decoded;
    } catch (error) {
      throw new ServiceError(
        'AuthService',
        'Invalid or expired token',
        401
      );
    }
  }
}

export class OrderServiceAdapter {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.ORDER_SERVICE_URL || 'http://localhost:5001/api';
  }

  async getOrderById(orderId: string): Promise<IOrderResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      throw new ServiceError('OrderService', 
        error.response?.data?.message || 'Failed to fetch order details',
        error.response?.status || 500
      );
    }
  }
}

export class RestaurantServiceAdapter {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:5002/api';
  }

  async getRestaurantById(restaurantId: string): Promise<IRestaurantResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/restaurants/${restaurantId}`);
      return response.data;
    } catch (error: any) {
      throw new ServiceError('RestaurantService',
        error.response?.data?.message || 'Failed to fetch restaurant details',
        error.response?.status || 500
      );
    }
  }
}