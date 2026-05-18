import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { User } from '../db/models/User';
import {
  ForbiddenException,
  TokenError,
  UnauthorizedException,
} from '../common/exceptions';
import { decodeToken } from '../token/tokens';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

function extractBearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const trimmed = header.trim();
  if (!trimmed.toLowerCase().startsWith('bearer ')) return null;
  return trimmed.slice(7).trim() || null;
}

export const authBearer: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const claims = decodeToken(token);

    if (claims.type === 'refresh') {
      throw new TokenError('Refresh token is not allowed to access the protected resources');
    }

    const user = await User.findByPk(claims.sub);
    if (!user || !user.is_active) {
      throw new UnauthorizedException('Invalid token');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const requirePermission: RequestHandler = (req, _res, next) => {
  const user = req.user;
  if (!user) {
    return next(new UnauthorizedException('Missing bearer token'));
  }
  if (user.role !== 'COMMANDER') {
    return next(new ForbiddenException('Forbidden'));
  }
  next();
};
