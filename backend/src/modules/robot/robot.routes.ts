import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../common/asyncHandler';
import { httpResponse } from '../../common/response';
import { authBearer } from '../../middleware/auth';
import { moveRobot, resetRobot, type NavigationEnum } from './robot.service';

const router = Router();

const moveSchema = z.object({
  navigation: z.enum(['LEFT', 'RIGHT', 'UP', 'DOWN']),
});

router.post(
  '/move/',
  authBearer,
  asyncHandler(async (req, res) => {
    const body = moveSchema.parse(req.body);
    await moveRobot(req.user!, body.navigation as NavigationEnum);
    res.status(200).json(httpResponse('Move Robot', null, 200));
  }),
);

router.post(
  '/reset/',
  authBearer,
  asyncHandler(async (req, res) => {
    await resetRobot(req.user!);
    res.status(200).json(httpResponse('Reset Robot', null, 200));
  }),
);

export const robotRouter = router;
