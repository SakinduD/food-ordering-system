import express, { Request, Response } from 'express';
import Restaurant from '../models/Restaurant';

const router = express.Router();

// Temporary: Create a test restaurant
router.post(
    '/test-add-restaurant',
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { name } = req.body;
        if (!name) {
          res.status(400).json({ message: 'Name is required' });
          return;
        }
  
        const restaurant = await Restaurant.create({ name });
        res.status(201).json({
          message: 'Temporary restaurant created!',
          data: restaurant,
        });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    }
  );
  
  export default router;
