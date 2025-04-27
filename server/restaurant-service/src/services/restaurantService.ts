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

// ✅ Get restaurant by ID (correct and clean)
export const getRestaurantById = async (
  restaurantId: string
): Promise<Restaurant | null> => {
  try {
    const { data } = await axios.get<{ data: Restaurant }>(
      `${RESTAURANT_SERVICE_URL}/api/restaurants/${restaurantId}`
    );

    return data.data;
  } catch (error) {
    console.error(`❌ Error fetching restaurant by ID [${restaurantId}]:`, error);
    return null;
  }
};
