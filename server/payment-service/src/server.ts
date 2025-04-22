import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

console.log('Order service is running');

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
import paymentRoutes from './routes/paymentRoutes';
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Payment Server is running on port ${PORT}`);
});