import express from 'express';
import cors from 'cors';

import menuRoutes from './routes/menuRoutes';
import orderRoutes from './routes/orderRoutes';
import restaurantRoutes from './routes/restaurantRoutes';
import testAuthRoute from './routes/testAuthRoute';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api', testAuthRoute);


export default app;
