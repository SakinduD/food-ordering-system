import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Temporary login to generate a JWT token
router.post('/test-login', (req: Request, res: Response) => {
  const fakeUser = {
    id: '200001',
    name: 'Sunil Srimal',
    role: 'admin'
  };

  const token = jwt.sign(fakeUser, process.env.JWT_SECRET!, {
    expiresIn: '1h'
  });

  res.json({
    message: 'Temporary token generated successfully!',
    token
  });
});

export default router;
