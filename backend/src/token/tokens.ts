import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { TokenBackendError, TokenError } from '../common/exceptions';

export type TokenType = 'access' | 'refresh';

export interface TokenClaims {
  sub: string;
  type: TokenType;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  [k: string]: unknown;
}

export interface TokenSchema {
  access_token: string;
  refresh_token: string;
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function encodeToken(claims: TokenClaims): string {
  return jwt.sign(claims, config.jwt.secret, {
    algorithm: config.jwt.algorithm,
  } as SignOptions);
}

export function decodeToken(token: string): TokenClaims {
  try {
    const payload = jwt.verify(token, config.jwt.secret, {
      algorithms: [config.jwt.algorithm],
    }) as JwtPayload;

    if (typeof payload !== 'object' || payload === null) {
      throw new TokenBackendError('Invalid token');
    }

    const { sub, type, exp, iat, iss, jti, ...rest } = payload;

    if (typeof sub !== 'string') {
      throw new TokenBackendError('Invalid token subject');
    }
    if (type !== 'access' && type !== 'refresh') {
      throw new TokenBackendError(`Invalid token type: ${String(type)}`);
    }

    return {
      sub,
      type,
      exp: typeof exp === 'number' ? exp : 0,
      iat: typeof iat === 'number' ? iat : 0,
      iss: typeof iss === 'string' ? iss : config.appIss,
      jti: typeof jti === 'string' ? jti : '',
      ...rest,
    };
  } catch (err) {
    if (err instanceof TokenBackendError) throw err;
    if (err instanceof jwt.TokenExpiredError) {
      throw new TokenBackendError('Token expired');
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new TokenBackendError(`Invalid token: ${err.message}`);
    }
    throw new TokenBackendError('Invalid token');
  }
}

export function buildRefreshTokenClaims(userId: string): TokenClaims {
  const issuedAt = nowSeconds();
  return {
    sub: userId,
    type: 'refresh',
    iat: issuedAt,
    exp: issuedAt + config.jwt.refreshTokenExpiresInSeconds,
    iss: config.appIss,
    jti: uuidv4(),
  };
}

export function buildAccessTokenClaims(refresh: TokenClaims): TokenClaims {
  const issuedAt = nowSeconds();
  return {
    sub: refresh.sub,
    type: 'access',
    iat: issuedAt,
    exp: issuedAt + config.jwt.accessTokenExpiresInSeconds,
    iss: refresh.iss,
    jti: uuidv4(),
  };
}

export function ensureNotExpired(claims: TokenClaims): void {
  if (claims.exp && claims.exp < nowSeconds()) {
    throw new TokenError('Token has expired');
  }
}
