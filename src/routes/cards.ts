import { Router } from 'express';
import { createCard, getCards, deleteCardById } from '../controllers/cards';

const router = Router();
router.post('/', createCard);
router.get('/', getCards);
router.delete('/:id', deleteCardById);

export default router;
