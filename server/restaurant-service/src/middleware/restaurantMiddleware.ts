import { Response, NextFunction, RequestHandler } from "express";
import { AuthenticatedRequest } from "./authMiddleware";

//middleware for check logged user is a restraurant owner
const restaurantMiddleware: RequestHandler = (
    req: AuthenticatedRequest, 
    res: Response, next: NextFunction
): void => {
    try {
        if (req.user && req.user.role === 'restaurantOwner') {
            next();
        } else {
            res.status(403).json({ message: 'You must be logged in as a restaurant owner to access this route.' });
            return;
        }
    } catch (err) {
        res.status(401).json({ message: 'Authentication failed' });
        return;
    }
}

export default restaurantMiddleware;