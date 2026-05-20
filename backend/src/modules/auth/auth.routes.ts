import { Router, type Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../common/asyncHandler';
import { httpResponse } from '../../common/response';
import { authBearer } from '../../middleware/auth';
import { getCookies } from '../../common/cookies';
import { config } from '../../config';
import {
  buildSessionResponse,
  login,
  logout,
  refresh,
  register,
} from './auth.service';
import type { TokenSchema } from '../../token/tokens';

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

const REFRESH_COOKIE = 'refresh_token';

function setRefreshCookie(res: Response, value: string): void {
  // Cookies are sent over HTTP behind nginx in the default compose setup;
  // flip COOKIE_SECURE=1 once you put the stack behind TLS.
  const secure = process.env.COOKIE_SECURE === '1';
  res.cookie(REFRESH_COOKIE, value, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: config.jwt.refreshTokenExpiresInSeconds * 1000,
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, { path: '/' });
}

function sendTokens(res: Response, message: string, tokens: TokenSchema): void {
  setRefreshCookie(res, tokens.refresh_token);
  res.status(200).json(httpResponse(message, tokens, 200));
}

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const tokens = await login(body);
    sendTokens(res, 'Login successfully', tokens);
  }),
);

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);
    const tokens = await register(body);
    sendTokens(res, 'Register successfully', tokens);
  }),
);

router.post(
  '/refresh-token',
  asyncHandler(async (req, res) => {
    const refreshTokenValue =
      getCookies(req).refresh_token ??
      (req.body && typeof req.body.refresh_token === 'string'
        ? (req.body.refresh_token as string)
        : undefined);
    const tokens = await refresh(refreshTokenValue);
    sendTokens(res, 'Refresh tokens successfully', tokens);
  }),
);

router.post(
  '/logout',
  authBearer,
  asyncHandler(async (req, res) => {
    const refreshTokenValue =
      getCookies(req).refresh_token ??
      (req.body && typeof req.body.refresh_token === 'string'
        ? (req.body.refresh_token as string)
        : undefined);
    await logout(refreshTokenValue);
    clearRefreshCookie(res);
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
