import { Router } from 'express';
import { productController } from '../controllers/productController';

const router = Router();

router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/bestsellers', productController.getBestsellers);
router.get('/banners', productController.getBanners);
router.get('/:identifier', productController.getProductBySlugOrId);

export default router;
