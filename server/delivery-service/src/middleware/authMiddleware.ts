import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'mocksecretkey';
const USE_MOCK_AUTH = process.env.USE_MOCK_AUTH === 'true';

// 🟢 Generate mock token once
const mockUser = { id: 'mockUserId', role: 'Driver' };
const mockToken = jwt.sign(mockUser, JWT_SECRET, { expiresIn: '1h' });

console.log(`🔑 Mock JWT Token: ${mockToken}`); // Show mock token in terminal

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

// ✅ Authentication Middleware (Handles Mock Token)
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  let token = req.headers.authorization?.split(' ')[1];

  if (USE_MOCK_AUTH) {
    console.log('🟢 Using mock authentication');
    token = mockToken; // Inject mock token when testing
  }

  if (!token) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  try {
    // ✅ Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ✅ Authorization Middleware (Role-Based Access Control)
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized: No user data' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Access forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};
