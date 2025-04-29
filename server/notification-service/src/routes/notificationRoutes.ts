import sendOrderConfirmationEmail from "../controllers/emailController";
import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import customerMiddleware from "../middleware/customerMiddleware";
import { sendSMS } from "../controllers/smsController";

const router = Router();

router.post("/orderConfirmationEmail", authMiddleware, customerMiddleware, sendOrderConfirmationEmail); //only logged customer
router.post("/sendSMS", authMiddleware, customerMiddleware, sendSMS); //only logged customer

export default router;