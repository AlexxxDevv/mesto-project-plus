import { Router } from 'express';
import {
  createCard, getCards, deleteCardById, likeCard, dislikeCard,
} from '../controllers/cards';

const router = Router();
router.post('/', createCard);
router.get('/', getCards);
router.delete('/:cardId', deleteCardById);
router.put('/:cardId/likes', likeCard);
router.delete('/:cardId/likes', dislikeCard);

export default router;
