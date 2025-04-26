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

export interface RestaurantServiceInterface {
    getAllRestaurants(): Promise<IRestaurant[]>;
    getRestaurantById(restaurantId: string): Promise<IRestaurant | null>;
}

export class RestaurantService implements RestaurantServiceInterface {
    private baseUrl: string;

    constructor() {
        const serviceUrl = process.env.RESTAURANT_SERVICE_URL;

        if (!serviceUrl) {
            throw new Error('RESTAURANT_SERVICE_URL is not defined in .env file');
        }

        this.baseUrl = serviceUrl;
    }

    async getAllRestaurants(): Promise<IRestaurant[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/api/restaurants`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            return [];
        }
    }

    async getRestaurantById(restaurantId: string): Promise<IRestaurant | null> {
        try {
            const response = await axios.get(`${this.baseUrl}/api/restaurants/${restaurantId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching restaurant:', error);
            return null;
        }
    }
}