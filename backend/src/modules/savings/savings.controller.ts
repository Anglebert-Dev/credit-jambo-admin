import { Router, Request, Response, NextFunction } from 'express';
import { SavingsService } from './savings.service';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { successResponse } from '../../common/utils/response.util';

const router = Router();
const savingsService = new SavingsService();

/**
 * @swagger
 * /api/admin/savings/analytics:
 *   get:
 *     tags: [Savings]
 *     summary: Get savings analytics overview
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics overview
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalBalance:
 *                       type: number
 *                     totalAccounts:
 *                       type: integer
 *                     depositsCount:
 *                       type: integer
 *                     withdrawalsCount:
 *                       type: integer
 */
router.get(
  '/analytics',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await savingsService.getAnalytics();
      res.json(successResponse(stats));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
