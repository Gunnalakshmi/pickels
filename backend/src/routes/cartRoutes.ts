import { Router } from 'express';
import { cartController } from '../controllers/cartController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, cartController.getCart.bind(cartController));
router.post('/add', optionalAuth, cartController.addToCart.bind(cartController));
router.put('/items/:itemId', optionalAuth, cartController.updateQuantity.bind(cartController));
router.delete('/items/:itemId', optionalAuth, cartController.removeFromCart.bind(cartController));
router.delete('/clear', optionalAuth, cartController.clearCart.bind(cartController));

export default router;
