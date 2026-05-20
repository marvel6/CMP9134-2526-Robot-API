import bcrypt from 'bcryptjs';
import { User, type UserHydrated } from '../../db/models/User';
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

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function register(input: RegisterInput): Promise<TokenSchema> {
  const email = normaliseEmail(input.email);
  const existing = await User.findOne({ email });
  if (existing) {
    throw new BadRequestException('Email already taken');
  }

  const hashed = bcrypt.hashSync(input.password, config.bcryptSaltRounds);

  const user = await User.create({
    full_name: input.full_name,
    email,
    password: hashed,
    is_super_admin: false,
    is_active: true,
    last_login: null,
    role: 'VIEWER',
  });

  return generateAuthTokens(user._id.toString());
}

export async function login(input: LoginInput): Promise<TokenSchema> {
  const email = normaliseEmail(input.email);
  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestException('Incorrect email or password');
  }

  const ok = bcrypt.compareSync(input.password, user.password);
  if (!ok) {
    throw new UnauthorizedException('Incorrect email or password');
  }

  if (!user.is_active) {
    throw new UnauthorizedException('Account is disabled');
  }

  const tokens = await generateAuthTokens(user._id.toString());

  user.last_login = new Date();
  await user.save();

  await createAuditLog(user._id.toString(), { action: 'LOGIN' });

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

export function buildSessionResponse(user: UserHydrated): SessionResponse {
  return {
    id: user._id.toString(),
    full_name: user.full_name,
    email: user.email,
    role: user.role,
  };
}
