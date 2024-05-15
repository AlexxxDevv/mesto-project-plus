import { Router } from 'express';
import { updateAvatar, updateProfile } from '../controllers/users';

const router = Router();
router.patch('/', updateProfile);
router.patch('/avatar', updateAvatar);

export default router;
