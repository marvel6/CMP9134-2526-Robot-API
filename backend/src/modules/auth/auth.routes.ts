import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../common/asyncHandler';
import { httpResponse } from '../../common/response';
import { authBearer } from '../../middleware/auth';
import { getCookies } from '../../common/cookies';
import {
  buildSessionResponse,
  login,
  logout,
  refresh,
  register,
} from './auth.service';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).max(64),
});

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const tokens = await login(body);
    res.status(200).json(httpResponse('Login successfully', tokens, 200));
  }),
);

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);
    const tokens = await register(body);
    res.status(200).json(httpResponse('Register successfully', tokens, 200));
  }),
);

router.post(
  '/refresh-token',
  asyncHandler(async (req, res) => {
    const refreshTokenValue = getCookies(req).refresh_token;
    const tokens = await refresh(refreshTokenValue);
    res.status(200).json(httpResponse('Refresh tokens successfully', tokens, 200));
  }),
);

router.post(
  '/logout',
  authBearer,
  asyncHandler(async (req, res) => {
    await logout(getCookies(req).refresh_token);
    res.status(200).json(httpResponse('Logged out successfully', null, 200));
  }),
);

router.get(
  '/session',
  authBearer,
  asyncHandler(async (req, res) => {
    const user = req.user!;
    res
      .status(200)
      .json(httpResponse('User Session', buildSessionResponse(user), 200));
  }),
);

export const authRouter = router;
