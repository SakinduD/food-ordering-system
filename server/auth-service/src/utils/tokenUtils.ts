import * as jwt from 'jsonwebtoken';  // or use 'import jwt from 'jsonwebtoken';' if esModuleInterop is enabled
import { jwtSecret, jwtExpiresIn } from '../config/jwt';
import { TokenPayload } from '../controllers/authController';

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
};