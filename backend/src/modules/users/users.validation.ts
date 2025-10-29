// Request validation schemas
import { body, query, param } from 'express-validator';

export const updateProfileValidation = [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('phoneNumber').optional().notEmpty().withMessage('Phone number cannot be empty'),
];

export const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

export const listUsersValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('role').optional().isString(),
  query('status').optional().isString(),
  query('email').optional().isString(),
  query('sortBy').optional().isString(),
  query('order').optional().isIn(['asc', 'desc']).toLowerCase(),
];

export const updateUserStatusValidation = [
  param('id').isString().notEmpty(),
  body('status').isString().notEmpty(),
];

export const userIdParamValidation = [
  param('id').isString().notEmpty(),
];
