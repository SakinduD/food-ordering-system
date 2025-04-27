import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Auth Service Proxy (Port 5010)
app.use('/api/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/auth': '/api/auth'
    },
}));

// Auth Service Proxy (Port 5010)
app.use('/api/users', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/users': '/api/users'
    },
}));

// Restaurant Service Proxy (Port 5000)
app.use('/api/restaurants', createProxyMiddleware({
    target: process.env.RESTAURANT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/restaurants': '/api/restaurants'
    },
}));

// Menu Service Proxy
app.use('/api/menu', createProxyMiddleware({
    target: process.env.RESTAURANT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/menu': '/api/menu'
    },
}));

// Uploads (static files)
app.use('/uploads', createProxyMiddleware({
    target: process.env.RESTAURANT_SERVICE_URL,
    changeOrigin: true,
}));


// Order Service Proxy (Port 5001)
app.use('/api/order', createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/order': '/api/order'
    },
}));

// Order Service Proxy (Port 5001)
app.use('/api/deliveryFee', createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/deliveryFee': '/api/deliveryFee'
    },
}));

// Delivery Service Proxy (Port 5005)
app.use('/api/deliveries', createProxyMiddleware({
    target: process.env.DELIVERY_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/deliveries': '/api/deliveries'
    },
}));

// Payment Service Proxy (Port 5008)
app.use('/api/payment', createProxyMiddleware({
    target: process.env.PAYMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/payment': '/api/payment'
    },
}));

// Notification Service Proxy (Port 5020)
app.use('/api/email', createProxyMiddleware({
    target: process.env.NOTIFICATION_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/email': '/api/email'
    },
}));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Gateway Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
    console.log('Connected Services:');
    console.log('- Auth Service:', process.env.AUTH_SERVICE_URL);
    console.log('- Restaurant Service:', process.env.RESTAURANT_SERVICE_URL);
    console.log('- Order Service:', process.env.ORDER_SERVICE_URL);
    console.log('- Delivery Service:', process.env.DELIVERY_SERVICE_URL);
    console.log('- Payment Service:', process.env.PAYMENT_SERVICE_URL);
    console.log('- Notification(Email) Service:', process.env.NOTIFICATION_SERVICE_URL);
});