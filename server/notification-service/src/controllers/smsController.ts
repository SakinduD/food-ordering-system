import dotenv from 'dotenv';
import twilio from 'twilio';
import { Request, Response } from 'express';
import { OrderRequest } from '../services/orderSerivice';
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

if (!accountSid || !authToken || !twilioPhoneNumber) {
    throw new Error('Twilio credentials are not set in the environment variables');
}

const orderDetail = new OrderRequest();

export const sendSMS = async (req: Request, res: Response) => {
    const orderId = req.body.orderId;
    const user = req.body.user;

    const order = await orderDetail.getOrderById(orderId);
    if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
    }

    const subTotal = order.totalAmount - order.deliveryFee;

    const message = `Hello ${user.name}, your order from ${order.restaurantName} with Invoice: ${order.invoiceId} has been successfully places. Thank you for shopping with FoodPlate!

    subtotal: LKR ${subTotal.toFixed(2)}
    Delivery Fee: LKR ${order.deliveryFee.toFixed(2)}
    Total Amount: LKR ${order.totalAmount.toFixed(2)}
    `;

    try {
        await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: order.userPhone,
        });
        res.status(200).json({ message: 'SMS sent successfully' });
    } catch (error) {
        console.error('Error sending SMS:', error);
        res.status(500).json({ message: 'Failed to send SMS' });
    }
}