import axios from 'axios';
import { Document } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export interface IRestaurant extends Document {
    name: string;
    address?: string;
    phone?: string;
    available: boolean;
    userId: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
  }

const RESTRAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL;

if (!RESTRAURANT_SERVICE_URL) {
    throw new Error('RESTAURANT_SERVICE_URL is not defined in .env file');
}

export const getAllRestaurants = async (): Promise<IRestaurant[]> => {
    try {
        const response = await axios.get(`${RESTRAURANT_SERVICE_URL}/api/restaurants`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        return [];
    }
}

export const getRestaurantById = async (restaurantId: String): Promise<IRestaurant | null> => {
    try {
        const response = await axios.get(`${RESTRAURANT_SERVICE_URL}/api/restaurants/${restaurantId}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        return null;
    }
};