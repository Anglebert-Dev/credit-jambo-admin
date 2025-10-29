import { body, query, param } from 'express-validator';


export const adminListCreditsValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isString(),
  query('sortBy').optional().isString(),
  query('order').optional().isIn(['asc', 'desc']).toLowerCase(),
];

export const creditIdParamValidation = [
  param('id').isString().notEmpty(),
];

export const rejectReasonValidation = [
  body('reason').isString().notEmpty(),
];
