import { Request, Response, NextFunction } from 'express';
import { AuthServiceAdapter, ServiceError } from '../adapters/serviceAdapters';
import { IAuthUser } from '../interfaces/services';

const authService = new AuthServiceAdapter();

export interface AuthenticatedRequest extends Request {
  user?: IAuthUser;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from cookie (auth service uses httpOnly cookies)
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const userData = await authService.verifyToken(token);
    req.user = userData;
    next();
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Allow if user is admin or has required role
    if (req.user.isAdmin || roles.includes(req.user.role)) {
      next();
      return;
    }

    res.status(403).json({ 
      message: 'You do not have permission to perform this action' 
    });
  };
};
