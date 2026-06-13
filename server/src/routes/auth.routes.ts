import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refreshToken, logout, getMe, changePassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/register',
  [body('name').trim().notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 })],
  validate, register
);
router.post('/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate, login
);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate,
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 6 })],
  validate, changePassword
);

export default router;
