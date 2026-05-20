import { Router } from 'express';
import { z } from 'zod';
import { isValidObjectId } from 'mongoose';
import { asyncHandler } from '../../common/asyncHandler';
import { httpResponse } from '../../common/response';
import { authBearer, requirePermission } from '../../middleware/auth';
import { User } from '../../db/models/User';
import { BadRequestException, NotFoundException } from '../../common/exceptions';

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
    if (!isValidObjectId(user_id)) {
      throw new BadRequestException('Invalid user id');
    }

    const body = updateRoleSchema.parse(req.body);

    const user = await User.findById(user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = body.role;
    await user.save();

    res.status(200).json(httpResponse('Update User Role', null, 200));
  }),
);

// Lightweight user list so commanders can see who exists when promoting roles.
router.get(
  '/users',
  authBearer,
  requirePermission,
  asyncHandler(async (_req, res) => {
    const users = await User.find({}, { _id: 1, email: 1, full_name: 1, role: 1 })
      .sort({ created_at: -1 })
      .limit(100)
      .lean();
    const data = users.map((u) => ({
      id: (u._id as { toString(): string }).toString(),
      email: (u as { email: string }).email,
      full_name: (u as { full_name?: string | null }).full_name ?? null,
      role: (u as { role: 'VIEWER' | 'COMMANDER' }).role,
    }));
    res.status(200).json(httpResponse('Users', data, 200));
  }),
);

export const adminRouter = router;
