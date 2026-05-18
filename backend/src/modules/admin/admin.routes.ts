import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../common/asyncHandler';
import { httpResponse } from '../../common/response';
import { authBearer, requirePermission } from '../../middleware/auth';
import { User } from '../../db/models/User';
import { NotFoundException } from '../../common/exceptions';

const router = Router();

const updateRoleSchema = z.object({
  role: z.enum(['VIEWER', 'COMMANDER']),
});

router.post(
  '/user/:user_id/role',
  authBearer,
  requirePermission,
  asyncHandler(async (req, res) => {
    const { user_id } = req.params;
    const body = updateRoleSchema.parse(req.body);

    const user = await User.findByPk(user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = body.role;
    await user.save();

    res.status(200).json(httpResponse('Update User Role', null, 200));
  }),
);

export const adminRouter = router;
