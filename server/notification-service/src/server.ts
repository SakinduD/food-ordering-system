import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
import emailRoutes from './routes/emailRoutes';
app.use('/api/email', emailRoutes);


const PORT = process.env.PORT || 5020;

app.listen(PORT, () => {
    console.log(`Notification Server is running on port ${PORT}`);
});