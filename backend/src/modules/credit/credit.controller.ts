import { Router, Request, Response, NextFunction } from 'express';
import { CreditService } from './credit.service';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { adminListCreditsValidation, creditIdParamValidation, rejectReasonValidation } from './credit.validation';
import { successResponse, paginatedResponse } from '../../common/utils/response.util';

const router = Router();
const creditService = new CreditService();

/**
 * @swagger
 * /api/admin/credit/requests:
 *   get:
 *     tags: [Credit]
 *     summary: List all credit requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Successfully retrieved all credit requests
 */
router.get(
  '/requests',
  authMiddleware,
  adminListCreditsValidation,
  validationMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt((req.query.page as string) || '1');
      const limit = parseInt((req.query.limit as string) || '10');
      const status = (req.query.status as string) || undefined;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const order = (req.query.order as 'asc' | 'desc') || 'desc';

      const result = await creditService.adminListRequests(page, limit, status, sortBy, order);
      res.json(paginatedResponse(result.requests, result.page, result.limit, result.total));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/admin/credit/requests/{id}:
 *   get:
 *     tags: [Credit]
 *     summary: Get credit request details with user and repayments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Credit request detail
 */
router.get(
  '/requests/:id',
  authMiddleware,
  creditIdParamValidation,
  validationMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await creditService.adminGetRequestDetails(req.params.id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/admin/credit/requests/{id}/approve:
 *   patch:
 *     tags: [Credit]
 *     summary: Approve credit request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Approved
 */
router.patch(
  '/requests/:id/approve',
  authMiddleware,
  creditIdParamValidation,
  validationMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      const result = await creditService.approveRequest(req.params.id, req.user!.sub);
      res.json(successResponse(result, 'Approved'));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/admin/credit/requests/{id}/reject:
 *   patch:
 *     tags: [Credit]
 *     summary: Reject credit request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rejected
 */
router.patch(
  '/requests/:id/reject',
  authMiddleware,
  [...creditIdParamValidation, ...rejectReasonValidation],
  validationMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      const result = await creditService.rejectRequest(req.params.id, req.user!.sub, (req.body as any).reason);
      res.json(successResponse(result, 'Rejected'));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
