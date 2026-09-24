import { Router } from 'express';
import { couponController } from '../controllers/couponController';

const router = Router();

router.get('/', couponController.getAvailableCoupons);
router.post('/validate', couponController.validateCoupon);

export default router;
