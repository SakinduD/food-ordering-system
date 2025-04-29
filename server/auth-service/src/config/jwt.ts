import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables

export const jwtSecret = process.env.JWT_SECRET as string;
export const jwtExpiresIn = '1d';

if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}
