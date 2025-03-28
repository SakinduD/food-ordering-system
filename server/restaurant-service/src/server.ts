import app from './app';
import connectDB from './utils/db';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Database connection failed', err);
});
