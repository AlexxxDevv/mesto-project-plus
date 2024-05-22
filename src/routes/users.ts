import { Router } from 'express';
import { Joi, celebrate } from 'celebrate';
import {
  getUsers, getUserById, updateProfile, updateAvatar,
  getUserByTken,
} from '../controllers/users';
import pattern from '../constants/constants';

const router = Router();
router.get('/', getUsers);

router.get('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().alphanum().length(24),
  }),
}), getUserById);

router.get('/me', getUserByTken);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(200),
  }),
}), updateProfile);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().regex(pattern).required(),
  }),
}), updateAvatar);

export default router;
