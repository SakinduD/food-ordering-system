import sendOrderConfirmationEmail from "../controllers/emailController";
import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import customerMiddleware from "../middleware/customerMiddleware";

const router = Router();

router.post("/orderConfirmationEmail", authMiddleware, customerMiddleware, sendOrderConfirmationEmail); //only logged customer

export default router;