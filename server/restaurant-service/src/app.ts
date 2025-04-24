import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';

import menuRoutes from './routes/menuRoutes';
import orderRoutes from './routes/orderRoutes';
import restaurantRoutes from './routes/restaurantRoutes';
//import testAuthRoute from './routes/testAuthRoute';

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurants', restaurantRoutes);
//app.use('/api', testAuthRoute);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

export default app;
