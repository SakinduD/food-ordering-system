import md5 from "crypto-js/md5";
import { v4 as uuIdv4 } from 'uuid';
require('dotenv').config();
import { Request, Response } from 'express';

interface PaymentData {
    merchantId: string;
    return_url: string;
    cancel_url: string;
    notify_url: string;
    merchantSecret: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    orderId: string;
    items: string;
    currency: string;
    amount: string;
    userId: string;
    hash?: string;
}

let paymentData: PaymentData | null = null;

function generateHash(data: PaymentData): string {
    const { merchantId, orderId, amount, currency, merchantSecret } = data;
    const hashedSecret = md5(merchantSecret).toString().toUpperCase();
    const amountFormatted = parseFloat(amount)
      .toLocaleString('en-us', { minimumFractionDigits: 2 })
      .replace(/,/g, '');
    const hash = md5(merchantId + orderId + amountFormatted + currency + hashedSecret)
      .toString()
      .toUpperCase();
    return hash;
  }

// Create a payment
const createPayment = (req: Request, res: Response) => {
    const {
        amount,
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        currency = 'LKR',
        userId,
    } = req.body;

    const orderId = uuIdv4();

    paymentData = {
        merchantId: process.env.MERCHANT_ID || '',
        return_url: 'http://localhost:3000/',
        cancel_url: 'http://localhost:3000/',
        notify_url: 'http://localhost:3000/',
        merchantSecret: process.env.MERCHANT_SECRET || '',
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        country: 'Sri Lanka',
        orderId,
        items: 'Wallet Top-up',
        currency,
        amount,
        userId,
    };

    const hash = generateHash(paymentData);
    paymentData.hash = hash;

    res.json('paymet success for orderID: ' + paymentData.orderId); 
};

// Get the payment data
const getPaymentData = (req: Request, res: Response): void => {
    if (!paymentData) {
        res.status(404).json({ message: 'No payment data found. Please create a payment first.' });
        return;
    }
    res.json(paymentData);
    return;
};

export default {
    createPayment,
    getPaymentData,
};