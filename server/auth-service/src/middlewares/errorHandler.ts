import { Request, Response, NextFunction } from 'express';

// Error handling middleware
const errorHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  console.error('❌ Error:', err.stack);

  res.status(500).json({
    message: err.message || 'Internal Server Error',
  });
};

export default errorHandler;
