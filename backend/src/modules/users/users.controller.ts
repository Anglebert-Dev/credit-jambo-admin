
import { Router, Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { updateProfileValidation, changePasswordValidation, listUsersValidation, userIdParamValidation, updateUserStatusValidation } from './users.validation';
import { successResponse, paginatedResponse } from '../../common/utils/response.util';

const router = Router();
const usersService = new UsersService();

/**
 * @swagger
 * /api/admin/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     role:
 *                       type: string
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get(
  '/profile',
  authMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      const result = await usersService.getProfile(req.user!.sub);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Users]
 *     summary: List users
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
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Users listed
 */
router.get(
  '/users',
  authMiddleware,
  listUsersValidation,
  validationMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt((req.query.page as string) || '1');
      const limit = parseInt((req.query.limit as string) || '10');
      const role = (req.query.role as string) || undefined;
      const status = (req.query.status as string) || undefined;
      const email = (req.query.email as string) || undefined;
      const sortBy = (req.query.sortBy as string) || undefined;
      const order = (req.query.order as 'asc' | 'desc') || undefined;

      const result = await usersService.listUsers({ page, limit, role, status, email, sortBy, order });
      res.json(paginatedResponse(result.data, result.pagination.page, result.pagination.limit, result.pagination.total));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user details
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
 *         description: User details
 */
router.get(
  '/users/:id',
  authMiddleware,
  userIdParamValidation,
  validationMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await usersService.getUserDetails(req.params.id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   patch:
 *     tags: [Users]
 *     summary: Update user status
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch(
  '/users/:id/status',
  authMiddleware,
  updateUserStatusValidation,
  validationMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await usersService.updateUserStatus(req.params.id, req.body.status);
      res.json(successResponse(result, 'Status updated'));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Soft delete user
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
 *         description: User soft-deleted
 */
router.delete(
  '/users/:id',
  authMiddleware,
  userIdParamValidation,
  validationMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await usersService.softDeleteUser(req.params.id);
      res.json(successResponse(null, 'User deleted'));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/admin/users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       409:
 *         description: Phone number already in use
 */
router.put(
  '/profile',
  authMiddleware,
  updateProfileValidation,
  validationMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      const result = await usersService.updateProfile(req.user!.sub, req.body);
      res.json(successResponse(result, 'Profile updated successfully'));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/admin/users/password:
 *   patch:
 *     tags: [Users]
 *     summary: Change user password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized or incorrect current password
 *       404:
 *         description: User not found
 */
router.patch(
  '/password',
  authMiddleware,
  changePasswordValidation,
  validationMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      await usersService.changePassword(req.user!.sub, req.body);
      res.json(successResponse(null, 'Password changed successfully'));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
