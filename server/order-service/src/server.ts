import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

import './config/db';

console.log('Order service is running');

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
import orderRoutes from './routes/orderRoutes';
app.use('/order', orderRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Order Server is running on port ${PORT}`);
});