import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';

import menuRoutes from './routes/menuRoutes';

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api/menu', menuRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

export default app;
