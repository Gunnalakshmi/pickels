import { Router } from 'express';
import { pincodeController } from '../controllers/pincodeController';

const router = Router();

router.get('/check/:code', pincodeController.check);

export default router;
