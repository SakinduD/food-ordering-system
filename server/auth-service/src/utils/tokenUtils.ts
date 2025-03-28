import * as jwt from 'jsonwebtoken';  // or use 'import jwt from 'jsonwebtoken';' if esModuleInterop is enabled
import { jwtSecret, jwtExpiresIn } from '../config/jwt';

// Define a type for the User object to ensure correct structure
interface User {
  _id: string;
  isAdmin: boolean;
}

export const generateToken = (user: User): string => {
  return jwt.sign({ id: user._id, isAdmin: user.isAdmin }, jwtSecret, { expiresIn: jwtExpiresIn });
};
