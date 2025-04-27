import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Ensure environment variable exists
const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL;

if (!RESTAURANT_SERVICE_URL) {
  throw new Error('RESTAURANT_SERVICE_URL is not defined in .env');
}

// ✅ Define restaurant type
export interface Restaurant {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  available: boolean;
  userId: string;
  category?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  createdAt?: string;
  updatedAt?: string;
}

// Service interface
export interface RestaurantService {
  getRestaurantById(restaurantId: string): Promise<Restaurant | null>;
  getRestaurantByUserId(userId: string): Promise<Restaurant | null>;
}

// Implementation of the service interface
export class RestaurantServiceImpl implements RestaurantService {
  private readonly baseUrl: string;
  
  constructor() {
    this.baseUrl = `${RESTAURANT_SERVICE_URL}/api/restaurants`;
  }

  async getRestaurantById(restaurantId: string): Promise<Restaurant | null> {
    try {
      const { data } = await axios.get<{ data: Restaurant }>(
        `${RESTAURANT_SERVICE_URL}/api/restaurants/${restaurantId}`
      );
      return data.data;
    } catch (error) {
      console.error(`❌ Error fetching restaurant by ID [${restaurantId}]:`, error);
      return null;
    }
  }

  async getRestaurantByUserId(userId: string): Promise<Restaurant | null> {
    try {
      const { data } = await axios.get<{ data: Restaurant }>(
        `${RESTAURANT_SERVICE_URL}/api/restaurants/user/${userId}`

      );
      return data.data;
    } catch (error) {
      console.error(`❌ Error fetching restaurant by User ID [${userId}]:`, error);
      return null;
    }
  }
}

