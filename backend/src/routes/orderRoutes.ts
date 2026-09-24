import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/', optionalAuth, orderController.createOrder);
router.get('/', authenticate, orderController.getOrders);
router.get('/:id', optionalAuth, orderController.getOrderById);
router.post('/:id/cancel', optionalAuth, orderController.cancelOrder);
router.get('/:id/invoice', optionalAuth, orderController.getInvoice);

export default router;
