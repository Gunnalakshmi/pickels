import { Router } from 'express';
import { reviewController } from '../controllers/reviewController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/product/:productId', reviewController.getProductReviews);
router.post('/', optionalAuth, reviewController.submitReview);
router.post('/:reviewId/helpful', reviewController.markHelpful);

export default router;
