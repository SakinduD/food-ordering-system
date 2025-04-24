import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import customerMiddleware from '../middleware/customerMiddleware';
import adminMiddleware from '../middleware/adminMiddleware';
import restaurantMiddleware from '../middleware/restaurantMiddleware';
import orderController from '../controllers/order';

const router = Router();


router.post('/placeOrder',authMiddleware, customerMiddleware, orderController.placeOrder); //only logged customer
router.get('/getOrdersByUserId',authMiddleware, customerMiddleware, orderController.getOrdersByUserId); //only logged customer

//router.get('/getOrderById/:id',authMiddleware, orderController.getOrderById); //any logged user
router.get('/getOrderById/:id', orderController.getOrderById);
router.get('/getAllOrders',authMiddleware, adminMiddleware, orderController.getAllOrders); //main admin

router.get('/getOrdersByRestaurantId',authMiddleware, restaurantMiddleware, orderController.getOrdersByRestaurantId); //restrarant owner
router.put('/updateOrderStatus/:id',authMiddleware, orderController.updateOrderStatus); //restrarant owner
router.delete('/deleteOrder/:id',authMiddleware,orderController.removeOrder); //logged user

export default router;