import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import { getRestaurantById } from "../services/restrauntService";

const deliveryDistance = async (
    customerLat: number, customerLon: number, restaurantId: String
): Promise<number> => {
    try{
        //find the restaurant
        const restaurant = await getRestaurantById(restaurantId);
        if (!restaurant) {
            throw new Error('Restaurant not found');
        }

        // Get restaurant location
        const shopLon: number = restaurant.location.coordinates[0];
        const shopLat: number = restaurant.location.coordinates[1];
        
        // Google Distance Matrix API URL
        const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
        const googleUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=
                        ${customerLat},${customerLon}&destinations=${shopLat},${shopLon}&key=${googleApiKey}`;
        
        // Get road distance from Google API
        const googleResponse = await axios.get(googleUrl);

        const roadDistanceString: string = googleResponse.data.rows[0].elements[0].distance.text;
        const roadDistance: number = parseFloat(roadDistanceString.replace(/[^0-9.]/g, ''));

        return roadDistance;
    } catch (error) {
        console.error('Error fetching distance:', error);
        throw new Error('Failed to fetch distance');
    }
}

export default deliveryDistance;