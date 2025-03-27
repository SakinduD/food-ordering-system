import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";

// Define interface for decoded token
interface JwtPayload {
  id: string;
  role: string;
}

// Extend Request type to include `user`
interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

const authMiddleware: RequestHandler = (
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
): void => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET as string;
    if (!JWT_SECRET) {
        res.status(500).json({ message: "Internal Server Error: JWT_SECRET not set" });
        return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: "Authentication failed: No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Authentication failed" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Authentication failed" });
  }
};

export default authMiddleware;
