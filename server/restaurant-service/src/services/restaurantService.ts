import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL;

if (!RESTAURANT_SERVICE_URL) {
  throw new Error('RESTAURANT_SERVICE_URL is not defined in .env');
}

export const getRestaurantById = async (restaurantId: string) => {
  try {
    const response = await axios.get(`${RESTAURANT_SERVICE_URL}/api/restaurants/${restaurantId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return null;
  }
};
