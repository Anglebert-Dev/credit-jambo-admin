import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { successResponse } from '../../common/utils/response.util';
import { AnalyticsService } from './analytics.service';

const router = Router();
const analyticsService = new AnalyticsService();

/**
 * @swagger
 * /api/admin/analytics/overview:
 *   get:
 *     tags: [Analytics]
 *     summary: Admin dashboard KPIs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview KPIs
 */
router.get(
  '/overview',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await analyticsService.getOverview();
      res.json(successResponse(data));
    } catch (error) {
      next(error);
    }
  }
);

export default router;


