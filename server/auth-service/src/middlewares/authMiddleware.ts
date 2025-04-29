import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { jwtSecret } from '../config/jwt';

// Extend Express Request to include `user`
interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Protect route middleware
export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
      res.status(401).json({ message: "Authentication failed: No token provided" });
      return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
      res.status(401).json({ message: "Authentication failed [No Token]" });
      return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Forbidden' });
  }
};

// Admin-only route middleware
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !req.user.isAdmin) {
    res.status(403).json({ error: 'Admin access only' });
    return;
  }
  next();
};
