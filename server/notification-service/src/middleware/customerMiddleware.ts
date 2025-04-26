import { Response, NextFunction, RequestHandler } from "express";
import { AuthenticatedRequest } from "./authMiddleware";

//middleware for check logged user is a customer
const customerMiddleware:RequestHandler = (
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
): void => {
    try{
        if (req.user && req.user.role === 'customer') {
            next();
        } else {
            res.status(403).json({message: 'You must be logged in as a customer to access this page.'});
            return;
        }
    } catch(err) {
        res.status(401).json({message: 'Authentication failed'});
        return;
    }
}

export default customerMiddleware;