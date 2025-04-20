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
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
import orderRoutes from './routes/orderRoutes';
app.use('/api/order', orderRoutes);



import jwt from 'jsonwebtoken';
const SECRET_KEY = process.env.JWT_SECRET as string;
const generateToken = (_id: string, role: string) => {
    const payload = {
        _id, // Adding user ID in token payload
        role, // Adding role in token payload
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '5h' });
    return token;
};
// Example Usage
const token = generateToken('67e5ab7ba2faacd3c42aa556', 'customer');
console.log('Generated Token:', token);

const PORT = process.env.PORT || 5007;

app.listen(PORT, () => {
    console.log(`Order Server is running on port ${PORT}`);
});