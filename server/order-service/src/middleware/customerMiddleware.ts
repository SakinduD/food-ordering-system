import { Request, Response, NextFunction, RequestHandler } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const costomerMiddleware:RequestHandler = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try{
        if (req.user && req.user.role === 'customer') {
            next();
        }
        else {
            res.status(403).json({message: 'You need to be a logged customer to access this route'});
            return;
        }
    } catch(err) {
        res.status(401).json({message: 'Authentication failed'});
        return;
    }
}

export default costomerMiddleware;