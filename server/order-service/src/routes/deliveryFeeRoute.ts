import authMiddleware from "../middleware/authMiddleware";
import { Router } from "express";
import deliveryFeeCalc from "../controllers/deliveryFeeController";

const router = Router();

router.post("/", authMiddleware, deliveryFeeCalc);

export default router;