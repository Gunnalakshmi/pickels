import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/create-intent', optionalAuth, paymentController.createPaymentIntent);
router.post('/verify', optionalAuth, paymentController.verifyPayment);

export default router;
