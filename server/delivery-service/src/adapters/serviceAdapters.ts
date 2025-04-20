import axios from 'axios';
import jwt from 'jsonwebtoken';
import { IOrderResponse, IRestaurantResponse, IUserResponse, IJwtPayload } from '../interfaces/services';

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
    this.baseUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5000/api';
  }

  async getUserById(userId: string): Promise<IUserResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new ServiceError('UserService',
        error.response?.data?.message || 'Failed to fetch user details',
        error.response?.status || 500
      );
    }
  }

  async getActiveDrivers(): Promise<IUserResponse[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/users`, {
        params: { role: 'deliveryAgent', isAvailable: true }
      });
      return response.data;
    } catch (error: any) {
      throw new ServiceError('UserService',
        error.response?.data?.message || 'Failed to fetch active drivers',
        error.response?.status || 500
      );
    }
  }
}

export class AuthServiceAdapter {
  private readonly jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || '';
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
  }

  verifyToken(token: string): IJwtPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as IJwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ServiceError('AuthService', 'Token has expired', 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ServiceError('AuthService', 'Invalid token', 401);
      }
      throw new ServiceError('AuthService', 'Token verification failed', 401);
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
      
      if (!response.data || !response.data.order) {
        throw new ServiceError('OrderService', 'Invalid order response', 404);
      }

      return response.data;
    } catch (error: any) {
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
    this.baseUrl = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:5002/api';
  }

  async getRestaurantById(restaurantId: string): Promise<IRestaurantResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/restaurants/${restaurantId}`);
      
      if (!response.data || !response.data.restaurant) {
        throw new ServiceError('RestaurantService', 'Invalid restaurant response', 404);
      }

      return response.data;
    } catch (error: any) {
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