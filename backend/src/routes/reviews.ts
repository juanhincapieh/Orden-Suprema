import { Router } from 'express';
import { getAllReviews } from '../controllers/reviewsController';

const router = Router();

router.get('/', getAllReviews);

export default router;
