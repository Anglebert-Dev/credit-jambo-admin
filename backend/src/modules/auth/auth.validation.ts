import { body } from 'express-validator';

export const loginValidation = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];
