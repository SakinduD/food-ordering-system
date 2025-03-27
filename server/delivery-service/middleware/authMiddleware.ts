import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const USE_MOCK_AUTH = process.env.USE_MOCK_AUTH === 'true';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  if (USE_MOCK_AUTH) {
    req.user = { userId: 'mockUserId', role: 'RestaurantOwner' }; // Mock user data
    next();
  } else {
    // Real authentication logic here
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Access forbidden' });
      return;
    }
    next();
  };
};