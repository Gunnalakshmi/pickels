import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Protect all admin routes with authentication and role-based checks
router.use(authenticate, requireAdmin);

// Dashboard Metrics
router.get('/metrics', adminController.getMetrics);

// Order Management
router.get('/orders', adminController.getOrders);
router.put('/orders/:orderId/status', adminController.updateOrderStatus);

// Product Catalog Management
router.get('/products', adminController.getProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Inventory Management
router.get('/inventory', adminController.getInventory);
router.put('/inventory/:variantId', adminController.updateStock);

// Coupons Management
router.get('/coupons', adminController.getCoupons);
router.post('/coupons', adminController.createCoupon);

// Customer Management
router.get('/customers', adminController.getCustomers);

// Review Moderation
router.get('/reviews', adminController.getReviews);
router.put('/reviews/:reviewId/moderate', adminController.moderateReview);

export default router;
