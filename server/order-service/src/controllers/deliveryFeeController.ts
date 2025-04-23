import { Request, Response, NextFunction } from 'express';
import deliveyDistance from '../utils/deliveryDistance';
import deliveryFee from '../utils/deliveryFee';


const deliveryFeeCalc = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const {customerLat, customerLon, restaurantId} = req.body;

        const roadDistance: number = await deliveyDistance(customerLat, customerLon, restaurantId);
        
        //calculate the delivery fee based on the road distance
        const deliveryFeeAmount = deliveryFee(roadDistance);
        res.status(200).json({ deliveryFee: deliveryFeeAmount });

    } catch (error) {
        console.error('Error calculating delivery fee:', error);
    }
    
}

export default deliveryFeeCalc;