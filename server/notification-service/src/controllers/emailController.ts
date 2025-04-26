import nodemailer from 'nodemailer';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { OrderRequest } from '../services/orderSerivice';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

const orderDetail = new OrderRequest();

const sendOrderConfirmationEmail = async (req: Request, res: Response): Promise<void> => {
    const orderId = req.body.orderId;
    const user = req.body.user;

    const order = await orderDetail.getOrderById(orderId);
    if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Order Confirmation',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333333;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background: linear-gradient(to right, #f97316, #fb923c);
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 8px 8px 0 0;
                    }
                    .content {
                        background: #ffffff;
                        padding: 20px;
                        border: 1px solid #dddddd;
                        border-radius: 0 0 8px 8px;
                    }
                    .order-details {
                        background: #f9fafb;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 15px 0;
                    }
                    .item {
                        padding: 10px 0;
                        border-bottom: 1px solid #eeeeee;
                    }
                    .total {
                        font-weight: bold;
                        padding-top: 15px;
                        text-align: right;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        padding-top: 20px;
                        border-top: 1px solid #eeeeee;
                        color: #666666;
                    }
                    .button {
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #f97316;
                        color: #ffffff !important;
                        text-decoration: none !important;
                        border-radius: 5px;
                        margin-top: 15px;
                    }
                    a {
                        color: #f97316;
                        text-decoration: none;
                    }
                    strong {
                        color: #333333;
                    }
                    h1, h2, h3, h4, h5, h6 {
                        color: inherit;
                        margin: 0;
                        padding: 0;
                    }
                    p {
                        margin: 10px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="color: #ffffff;">Order Confirmation</h1>
                        <p style="color: #ffffff;">Thank you for your order!</p>
                    </div>
                    <div class="content">
                        <p>Dear ${user.name},</p>
                        <p>Your order has been successfully placed. Here are your order details:</p>
                        
                        <div class="order-details">
                            <p><strong>Invoice ID:</strong> ${order.invoiceId}</p>
                            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                            <p><strong>Restaurant:</strong> ${order.restaurantName}</p>
                            <p><strong>Delivery Address:</strong> ${order.address}</p>
                            <br>

                            <h3 style="color: #333333;">Order Items:</h3>
                            ${order.orderItems.map(item => `
                                <div class="item">
                                    <p><strong>${item.itemName}</strong></p>
                                    <p>Quantity: ${item.itemQuantity} × Rs. ${item.itemPrice.toFixed(2)}</p>
                                    <p>Subtotal: Rs. ${(item.itemQuantity * item.itemPrice).toFixed(2)}</p>
                                </div>
                            `).join('')}
                            
                            <div class="total">
                                <p>Delivery Fee: Rs. ${order.deliveryFee.toFixed(2)}</p>
                                <p style="color: #f97316;">Total Amount: Rs. ${order.totalAmount.toFixed(2)}</p>
                            </div>
                        </div>

                        <p>Your order will be delivered from <strong>${order.restaurantName}</strong>.</p>
                        <p>You can track your order status in real-time through our app.</p>
                        
                        <center>
                            <a href="${process.env.CLIENT_URL}/detailed-order/${order._id}" class="button" style="color: #ffffff !important;">
                                Watch Order Status
                            </a>
                        </center>

                        <div class="footer">
                            <p>If you have any questions about your order, please <a href="mailto:support@foodfast.com" style="color: #f97316;">contact our customer support</a>.</p>
                            <p>Thank you for choosing FoodFast!</p>
                            <small style="color: #666666;">This is an automated email, please do not reply.</small>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Order confirmation email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send order confirmation email' });
    }
};

export default sendOrderConfirmationEmail;