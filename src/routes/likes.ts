import { Router } from 'express';
import { likeCard, dislikeCard } from '../controllers/cards';

const router = Router();
router.put('/', likeCard);
router.delete('/', dislikeCard);

export default router;
