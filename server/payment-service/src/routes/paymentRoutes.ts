import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import customerMiddleware from '../middleware/customerMiddleware';
import paymentController from '../controllers/paymentController';
const router = Router();

router.post('/createPayment', authMiddleware, customerMiddleware, paymentController.createPayment); //only logged customer
router.get('/', authMiddleware, customerMiddleware, paymentController.getPaymentData); //any logged user

export default router;