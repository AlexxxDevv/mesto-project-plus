import { Router } from 'express';
import {
  createUser, getUsers, getUserById, updateProfile, updateAvatar,
} from '../controllers/users';

const router = Router();
router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.patch('/me', updateProfile);
router.patch('/me/avatar', updateAvatar);

export default router;
