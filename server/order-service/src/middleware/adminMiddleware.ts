import { Response, NextFunction, RequestHandler } from "express";
import { AuthenticatedRequest } from "./authMiddleware";

//middleware for check logged user is a admin
const adminMiddleware: RequestHandler = (
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
): void => {
    try {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'You must be logged in as a head admin to access this route.' });
            return;
        }
    } catch (err) {
        res.status(401).json({ message: 'Authentication failed' });
        return;
    }
}

export default adminMiddleware;