import bcrypt from 'bcryptjs';
import { User } from '../../db/models/User';
import {
  BadRequestException,
  UnauthorizedException,
} from '../../common/exceptions';
import {
  generateAuthTokens,
  refreshTokens,
  revokeRefreshToken,
} from '../../token/service';
import type { TokenSchema } from '../../token/tokens';
import { config } from '../../config';
import { createAuditLog } from '../audit-log/auditLog.service';

export interface RegisterInput {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function register(input: RegisterInput): Promise<TokenSchema> {
  const existing = await User.findOne({ where: { email: input.email } });
  if (existing) {
    throw new BadRequestException('Email already taken');
  }

  const hashed = bcrypt.hashSync(input.password, config.bcryptSaltRounds);

  const user = await User.create({
    full_name: input.full_name,
    email: input.email,
    password: hashed,
    is_super_admin: false,
    is_active: true,
    last_login: null,
  });

  return generateAuthTokens(user.id);
}

export async function login(input: LoginInput): Promise<TokenSchema> {
  const user = await User.findOne({ where: { email: input.email } });
  if (!user) {
    throw new BadRequestException('incorrect email or password');
  }

  const ok = bcrypt.compareSync(input.password, user.password);
  if (!ok) {
    throw new UnauthorizedException('Incorrect email or password');
  }

  const tokens = await generateAuthTokens(user.id);

  user.last_login = new Date();
  await user.save();

  await createAuditLog(user.id, { action: 'LOGIN' });

  return tokens;
}

export async function refresh(refreshTokenValue: string | undefined): Promise<TokenSchema> {
  if (!refreshTokenValue) {
    throw new UnauthorizedException('invalid or expired token');
  }
  return refreshTokens(refreshTokenValue);
}

export async function logout(refreshTokenValue: string | undefined): Promise<void> {
  if (refreshTokenValue) {
    await revokeRefreshToken(refreshTokenValue);
  }
}

export interface SessionResponse {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
}

export function buildSessionResponse(user: User): SessionResponse {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
  };
}
